import test from "node:test";
import assert from "node:assert/strict";
import { browserTransport } from "../src/mobile/voice-controller.js";

async function withBrowser(getUserMedia, run) {
  const original = new Map(
    ["navigator", "isSecureContext", "MediaRecorder"].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  class Recorder {
    static isTypeSupported(type) {
      return type === "audio/mp4";
    }
    state = "inactive";
    mimeType = "audio/mp4";
    start() {
      this.state = "recording";
    }
    stop() {
      this.state = "inactive";
      this.ondataavailable?.({ data: new Blob(["synthetic transport bytes"]) });
      this.onstop?.();
    }
  }
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { mediaDevices: { getUserMedia } },
  });
  Object.defineProperty(globalThis, "isSecureContext", {
    configurable: true,
    value: true,
  });
  Object.defineProperty(globalThis, "MediaRecorder", {
    configurable: true,
    value: Recorder,
  });
  const transport = browserTransport();
  try {
    await run(transport);
  } finally {
    transport.cancel();
    for (const [key, descriptor] of original) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

const tick = () => new Promise((resolve) => setImmediate(resolve));
test("a microphone permission grant after cancellation closes every received track", async () => {
  let grant;
  let stopped = 0;
  await withBrowser(
    () =>
      new Promise((resolve) => {
        grant = resolve;
      }),
    async (transport) => {
      const pending = transport.start();
      transport.cancel();
      await assert.rejects(pending, /Cancelled/);
      grant({
        getTracks: () => [
          {
            stop() {
              stopped++;
            },
          },
        ],
      });
      await tick();
      assert.equal(stopped, 1);
    },
  );
});

test("an older permission rejection cannot stop a newer successful recording", async () => {
  let rejectOld,
    grantNew,
    calls = 0,
    stopped = 0;
  await withBrowser(
    () =>
      ++calls === 1
        ? new Promise((_resolve, reject) => {
            rejectOld = reject;
          })
        : new Promise((resolve) => {
            grantNew = resolve;
          }),
    async (transport) => {
      const old = transport.start();
      transport.cancel();
      await assert.rejects(old);
      const current = transport.start();
      grantNew({
        getTracks: () => [
          {
            stop() {
              stopped++;
            },
          },
        ],
      });
      await tick();
      rejectOld(Error("old permission declined"));
      await tick();
      assert.equal(stopped, 0);
      transport.stop();
      const clip = await current;
      assert.equal(clip.type, "audio/mp4");
      assert(clip.size > 0);
      assert.equal(stopped, 1);
    },
  );
});
