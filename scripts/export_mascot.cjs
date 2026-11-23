/* Export the very same renderer used by the app, so static artwork cannot drift. */
const fs = require("node:fs"),
  vm = require("node:vm"),
  path = require("node:path");
const root = path.join(__dirname, ".."),
  ctx = vm.createContext({});
vm.runInContext(
  fs.readFileSync(path.join(root, "shared/mascot/neri.js"), "utf8"),
  ctx,
);
const dir = path.join(root, "shared/mascot/assets");
fs.mkdirSync(dir, { recursive: true });
function save(name, svg, title) {
  const art = svg
    .replaceAll("data-neri-mouth>", 'data-neri-mouth="">')
    .replace('aria-hidden="true"', 'role="img" aria-label="' + title + '"')
    .replace(
      /(<svg[^>]*>)/,
      "$1<title>" +
        title +
        "</title><desc>Original Neri bear artwork or separately labelled schematic human lip guide. Project-created SVG; no third-party illustration assets.</desc>",
    )
    .replace(/[ \t]+$/gm, "");
  fs.writeFileSync(path.join(dir, name + ".svg"), art + "\n");
}
for (const state of ctx.Neri.states)
  save("neri-" + state, ctx.Neri.svg(state), "Neri: " + state);
const data = JSON.parse(
  fs.readFileSync(
    path.join(root, "shared/content-review/articulation.json"),
    "utf8",
  ),
);
for (const p of data.profiles)
  p.steps.forEach((s, i) =>
    save(
      p.id + "-" + (i + 1),
      ctx.Neri.svg("demonstrating", true, s.pose),
      "Neri lip component: " +
        p.ipa +
        ", " +
        s.label +
        "; native review pending",
    ),
  );
console.log(
  "Exported 9 bear expression and 9 human lip-step SVG assets from the production renderer.",
);
