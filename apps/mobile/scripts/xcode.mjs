import { spawnSync } from "node:child_process";
import { statfs } from "node:fs/promises";
import { mobile } from "./build.mjs";

export const GiB = 1024 ** 3;
// Project safety headroom for download, expansion, Xcode output and the running OS.
// This is not an Apple-published installation size or a guarantee that every runtime fits.
export const minimumInstallFreeBytes = 30 * GiB;

export function installationPlan(state) {
  if (!state.xcodeVersion || !state.sdkVersion)
    return {
      status: "blocked",
      reason:
        "Select a full Xcode installation with an iOS SDK. Open Xcode > Settings > Locations > Command Line Tools.",
    };
  if (!state.firstLaunchReady)
    return {
      status: "blocked",
      reason:
        "Open Xcode and complete its first-launch tasks yourself. No licence is accepted automatically.",
    };
  if (!/^\d+\.\d+(?:\.\d+)?$/.test(state.sdkVersion))
    return {
      status: "blocked",
      reason: "The installed simulator SDK version could not be validated.",
    };
  if (state.runtimeQueryAvailable === false)
    return {
      status: "blocked",
      reason:
        "Simulator runtime status could not be read. Open Xcode > Settings > Components to inspect it; no download is started blindly.",
    };
  if (state.runtimeInstalled)
    return {
      status: "installed",
      reason: `The matching iOS ${state.sdkVersion} simulator runtime is already installed.`,
    };
  if (!state.downloadCommandAvailable)
    return {
      status: "blocked",
      reason:
        "This Xcode does not expose -downloadPlatform. Use Xcode > Settings > Components > iOS > Get.",
    };
  if (
    !Number.isFinite(state.freeBytes) ||
    state.freeBytes < minimumInstallFreeBytes
  )
    return {
      status: "blocked",
      reason: `Only ${Number.isFinite(state.freeBytes) ? (state.freeBytes / GiB).toFixed(1) : "unknown"} GiB free. This project requires 30 GiB free before starting a runtime download. Free space yourself; no files are removed automatically.`,
    };
  if (!["arm64", "x64"].includes(state.arch))
    return {
      status: "blocked",
      reason:
        "Unsupported Mac architecture for automatic runtime installation.",
    };
  return {
    status: "ready",
    command: [
      "xcodebuild",
      "-downloadPlatform",
      "iOS",
      "-buildVersion",
      state.sdkVersion,
      "-architectureVariant",
      state.arch === "arm64" ? "arm64" : "universal",
    ],
  };
}

export async function probeXcode() {
  const read = (command, args, includeStderr = false) => {
    const result = spawnSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 20000,
    });
    if (result.error || result.status !== 0) return null;
    return (result.stdout + (includeStderr ? result.stderr : "")).trim();
  };
  const versionText = read("xcodebuild", ["-version"]);
  const sdkVersion = read("xcrun", [
    "--sdk",
    "iphonesimulator",
    "--show-sdk-version",
  ]);
  const help = read("xcodebuild", ["-help"], true) || "";
  let runtimes = [],
    runtimeQueryAvailable = false;
  try {
    const value = JSON.parse(
      read("xcrun", ["simctl", "list", "runtimes", "-j"]) || "null",
    );
    if (Array.isArray(value?.runtimes)) {
      runtimes = value.runtimes;
      runtimeQueryAvailable = true;
    }
  } catch {}
  const disk = await statfs(mobile);
  const state = {
    xcodeVersion: versionText?.split("\n")[0] || null,
    sdkVersion,
    firstLaunchReady: read("xcodebuild", ["-checkFirstLaunchStatus"]) !== null,
    downloadCommandAvailable: help.includes("-downloadPlatform"),
    runtimeInstalled: runtimes.some(
      (item) =>
        item.isAvailable === true &&
        item.identifier?.includes(".iOS-") &&
        (item.version === sdkVersion || item.version === sdkVersion + ".0"),
    ),
    runtimeQueryAvailable,
    freeBytes: disk.bavail * disk.bsize,
    arch: process.arch,
  };
  return { ...state, installation: installationPlan(state) };
}
