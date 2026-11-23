import test from "node:test";
import assert from "node:assert/strict";
import { VoiceController } from "../src/mobile/voice-controller.js";

function setup(supported = true) {
  let resolve,
    reject,
    cancels = 0,
    stops = 0,
    starts = 0;
  const states = [],
    revoked = [];
  const transport = {
    supported,
    start() {
      starts++;
      return new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      });
    },
    stop() {
      stops++;
    },
    cancel() {
      cancels++;
    },
  };
  const controller = new VoiceController(
    transport,
    (value) => states.push(value),
    {
      createObjectURL: () => "blob:private-test",
      revokeObjectURL: (value) => revoked.push(value),
    },
  );
  return {
    controller,
    states,
    revoked,
    resolve: (value) => resolve(value),
    reject: (value) => reject(value),
    counts: () => ({ cancels, stops, starts }),
  };
}
test("a private clip can be recorded, stopped, listened to and deleted", async () => {
  const s = setup();
  const pending = s.controller.start();
  assert.equal(s.states.at(-1).phase, "recording");
  s.controller.stop();
  assert.equal(s.counts().stops, 1);
  s.resolve(new Blob(["temporary voice"], { type: "audio/mp4" }));
  await pending;
  assert.equal(s.states.at(-1).phase, "ready");
  assert.equal(s.states.at(-1).url, "blob:private-test");
  s.controller.reset();
  assert.deepEqual(s.revoked, ["blob:private-test"]);
  assert.equal(s.states.at(-1).phase, "idle");
});
test("permission failure is kind and retryable", async () => {
  const s = setup();
  const pending = s.controller.start();
  s.reject(Error("denied"));
  await pending;
  assert.equal(s.states.at(-1).phase, "error");
  assert.match(s.states.at(-1).message, /Nothing was saved/);
  const retry = s.controller.start();
  s.resolve(new Blob(["retry"]));
  await retry;
  assert.equal(s.states.at(-1).phase, "ready");
});
test("leaving/cancelling before permission resolves cannot resurrect a clip", async () => {
  const s = setup();
  const pending = s.controller.start();
  s.controller.reset();
  s.resolve(new Blob(["late voice"]));
  await pending;
  assert.equal(s.states.at(-1).phase, "idle");
  assert.equal(s.states.at(-1).url, null);
});
test("empty capture is recoverable and creates no blob URL", async () => {
  const s = setup();
  const pending = s.controller.start();
  s.resolve(new Blob());
  await pending;
  assert.equal(s.states.at(-1).phase, "error");
  assert.equal(s.states.at(-1).url, null);
});
test("double taps do not open concurrent microphone requests", async () => {
  const s = setup();
  const pending = s.controller.start();
  await s.controller.start();
  assert.equal(s.counts().starts, 1);
  s.resolve(new Blob(["clip"]));
  await pending;
});
test("unsupported environments have a static speak-aloud fallback", async () => {
  const s = setup(false);
  await s.controller.start();
  assert.equal(s.counts().starts, 0);
  assert.equal(s.states.at(-1).phase, "unavailable");
  assert.match(s.states.at(-1).message, /Speak aloud/);
});
test("a new attempt revokes the previous clip; background reset never saves it", async () => {
  const s = setup();
  let pending = s.controller.start();
  s.resolve(new Blob(["one"]));
  await pending;
  pending = s.controller.start();
  assert.deepEqual(s.revoked, ["blob:private-test"]);
  s.controller.reset();
  s.reject(Error("backgrounded"));
  await pending;
  assert.equal(s.states.at(-1).phase, "idle");
});
