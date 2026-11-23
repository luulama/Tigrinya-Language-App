import { execFileSync } from "node:child_process";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { mobile } from "./build.mjs";

// A compiler check against the real iOS SDK/frameworks; not a simulator launch or Xcode app build.
const sdk = execFileSync(
  "xcrun",
  ["--sdk", "iphonesimulator", "--show-sdk-path"],
  { encoding: "utf8" },
).trim();
const arch = process.arch === "arm64" ? "arm64" : "x86_64";
const args = [
  "swiftc",
  "-typecheck",
  "-sdk",
  sdk,
  "-target",
  `${arch}-apple-ios15.0-simulator`,
  "-module-cache-path",
  join(mobile, ".build/SwiftModuleCache"),
];
for (const name of ["Capacitor", "Cordova"]) {
  const framework = join(
    mobile,
    `.build/SourcePackages/artifacts/capacitor-swift-pm/${name}/${name}.xcframework/ios-arm64_x86_64-simulator`,
  );
  try {
    await access(framework);
  } catch {
    throw Error(
      "Resolve the pinned Swift package first: see README.md native compiler checks.",
    );
  }
  args.push("-F", framework);
}
args.push(
  "ios/App/App/MobileBridgeViewController.swift",
  "ios/App/App/PrivateVoicePlugin.swift",
);
execFileSync("xcrun", args, { cwd: mobile, stdio: "inherit" });
console.log(
  "PASS: native bridge and private recorder type-check against the iOS SDK and Capacitor 8.6.2.",
);
