import {
  readFile,
  writeFile,
  mkdir,
  cp,
  readdir,
  rm,
  rename,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readMobileConfig, capacitorConfig } from "./config.mjs";

export const mobile = fileURLToPath(new URL("../", import.meta.url));
export const root = fileURLToPath(new URL("../../../", import.meta.url));
export const sha = (value) => createHash("sha256").update(value).digest("hex");

export function policies(config) {
  return `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:; connect-src 'self'${config.apiUrl ? " " + config.apiUrl : ""}; object-src 'none'; base-uri 'none'; form-action 'none'`;
}

export function decorate(html, relativeRoot, config) {
  if (!html.includes("</head>") || !html.includes("<body"))
    throw Error("Mobile HTML must contain a head and body.");
  return html
    .replace(
      /(<meta\s+name=["']viewport["']\s+content=["'])([^"']*)(["']\s*\/?>)/i,
      (_, before, content, after) =>
        before + content + ", viewport-fit=cover" + after,
    )
    .replace(
      "</head>",
      `<meta http-equiv="Content-Security-Policy" content="${policies(config)}"><meta name="referrer" content="no-referrer"><link rel="stylesheet" href="${relativeRoot}mobile/mobile.css"><script type="module" src="${relativeRoot}mobile/app.js"></script></head>`,
    );
}

export async function build(env = process.env) {
  const config = await readMobileConfig(env); // Validate before touching any output.
  const files = JSON.parse(
    execFileSync("python3", [join(mobile, "scripts/inventory.py")], {
      cwd: root,
      encoding: "utf8",
    }),
  );
  const staging = join(mobile, ".build/staging");
  await mkdir(join(mobile, ".build"), { recursive: true });
  await rm(staging, { recursive: true, force: true }); // Only our generated staging directory.
  const manifest = {
    schema: 1,
    config,
    sources: {},
    mobileSources: {},
    outputs: {},
  };
  for (const name of files) {
    const input = await readFile(join(root, name));
    manifest.sources[name] = sha(input);
    const output = join(staging, "practice", name);
    await mkdir(dirname(output), { recursive: true });
    let data = input;
    if (name.endsWith(".html")) {
      const relativeRoot =
        relative(dirname(output), staging).replaceAll("\\", "/") + "/";
      data = Buffer.from(
        decorate(input.toString("utf8"), relativeRoot, config),
      );
    }
    await writeFile(output, data);
    manifest.outputs["practice/" + name] = sha(data);
  }
  await cp(join(mobile, "src"), staging, { recursive: true });
  async function recordMobileSources(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = join(folder, entry.name);
      if (entry.isDirectory()) await recordMobileSources(path);
      else
        manifest.mobileSources[
          relative(join(mobile, "src"), path).replaceAll("\\", "/")
        ] = sha(await readFile(path));
    }
  }
  await recordMobileSources(join(mobile, "src"));
  for (const name of ["app.js", "voice.js"]) {
    const path = join(staging, "mobile", name);
    await writeFile(
      path,
      (await readFile(path, "utf8")).replaceAll(
        '"@capacitor/core"',
        '"./capacitor.js"',
      ),
    );
  }
  await mkdir(join(staging, "mobile"), { recursive: true });
  await cp(
    join(mobile, "node_modules/@capacitor/core/dist/index.js"),
    join(staging, "mobile/capacitor.js"),
  );
  await cp(
    join(mobile, "node_modules/@capacitor/core/LICENSE"),
    join(staging, "mobile/CAPACITOR-LICENSE.txt"),
  );
  await writeFile(
    join(staging, "mobile/config.js"),
    `export default Object.freeze(${JSON.stringify(config)});\n`,
  );
  for (const name of ["index.html", "voice.html", "settings.html"]) {
    const path = join(staging, name);
    await writeFile(path, decorate(await readFile(path, "utf8"), "", config));
  }
  async function collect(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = join(folder, entry.name);
      if (entry.isDirectory()) await collect(path);
      else
        manifest.outputs[relative(staging, path).replaceAll("\\", "/")] = sha(
          await readFile(path),
        );
    }
  }
  await collect(staging);
  await writeFile(
    join(staging, "mobile/build-manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  await rm(join(mobile, "www"), { recursive: true, force: true }); // Disposable bundle, never source/user data.
  await rename(staging, join(mobile, "www"));
  await writeFile(
    join(mobile, "capacitor.config.json"),
    JSON.stringify(capacitorConfig(config), null, 2) + "\n",
  );
  console.log(
    `Built ${files.length} existing runtime/review files into apps/mobile/www. Mode: ${config.environment}. No API request was made.`,
  );
  return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await build();
