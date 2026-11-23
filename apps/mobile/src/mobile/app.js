import { Capacitor, CapacitorHttp } from "@capacitor/core";
import config from "./config.js";

const toolbar = document.createElement("nav");
toolbar.className = "mobile-toolbar";
toolbar.setAttribute("aria-label", "Mobile navigation");
toolbar.innerHTML =
  '<a href="/index.html">Practice home</a><span>Preview · review pending</span><a href="/settings.html">About</a>';
document.body.prepend(toolbar);

// Bundled references remain readable; arbitrary websites are never opened by this preview.
document.addEventListener("click", (event) => {
  const element =
    event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(element instanceof HTMLAnchorElement)) return;
  const url = new URL(element.href, window.location.href);
  // URL.origin is "null" for custom schemes; compare protocol/host explicitly.
  if (url.protocol === location.protocol && url.host === location.host) return;
  event.preventDefault();
  let note = document.querySelector(".mobile-link-status");
  if (!note) {
    note = document.createElement("p");
    note.className = "mobile-link-status";
    note.setAttribute("role", "status");
    toolbar.after(note);
  }
  note.textContent =
    "External websites stay closed in this preview. Source addresses are retained in the review notes.";
});

const mode = document.querySelector("#mobile-mode");
if (mode)
  mode.textContent =
    config.environment === "offline"
      ? "Offline practice · no API is configured."
      : `Explicit ${config.environment} API configuration · no automatic connection.`;
const apiState = document.querySelector("#mobile-api-state");
if (apiState && config.apiUrl)
  apiState.textContent = `Configured API: ${config.apiUrl}. Checking it sends one read-only health request.`;
const identity = document.querySelector("#identity-note");
if (identity)
  identity.textContent = `Development identity: ${config.appId}. Sign-in is unavailable in this slice.`;
const check = document.querySelector("#check-api");
if (check instanceof HTMLButtonElement) {
  check.disabled = !config.apiUrl;
  check.addEventListener("click", async () => {
    if (!config.apiUrl) return;
    const result = document.querySelector("#api-result");
    if (!result) return;
    check.disabled = true;
    result.textContent = "Checking the configured service…";
    try {
      const url = config.apiUrl + "/health/live";
      let status;
      if (Capacitor.isNativePlatform()) {
        // Native transport avoids changing the web API's existing CORS policy.
        const response = await CapacitorHttp.get({
          url,
          connectTimeout: 5000,
          readTimeout: 5000,
          disableRedirects: true,
        });
        status = response.status;
      } else {
        const response = await fetch(url, {
          method: "GET",
          credentials: "omit",
          redirect: "error",
          signal: AbortSignal.timeout(5000),
        });
        status = response.status;
      }
      result.textContent =
        status === 200
          ? "The API is reachable. This checks process health, not database readiness or sign-in."
          : "The configured API is unavailable. Offline practice still works.";
    } catch {
      result.textContent =
        "The service could not be reached. Offline practice still works. Browser previews also need the server’s exact CORS permission.";
    } finally {
      check.disabled = !config.apiUrl;
    }
  });
}
