import { describe, expect, it, vi } from "vitest";
import {
  createSnapshot,
  cueFor,
  reduceMotion,
  playCue,
  segmentAt,
  type IntentType,
} from "./motion";

const context = {
  sessionId: "synthetic-session",
  taskRevision: "synthetic-revision",
  nativeModelReady: false,
};
const initial = () => createSnapshot(context);
const intent = (type: IntentType, sequence = 1) => ({
  ...context,
  type,
  sequence,
});

describe("session-scoped motion", () => {
  it("starts still and does not infer audio availability", () => {
    expect(initial()).toMatchObject({
      pose: "idle",
      reduced: true,
      nativeModelReady: false,
      sequence: 0,
    });
  });
  it("rejects another task, old sequence and invalid sequence", () => {
    const state = reduceMotion(initial(), intent("activity-confirmed", 2));
    expect(reduceMotion(state, intent("retry-offered", 1))).toBe(state);
    expect(
      reduceMotion(state, {
        ...intent("retry-offered", 3),
        taskRevision: "other",
      }),
    ).toBe(state);
    expect(reduceMotion(state, intent("retry-offered", NaN))).toBe(state);
  });
  it("retries cannot accumulate a celebration queue", () => {
    const state = reduceMotion(initial(), intent("activity-confirmed"));
    expect(reduceMotion(state, intent("activity-confirmed"))).toBe(state);
    expect(reduceMotion(state, intent("retry-offered", 2)).pose).toBe(
      "encouraging",
    );
  });
  it("maps real interaction intents to every non-speaking pose", () => {
    const pairs = {
      navigate: "walking",
      "recording-started": "listening",
      "work-pending": "thinking",
      "model-shown": "teaching",
      "activity-confirmed": "celebrating",
      "retry-offered": "encouraging",
      "request-pending": "waiting",
      bedtime: "sleeping",
      idle: "idle",
    } as const;
    for (const [type, pose] of Object.entries(pairs))
      expect(
        reduceMotion(initial(), intent(type as keyof typeof pairs)).pose,
      ).toBe(pose);
  });
  it("does not pretend missing native audio is playing", () => {
    expect(
      reduceMotion(initial(), {
        ...intent("model-playing"),
        playbackId: "play-1",
      }).pose,
    ).toBe("teaching");
  });
  it("accepts actual playing only through an enabled model gate and ignores old transport stop", () => {
    const state = createSnapshot({ ...context, nativeModelReady: true });
    const speaking = reduceMotion(state, {
      ...intent("model-playing"),
      playbackId: "current",
    });
    expect(speaking.pose).toBe("talking");
    expect(
      reduceMotion(speaking, {
        ...intent("model-stopped", 2),
        playbackId: "stale",
      }),
    ).toBe(speaking);
    expect(
      reduceMotion(speaking, {
        ...intent("model-stopped", 3),
        playbackId: "current",
      }).pose,
    ).toBe("teaching");
  });
  it("backgrounding discards old acting rather than replaying on return", () => {
    let state = reduceMotion(initial(), intent("activity-confirmed"));
    state = reduceMotion(state, { type: "policy", visible: false });
    expect(state.pose).toBe("idle");
    state = reduceMotion(state, {
      type: "policy",
      visible: true,
      reduced: false,
    });
    expect(state.pose).toBe("idle");
  });
  it("keeps the mascot still during capture and waits for the real stop", () => {
    const state = reduceMotion(initial(), intent("recording-started"));
    expect(reduceMotion(state, intent("activity-confirmed", 2))).toBe(state);
    expect(reduceMotion(state, intent("recording-stopped", 3))).toMatchObject({
      pose: "idle",
      recording: false,
    });
  });
});

describe("cancellable browser enhancement", () => {
  it("contains bounded transform/opacity cues and no idle/listening loops", () => {
    expect(cueFor("celebrating").durationMs).toBe(480);
    expect(cueFor("idle").frames).toHaveLength(0);
    expect(cueFor("listening").frames).toHaveLength(0);
    expect(cueFor("talking").frames).toHaveLength(0);
  });
  it("is static when reduced, hidden, quiet or unsupported", async () => {
    const host = document.createElement("div");
    const animate = vi.fn();
    host.animate = animate;
    for (const patch of [
      { reduced: true },
      { quiet: true },
      { visible: false },
    ]) {
      await playCue(
        host,
        cueFor("walking"),
        { reduced: false, quiet: false, visible: true, ...patch },
        new AbortController().signal,
      );
    }
    expect(animate).not.toHaveBeenCalled();
    delete (host as Partial<HTMLElement>).animate;
    await expect(
      playCue(
        host,
        cueFor("walking"),
        { reduced: false, quiet: false, visible: true },
        new AbortController().signal,
      ),
    ).resolves.toBe(false);
  });
  it("cancels an active browser animation on abort and releases its fill", async () => {
    const host = document.createElement("div");
    let reject!: (reason: Error) => void;
    const finished = new Promise<Animation>((_, no) => {
      reject = no;
    });
    const cancel = vi.fn(() => reject(new Error("cancelled")));
    host.animate = vi.fn(() => ({ finished, cancel }) as unknown as Animation);
    const controller = new AbortController();
    const result = playCue(
      host,
      cueFor("celebrating"),
      { reduced: false, quiet: false, visible: true },
      controller.signal,
    );
    controller.abort();
    await expect(result).resolves.toBe(false);
    expect(cancel).toHaveBeenCalled();
  });
  it("survives transport failure without blocking the semantic view", async () => {
    const host = document.createElement("div");
    host.animate = vi.fn(() => {
      throw new Error("renderer unavailable");
    });
    await expect(
      playCue(
        host,
        cueFor("celebrating"),
        { reduced: false, quiet: false, visible: true },
        new AbortController().signal,
      ),
    ).resolves.toBe(false);
  });
});

describe("reviewed audio clock selection", () => {
  const binding = {
    targetRevision: "synthetic",
    sha256: "a".repeat(64),
    variety: "fixture",
    durationMs: 1000,
  };
  const alignment = {
    ...binding,
    reviewed: true,
    segments: [
      { startMs: 100, endMs: 300, graphemeIds: ["g1"] },
      { startMs: 300, endMs: 800, graphemeIds: ["g2"] },
    ],
  };
  it("uses media time, including seeking and half-open boundaries", () => {
    expect(segmentAt(binding, alignment, 100)).toEqual(["g1"]);
    expect(segmentAt(binding, alignment, 300)).toEqual(["g2"]);
    expect(segmentAt(binding, alignment, 900)).toEqual([]);
    expect(segmentAt(binding, alignment, 150)).toEqual(["g1"]);
  });
  it("requires review and exact recording, variety, target and duration", () => {
    for (const patch of [
      { reviewed: false },
      { sha256: "b".repeat(64) },
      { variety: "other" },
      { targetRevision: "other" },
      { durationMs: 1100 },
    ])
      expect(segmentAt(binding, { ...alignment, ...patch }, 150)).toEqual([]);
  });
  it("rejects overlapping/out-of-bounds timelines and nonfinite time", () => {
    expect(
      segmentAt(
        binding,
        {
          ...alignment,
          segments: [{ startMs: 0, endMs: 1100, graphemeIds: ["g1"] }],
        },
        150,
      ),
    ).toEqual([]);
    expect(
      segmentAt(
        binding,
        {
          ...alignment,
          segments: [
            ...alignment.segments,
            { startMs: 250, endMs: 400, graphemeIds: ["g3"] },
          ],
        },
        150,
      ),
    ).toEqual([]);
    expect(segmentAt(binding, alignment, Infinity)).toEqual([]);
  });
});
