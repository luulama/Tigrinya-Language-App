import { spawnSync } from "node:child_process";
import { probeXcode } from "./xcode.mjs";

const state = await probeXcode();
if (state.installation.status === "installed")
  console.log(state.installation.reason);
else if (state.installation.status !== "ready") {
  console.error("RUNTIME INSTALLATION BLOCKED: " + state.installation.reason);
  console.error(
    "Manual location: Xcode > Settings > Components > Platform Support > iOS > Get. For iOS " +
      (state.sdkVersion || "the matching version") +
      ": Add Platforms (+), select the version, Download & Install.",
  );
  process.exitCode = 1;
} else {
  const [command, ...args] = state.installation.command;
  console.log(
    "Running the official Apple command: " + [command, ...args].join(" "),
  );
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error || result.status !== 0) {
    console.error(
      "Xcode did not finish runtime installation. Open Components to inspect it. No Apple account or licence prompt is answered automatically.",
    );
    process.exitCode = result.status || 1;
  } else {
    const after = await probeXcode();
    if (after.runtimeInstalled)
      console.log(
        "The matching runtime is installed. Next run npm run ios:build in apps/mobile.",
      );
    else {
      console.error(
        "Xcode returned successfully, but a matching available runtime was not detected. Inspect Xcode > Settings > Components.",
      );
      process.exitCode = 1;
    }
  }
}
