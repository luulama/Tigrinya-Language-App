import { Capacitor, registerPlugin } from "@capacitor/core";
import { VoiceController, browserTransport } from "./voice-controller.js";

/** @typedef {{record:()=>Promise<{base64:string,mimeType:string}>,stop:()=>Promise<void>,cancel:()=>Promise<void>}} NativeVoice */
const nativeVoice = /** @type {NativeVoice} */ (registerPlugin("PrivateVoice"));
/** @type {import('./voice-controller.js').VoiceTransport} */
const transport = Capacitor.isNativePlatform()
  ? {
      supported: Capacitor.isPluginAvailable("PrivateVoice"),
      async start() {
        const result = await nativeVoice.record();
        if (result.mimeType !== "audio/mp4" || result.base64.length > 2_000_000)
          throw Error("Invalid clip");
        const bytes = Uint8Array.from(atob(result.base64), (character) =>
          character.charCodeAt(0),
        );
        return new Blob([bytes], { type: result.mimeType });
      },
      stop() {
        void nativeVoice.stop().catch(() => controller.reset());
      },
      cancel() {
        void nativeVoice.cancel().catch(() => {});
      },
    }
  : browserTransport();

/** @template {HTMLElement} T @param {string} id @param {new (...args:any[])=>T} kind @returns {T} */
function element(id, kind) {
  const found = document.getElementById(id);
  if (!(found instanceof kind)) throw Error("Voice controls unavailable");
  return found;
}
const start = element("voice-start", HTMLButtonElement),
  stop = element("voice-stop", HTMLButtonElement),
  cancel = element("voice-cancel", HTMLButtonElement),
  discard = element("voice-delete", HTMLButtonElement),
  audio = element("voice-playback", HTMLAudioElement),
  state = element("voice-state", HTMLParagraphElement);
const controller = new VoiceController(transport, (update) => {
  state.textContent = update.message;
  start.disabled =
    update.phase === "recording" || update.phase === "unavailable";
  stop.hidden = cancel.hidden = update.phase !== "recording";
  discard.hidden = update.phase !== "ready";
  if (update.url) {
    audio.src = update.url;
    audio.hidden = false;
  } else {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    audio.hidden = true;
  }
});
start.addEventListener("click", () => {
  void controller.start();
});
stop.addEventListener("click", () => controller.stop());
cancel.addEventListener("click", () => {
  controller.reset();
  start.focus();
});
discard.addEventListener("click", () => {
  controller.reset();
  start.focus();
});
audio.addEventListener("error", () => {
  controller.reset();
  state.textContent =
    "This clip could not play. Speak aloud, or record another try.";
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) controller.reset();
});
window.addEventListener("pagehide", () => controller.reset());
document.addEventListener(
  "click",
  (event) => {
    if (event.target instanceof Element && event.target.closest("a"))
      controller.reset();
  },
  true,
);
