import test from "node:test";
import assert from "node:assert/strict";
import {
  installationPlan,
  minimumInstallFreeBytes,
  GiB,
} from "../scripts/xcode.mjs";

const ready = {
  xcodeVersion: "Xcode fixture",
  sdkVersion: "26.2",
  firstLaunchReady: true,
  runtimeInstalled: false,
  runtimeQueryAvailable: true,
  downloadCommandAvailable: true,
  freeBytes: minimumInstallFreeBytes,
  arch: "arm64",
};
test("the installer uses the official Apple command for the installed SDK and Apple Silicon", () => {
  assert.deepEqual(installationPlan(ready), {
    status: "ready",
    command: [
      "xcodebuild",
      "-downloadPlatform",
      "iOS",
      "-buildVersion",
      "26.2",
      "-architectureVariant",
      "arm64",
    ],
  });
});
test("low or unknown disk space prevents any download command from being produced", () => {
  for (const freeBytes of [4.7 * GiB, 0, NaN, minimumInstallFreeBytes - 1]) {
    const plan = installationPlan({ ...ready, freeBytes });
    assert.equal(plan.status, "blocked");
    assert.equal(plan.command, undefined);
    assert.match(plan.reason, /30 GiB/);
  }
});
test("an existing runtime makes installation a no-op even with little spare space", () => {
  const plan = installationPlan({
    ...ready,
    runtimeInstalled: true,
    freeBytes: GiB,
  });
  assert.equal(plan.status, "installed");
  assert.equal(plan.command, undefined);
});
test("missing first-launch tasks are never bypassed by accepting a licence automatically", () => {
  const plan = installationPlan({ ...ready, firstLaunchReady: false });
  assert.equal(plan.status, "blocked");
  assert.match(plan.reason, /No licence is accepted/);
});
test("unsupported tooling, invalid versions and unknown architecture fail closed", () => {
  for (const change of [
    { xcodeVersion: null },
    { sdkVersion: null },
    { sdkVersion: "26.2 --other-flag" },
    { downloadCommandAvailable: false },
    { arch: "other" },
    { runtimeQueryAvailable: false },
  ])
    assert.equal(installationPlan({ ...ready, ...change }).status, "blocked");
});
test("Intel uses the supported universal variant without downloading other platforms", () => {
  const plan = installationPlan({ ...ready, arch: "x64" });
  assert.equal(plan.command.at(-1), "universal");
  assert(!plan.command.includes("-downloadAllPlatforms"));
  assert(!plan.command.includes("-runFirstLaunch"));
});
