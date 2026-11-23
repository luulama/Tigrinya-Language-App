/** @typedef {{supported:boolean, start:()=>Promise<Blob>, stop:()=>void, cancel:()=>void}} VoiceTransport */
/** @typedef {{phase:'idle'|'recording'|'ready'|'unavailable'|'error', message:string, url:string|null}} VoiceState */

// Owns only one ephemeral recording. No storage, network or progress writes.
export class VoiceController {
  /** @param {VoiceTransport} transport @param {(state:VoiceState)=>void} render @param {{createObjectURL:(blob:Blob)=>string,revokeObjectURL:(url:string)=>void}} urls */
  constructor(transport, render, urls = URL) {
    this.transport = transport;
    this.render = render;
    this.urls = urls;
    this.generation = 0;
    /** @type {string|null} */ this.url = null;
    this.recording = false;
    this.reset();
  }
  reset() {
    this.generation++;
    this.transport.cancel();
    this.recording = false;
    if (this.url) this.urls.revokeObjectURL(this.url);
    this.url = null;
    this.render({
      phase: this.transport.supported ? "idle" : "unavailable",
      url: null,
      message: this.transport.supported
        ? "Your microphone stays off until you choose Record my try."
        : "Recording is unavailable here. Speak aloud and continue practising.",
    });
  }
  async start() {
    if (this.recording || !this.transport.supported) return;
    this.reset();
    const generation = this.generation;
    this.recording = true;
    this.render({
      phase: "recording",
      url: null,
      message:
        "Microphone requested. Record up to eight seconds; Stop or Cancel whenever you like.",
    });
    try {
      const blob = await this.transport.start();
      if (generation !== this.generation) return;
      this.recording = false;
      if (!blob.size) throw Error("Empty recording");
      this.url = this.urls.createObjectURL(blob);
      this.render({
        phase: "ready",
        url: this.url,
        message:
          "Your private clip is ready. Listen and try again. It is not graded or saved.",
      });
    } catch {
      if (generation !== this.generation) return;
      this.recording = false;
      this.transport.cancel();
      this.render({
        phase: "error",
        url: null,
        message:
          "Recording was not available or permission was declined. Speak aloud, or try again. Nothing was saved.",
      });
    }
  }
  stop() {
    if (this.recording) this.transport.stop();
  }
}

/** @returns {VoiceTransport} */
export function browserTransport() {
  /** @type {MediaRecorder|null} */ let recorder = null;
  /** @type {MediaStream|null} */ let stream = null;
  /** @type {ReturnType<typeof setTimeout>|undefined} */ let timer;
  /** @type {((reason?:unknown)=>void)|undefined} */ let rejectPending;
  let generation = 0;
  const cleanup = () => {
    clearTimeout(timer);
    if (recorder) {
      recorder.ondataavailable = recorder.onstop = recorder.onerror = null;
      if (recorder.state !== "inactive") recorder.stop();
    }
    recorder = null;
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
  };
  return {
    supported: !!(
      globalThis.isSecureContext &&
      typeof navigator.mediaDevices?.getUserMedia === "function" &&
      typeof globalThis.MediaRecorder === "function"
    ),
    start() {
      const request = ++generation;
      return new Promise((resolve, reject) => {
        rejectPending = reject;
        navigator.mediaDevices
          .getUserMedia({ audio: true, video: false })
          .then((received) => {
            if (request !== generation) {
              received.getTracks().forEach((track) => track.stop());
              return;
            }
            stream = received;
            try {
              const mimeType = [
                "audio/mp4",
                "audio/webm;codecs=opus",
                "audio/ogg;codecs=opus",
              ].find((type) => MediaRecorder.isTypeSupported(type));
              recorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);
              const active = recorder;
              /** @type {Blob[]} */ const chunks = [];
              active.ondataavailable = (event) => {
                if (event.data.size) chunks.push(event.data);
              };
              active.onerror = () => {
                cleanup();
                reject(Error("Recorder unavailable"));
              };
              active.onstop = () => {
                const result = new Blob(chunks, {
                  type: active.mimeType || "audio/mp4",
                });
                cleanup();
                rejectPending = undefined;
                resolve(result);
              };
              active.start();
              timer = setTimeout(() => {
                if (active.state === "recording") active.stop();
              }, 8000);
            } catch (error) {
              cleanup();
              reject(error);
            }
          })
          .catch((error) => {
            if (request === generation) cleanup();
            reject(error);
          });
      });
    },
    stop() {
      if (recorder?.state === "recording") recorder.stop();
    },
    cancel() {
      generation++;
      cleanup();
      rejectPending?.(Error("Cancelled"));
      rejectPending = undefined;
    },
  };
}
