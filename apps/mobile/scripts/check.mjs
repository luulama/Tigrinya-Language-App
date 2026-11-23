import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { mobile, root, sha } from "./build.mjs";
import { capacitorConfig, mobileConfig, placeholderId } from "./config.mjs";

const manifest = JSON.parse(
  await readFile(join(mobile, "www/mobile/build-manifest.json"), "utf8"),
);
const config = mobileConfig({
  MOBILE_ENV: manifest.config.environment,
  MOBILE_API_URL: manifest.config.apiUrl || "",
  MOBILE_APP_ID: manifest.config.appId,
  MOBILE_APP_NAME: manifest.config.appName,
  MOBILE_ALLOW_PRODUCTION_API:
    manifest.config.environment === "production" ? "yes" : "",
});
assert.deepEqual(manifest.config, config, "Invalid bundled environment");
const cap = JSON.parse(
  await readFile(join(mobile, "capacitor.config.json"), "utf8"),
);
assert.deepEqual(
  cap,
  capacitorConfig(config),
  "Capacitor configuration differs from the checked bundle",
);
assert.equal(
  cap.server.url,
  undefined,
  "Never load a remote website as the app",
);
const expected = JSON.parse(
  execFileSync("python3", [join(mobile, "scripts/inventory.py")], {
    encoding: "utf8",
  }),
);
assert.deepEqual(
  Object.keys(manifest.sources),
  expected,
  "Runtime inventory changed; rebuild the mobile target",
);
for (const [name, hash] of Object.entries(manifest.sources)) {
  assert.equal(
    sha(await readFile(join(root, name))),
    hash,
    `Source changed after packaging: ${name}`,
  );
  if (!name.endsWith(".html"))
    assert.equal(
      sha(await readFile(join(mobile, "www/practice", name))),
      hash,
      `Learning content was modified while copying: ${name}`,
    );
}
for (const [name, hash] of Object.entries(manifest.outputs))
  assert.equal(
    sha(await readFile(join(mobile, "www", name))),
    hash,
    `Bundle changed after build: ${name}`,
  );
async function walk(folder) {
  const files = [];
  for (const item of await readdir(folder, { withFileTypes: true })) {
    const path = join(folder, item.name);
    if (item.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}
const bundled = await walk(join(mobile, "www"));
const mobileSources = await walk(join(mobile, "src"));
assert.equal(
  mobileSources.length,
  Object.keys(manifest.mobileSources).length,
  "Mobile source inventory changed; rebuild",
);
for (const [name, hash] of Object.entries(manifest.mobileSources))
  assert.equal(
    sha(await readFile(join(mobile, "src", name))),
    hash,
    `Mobile shell changed after build: ${name}`,
  );
assert.equal(
  bundled.length,
  Object.keys(manifest.outputs).length + 1,
  "Unexpected generated bundle files",
);
assert(
  !bundled.some((path) =>
    /(?:^|\/)\.env|(?:^|\/)device\.local\.json$|\.(?:pem|key|p12|p8|mobileprovision)$/.test(
      path,
    ),
  ),
  "Secret-bearing file in bundle",
);
for (const file of [
  ...(await walk(join(mobile, "src"))),
  ...(await walk(join(mobile, "scripts"))),
].filter((path) => /\.(m?js)$/.test(path)))
  execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
execFileSync("python3", [join(mobile, "scripts/check-links.py")], {
  stdio: "inherit",
});
const project = await readFile(
  join(mobile, "ios/App/App.xcodeproj/project.pbxproj"),
  "utf8",
);
for (const name of [
  "PrivateVoicePlugin.swift",
  "MobileBridgeViewController.swift",
])
  assert(
    project.includes(`${name} in Sources`),
    `${name} not compiled into iOS`,
  );
assert.equal(
  (
    project.match(
      new RegExp(
        `PRODUCT_BUNDLE_IDENTIFIER = ${config.appId.replaceAll(".", "\\.")};`,
        "g",
      ),
    ) || []
  ).length,
  2,
  "Native bundle IDs differ; run ios:prepare with the same environment",
);
const storyboard = await readFile(
  join(mobile, "ios/App/App/Base.lproj/Main.storyboard"),
  "utf8",
);
assert(
  storyboard.includes('customClass="MobileBridgeViewController"'),
  "Native recording bridge is not registered",
);
if (process.argv.includes("--native")) {
  const nativePublic = join(mobile, "ios/App/App/public");
  assert.equal(
    sha(await readFile(join(nativePublic, "mobile/build-manifest.json"))),
    sha(await readFile(join(mobile, "www/mobile/build-manifest.json"))),
    "iOS has a stale bundle; run ios:prepare",
  );
  for (const [name, hash] of Object.entries(manifest.outputs))
    assert.equal(
      sha(await readFile(join(nativePublic, name))),
      hash,
      `Stale or damaged native asset: ${name}`,
    );
  const nativeConfig = JSON.parse(
    await readFile(join(mobile, "ios/App/App/capacitor.config.json"), "utf8"),
  );
  for (const key of Object.keys(cap))
    assert.deepEqual(
      nativeConfig[key],
      cap[key],
      `Native configuration mismatch: ${key}`,
    );
  console.log(
    "PASS: synced iOS assets and native configuration match the checked mobile build.",
  );
}
console.log(
  `PASS: ${expected.length} preserved source files, ${bundled.length} bundled files, JS syntax, configuration and native wiring.`,
);
if (process.argv.includes("--release")) {
  const icon = JSON.parse(
    await readFile(join(mobile, "icon-review.json"), "utf8"),
  );
  const blockers = [];
  if (config.appId === placeholderId || config.appId.startsWith("com.example."))
    blockers.push("Owner bundle identity is missing.");
  if (icon.status !== "approved" || !icon.ownerApproval)
    blockers.push("App icons are template placeholders.");
  if (config.contentReview !== "approved")
    blockers.push(
      "Qualified native content/audio review is pending; this slice is not a release.",
    );
  if (blockers.length) {
    console.error(
      "RELEASE BLOCKED:\n" +
        blockers.map((message) => "- " + message).join("\n"),
    );
    process.exitCode = 1;
  }
}
