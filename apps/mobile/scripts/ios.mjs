import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { build, mobile } from "./build.mjs";

const action = process.argv[2];
if (!["prepare", "open", "build", "build-device"].includes(action))
  throw Error("Use prepare, open, build or build-device.");
const manifest = await build();
const project = join(mobile, "ios/App/App.xcodeproj/project.pbxproj");
let pbx = await readFile(project, "utf8");
if ((pbx.match(/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g) || []).length !== 2)
  throw Error(
    "Review the native target bundle ID configuration before preparing iOS.",
  );
pbx = pbx.replace(
  /PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g,
  `PRODUCT_BUNDLE_IDENTIFIER = ${manifest.config.appId};`,
);
await writeFile(project, pbx);
const plist = join(mobile, "ios/App/App/Info.plist");
const xml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
await writeFile(
  plist,
  (await readFile(plist, "utf8")).replace(
    /(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/,
    (_, before, after) => before + xml(manifest.config.appName) + after,
  ),
);
function run(command, args) {
  const result = spawnSync(command, args, { cwd: mobile, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
run(process.execPath, [
  "node_modules/@capacitor/cli/bin/capacitor",
  "sync",
  "ios",
]);
run(process.execPath, ["scripts/check.mjs", "--native"]);
if (action === "open")
  run(process.execPath, [
    "node_modules/@capacitor/cli/bin/capacitor",
    "open",
    "ios",
  ]);
if (action === "build" || action === "build-device")
  run("xcodebuild", [
    "-project",
    "ios/App/App.xcodeproj",
    "-scheme",
    "App",
    "-configuration",
    "Debug",
    "-sdk",
    action === "build-device" ? "iphoneos" : "iphonesimulator",
    "-destination",
    action === "build-device"
      ? "generic/platform=iOS"
      : "generic/platform=iOS Simulator",
    "-derivedDataPath",
    action === "build-device"
      ? ".build/DerivedData-device"
      : ".build/DerivedData",
    "-clonedSourcePackagesDirPath",
    ".build/SourcePackages",
    "CODE_SIGNING_ALLOWED=NO",
    "CODE_SIGNING_REQUIRED=NO",
    "build",
  ]);
