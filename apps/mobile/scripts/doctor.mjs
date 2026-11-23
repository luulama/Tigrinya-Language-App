import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { mobile } from "./build.mjs";
import { readMobileConfig } from "./config.mjs";
import { probeXcode, GiB } from "./xcode.mjs";

const xcode = await probeXcode();
let config, configError;
try {
  config = await readMobileConfig();
} catch (error) {
  configError = error.message;
}
const project = await readFile(
  join(mobile, "ios/App/App.xcodeproj/project.pbxproj"),
  "utf8",
);
// Report presence only. Do not read Apple Accounts, Keychain or provisioning credentials.
const signingTeamChosen = [
  ...project.matchAll(/DEVELOPMENT_TEAM\s*=\s*([^;]+);/g),
].some((match) => /^[A-Z0-9]{10}$/.test(match[1].replaceAll('"', "").trim()));
const report = {
  xcode,
  configuration: config
    ? {
        environment: config.environment,
        backendEnabled: config.apiUrl !== null,
        authEnabled: config.authEnabled,
        databaseClientIncluded: false,
      }
    : { error: configError },
  ownerChoices: {
    appNameNeeded: !config || config.appName === "Tigrinya Preview",
    bundleIdNeeded: !config || config.appId.startsWith("com.example."),
    signingTeamNeeded: !signingTeamChosen,
    physicalIPhoneTestNeeded: true,
    contentAndAudioApprovalNeeded: config?.contentReview !== "approved",
  },
};
if (process.argv.includes("--json"))
  console.log(JSON.stringify(report, null, 2));
else {
  console.log(
    `${xcode.xcodeVersion || "Xcode unavailable"} · simulator SDK ${xcode.sdkVersion || "unavailable"} · ${(xcode.freeBytes / GiB).toFixed(1)} GiB free`,
  );
  console.log(
    `First launch: ${xcode.firstLaunchReady ? "ready" : "complete in Xcode"}; matching runtime: ${xcode.runtimeInstalled ? "installed" : "missing"}; official download command: ${xcode.downloadCommandAvailable ? "available" : "unavailable"}.`,
  );
  if (xcode.installation.status !== "ready")
    console.log(xcode.installation.reason);
  if (configError) console.log("Configuration needs attention: " + configError);
  else
    console.log(
      `Backend: ${config.apiUrl ? "explicitly configured in " + config.environment : "OFF (offline)"}; authentication: OFF; database connections: none.`,
    );
  console.log("Owner choices:");
  console.log(
    `- App name: ${report.ownerChoices.appNameNeeded ? "choose your name" : "supplied"}`,
  );
  console.log(
    `- Unique bundle ID: ${report.ownerChoices.bundleIdNeeded ? "supply your own identifier" : "supplied; Apple availability still needs your account"}`,
  );
  console.log(
    `- Signing team: ${signingTeamChosen ? "chosen in the Xcode project" : "choose in Xcode > App > Signing & Capabilities"}`,
  );
  console.log(
    "- Physical iPhone testing and qualified content/audio approval remain manual.",
  );
  console.log(
    "Instructions: apps/mobile/IPHONE_SETUP.sv.md. No download, sign-in, build, API call or database startup was performed by this check.",
  );
}
if (
  configError ||
  !xcode.runtimeInstalled ||
  !xcode.firstLaunchReady ||
  report.ownerChoices.appNameNeeded ||
  report.ownerChoices.bundleIdNeeded ||
  !signingTeamChosen
)
  process.exitCode = 1;
