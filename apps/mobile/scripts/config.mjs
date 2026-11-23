import { isIP } from "node:net";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const placeholderId = "com.example.tigrinya.placeholder";

// Only owner-chosen public identity can persist here. Never load API, account or database settings.
export async function readMobileConfig(
  env = process.env,
  identityFile = fileURLToPath(
    new URL("../device.local.json", import.meta.url),
  ),
) {
  let text;
  try {
    text = await readFile(identityFile, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return mobileConfig(env);
    throw Error("Could not read device.local.json.");
  }
  let identity;
  try {
    identity = JSON.parse(text);
  } catch {
    throw Error(
      "device.local.json must be valid JSON containing only appId and appName.",
    );
  }
  if (
    !identity ||
    Array.isArray(identity) ||
    typeof identity !== "object" ||
    Object.keys(identity).some((key) => !["appId", "appName"].includes(key))
  )
    throw Error(
      "device.local.json accepts only appId and appName. Keep API, signing and secret values out of it.",
    );
  if (
    typeof identity.appId !== "string" ||
    typeof identity.appName !== "string" ||
    !identity.appId.trim() ||
    !identity.appName.trim()
  )
    throw Error(
      "Fill in your own appId and appName in device.local.json; the template is intentionally incomplete.",
    );
  return mobileConfig({
    ...env,
    MOBILE_APP_ID: env.MOBILE_APP_ID || identity.appId,
    MOBILE_APP_NAME: env.MOBILE_APP_NAME || identity.appName,
  });
}

export function mobileConfig(env = process.env) {
  const environment = env.MOBILE_ENV || "offline";
  if (!["offline", "staging", "production"].includes(environment))
    throw Error("MOBILE_ENV must be offline, staging or production.");
  const appId = env.MOBILE_APP_ID || placeholderId;
  const appName = env.MOBILE_APP_NAME || "Tigrinya Preview";
  if (!/^[A-Za-z][A-Za-z0-9-]*(?:\.[A-Za-z][A-Za-z0-9-]*){2,}$/.test(appId))
    throw Error("MOBILE_APP_ID must be a reverse-domain bundle identifier.");
  if (
    !appName.trim() ||
    appName.length > 60 ||
    /[\x00-\x1f"<>\\]/.test(appName)
  )
    throw Error(
      "MOBILE_APP_NAME must be a short display name without control or markup characters.",
    );
  const supplied = env.MOBILE_API_URL || "";
  let apiUrl = null;
  if (environment === "offline") {
    if (supplied)
      throw Error(
        "Offline builds reject MOBILE_API_URL. Explicitly select staging or production.",
      );
  } else {
    let url;
    try {
      url = new URL(supplied);
    } catch {
      throw Error("An explicit HTTPS MOBILE_API_URL origin is required.");
    }
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    )
      throw Error(
        "MOBILE_API_URL must be an HTTPS origin without credentials, path, query or fragment.",
      );
    if (
      isIP(host) ||
      !host.includes(".") ||
      /(^|\.)(localhost|local|invalid|example|test)$/.test(host) ||
      /(^|\.)example\.(com|org|net)$/.test(host)
    )
      throw Error(
        "MOBILE_API_URL needs a real DNS host; loopback, IP literals and placeholder domains are not accepted.",
      );
    apiUrl = url.origin;
    if (
      environment === "production" &&
      env.MOBILE_ALLOW_PRODUCTION_API !== "yes"
    )
      throw Error(
        "Production API access requires MOBILE_ALLOW_PRODUCTION_API=yes; no production connection is implicit.",
      );
  }
  if (
    environment === "production" &&
    (appId.startsWith("com.example.") || appName === "Tigrinya Preview")
  )
    throw Error(
      "Production builds require the owner-supplied MOBILE_APP_ID and MOBILE_APP_NAME.",
    );
  return Object.freeze({
    environment,
    appId,
    appName,
    apiUrl,
    authEnabled: false,
    contentReview: "pending",
  });
}

export function capacitorConfig(config) {
  return {
    appId: config.appId,
    appName: config.appName,
    webDir: "www",
    server: { hostname: "localhost", iosScheme: "capacitor", cleartext: false },
    ios: {
      contentInset: "never",
      allowsLinkPreview: false,
      scrollEnabled: true,
    },
    plugins: {
      CapacitorHttp: { enabled: false },
      CapacitorCookies: { enabled: false },
    },
  };
}
