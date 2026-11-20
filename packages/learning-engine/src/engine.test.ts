// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  SchedulingEngine,
  Sm2MemoryModel,
  FsrsMemoryModel,
  ReviewQueue,
  retentionScore,
  type ReviewEvent,
  type LearningObject,
} from "./index";
const day = 86400000;
const start = new Date("2026-01-01T00:00:00Z");
const event = (
  id: string,
  days: number,
  extra: Partial<ReviewEvent> = {},
): ReviewEvent => ({
  id,
  at: new Date(+start + days * day),
  outcome: 3,
  helped: false,
  modelFirst: false,
  ...extra,
});
describe("memory scheduling", () => {
  it("SM-2 schedules real intervals and records independent evidence", async () => {
    const engine = new SchedulingEngine(new Sm2MemoryModel());
    let state = await engine.initial("word:ti:reading:v1", start);
    state = await engine.review(state, event("one", 0));
    expect(state.memory.intervalDays).toBe(1);
    state = await engine.review(state, event("two", 1));
    expect(state.memory.intervalDays).toBe(6);
    expect(state.delayedCorrect).toBe(1);
  });
  it("help and immediate repetitions cannot inflate independent evidence", async () => {
    const engine = new SchedulingEngine(new Sm2MemoryModel());
    let state = await engine.initial("item", start);
    state = await engine.review(state, event("one", 0, { helped: true }));
    state = await engine.review(state, event("two", 0));
    expect(state.independentAttempts).toBe(0);
    expect(state.memory.repetitions).toBe(0);
  });
  it("de-duplicates retries and rejects clock rollback or algorithm changes", async () => {
    const engine = new SchedulingEngine(new Sm2MemoryModel());
    let state = await engine.initial("item", start);
    state = await engine.review(state, event("one", 1));
    expect(await engine.review(state, event("one", 1))).toBe(state);
    await expect(engine.review(state, event("two", 0))).rejects.toThrow();
    await expect(
      engine.review({ ...state, algorithm: "future" }, event("three", 2)),
    ).rejects.toThrow();
  });
  it("uses the FSRS-7 library and maintains a distinct version", async () => {
    const engine = new SchedulingEngine(new FsrsMemoryModel());
    let state = await engine.initial("item", start);
    state = await engine.review(state, event("fsrs", 0));
    expect(state.algorithm).toBe("fsrs-7-default-v1");
    expect(state.memory.stability).toBeGreaterThan(0);
    expect(state.memory.dueAt.getTime()).toBeGreaterThan(start.getTime());
  });
  it("filters draft, private and prerequisite-blocked material", async () => {
    const engine = new SchedulingEngine(new Sm2MemoryModel());
    const state = await engine.initial("item", start);
    const object: LearningObject = {
      id: "item",
      kind: "vocabulary",
      difficulty: 0.1,
      visibility: "learner",
      approvalState: "approved",
      prerequisites: [],
    };
    const targets = [
      { object, state },
      {
        object: { ...object, id: "draft", approvalState: "pending" as const },
        state,
      },
      {
        object: { ...object, id: "blocked", prerequisites: ["missing"] },
        state,
      },
    ];
    expect(
      new ReviewQueue(engine)
        .plan(targets, start, 2, new Set())
        .map((x) => x.object.id),
    ).toEqual(["item"]);
  });
  it("withholds retention percentages with insufficient observations", () => {
    expect(retentionScore(1, 1).observed).toBeNull();
    expect(retentionScore(4, 5).observed).toBe(80);
    expect(retentionScore(4, 5).predicted).toBeNull();
  });
});
