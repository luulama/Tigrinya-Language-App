import { describe, it, expect } from "vitest";
import {
  DEFAULT_PLAN,
  firstPractice,
  firstTransition,
  startingRecommendation,
  validPlan,
  visitSummary,
} from "./learning-start";
describe("honest starting recommendations", () => {
  it("keeps heritage listening separate from reading and speaking", () => {
    const result = startingRecommendation({
      ...DEFAULT_PLAN,
      listening: "comfortable",
      speaking: "new",
      reading: "new",
    });
    expect(result.background).toBe("heritage_listener");
    expect(result.href).toBe("/first-lesson");
    expect(result.assessed).toBe(false);
  });
  it("classifies self-description without turning it into an assessed level", () => {
    for (const [plan, kind] of [
      [
        { ...DEFAULT_PLAN, listening: "new", speaking: "new", reading: "new" },
        "starting_fresh",
      ],
      [
        { ...DEFAULT_PLAN, speaking: "comfortable", reading: "new" },
        "heritage_speaker",
      ],
      [
        { ...DEFAULT_PLAN, speaking: "comfortable", reading: "comfortable" },
        "literate_speaker",
      ],
    ] as const) {
      expect(startingRecommendation(plan).background).toBe(kind);
      expect(startingRecommendation(plan).assessed).toBe(false);
    }
  });
  it("uses a helpful practice observation without denying exploration or assigning mastery", () => {
    expect(
      startingRecommendation({
        ...DEFAULT_PLAN,
        reading: "comfortable",
        goal: "words",
      }).href,
    ).toContain("unit-02");
    expect(
      startingRecommendation(
        { ...DEFAULT_PLAN, reading: "comfortable", goal: "words" },
        { recalled: true, recallHelp: true },
      ).href,
    ).toBe("/first-lesson");
  });
  it("rejects malformed preference data", () => {
    expect(validPlan(DEFAULT_PLAN)).toBe(true);
    expect(validPlan({ ...DEFAULT_PLAN, reading: "advanced" })).toBe(false);
    expect(validPlan({ ...DEFAULT_PLAN, quiet: "yes" })).toBe(false);
  });
});
describe("first practice evidence", () => {
  it("does not let Next skip writing alternatives or checks", () => {
    let s = firstTransition(firstPractice("fixture", "በ"), { type: "next" });
    expect(s.step).toBe("trace");
    expect(firstTransition(s, { type: "next" })).toBe(s);
    s = firstTransition(s, { type: "trace", mode: "skipped" });
    s = firstTransition(s, { type: "next" });
    expect(s.step).toBe("match");
    expect(firstTransition(s, { type: "next" })).toBe(s);
  });
  it("keeps a correction supported after retry and does not fabricate listening", () => {
    let s = firstPractice("fixture", "በ");
    s = { ...s, step: "recall" };
    s = firstTransition(s, { type: "answer", correct: false });
    expect(s.needsRetry).toBe(true);
    expect(s.recallHelp).toBe(true);
    expect(firstTransition(s, { type: "answer", correct: true }).recalled).toBe(
      false,
    );
    s = firstTransition(s, { type: "retry" });
    s = firstTransition(s, { type: "answer", correct: true });
    expect(firstTransition(s, { type: "next" }).step).toBe("recap");
    expect(s.heard).toBe(false);
  });
  it("does not rewrite a completed answer with repeated taps", () => {
    const s = {
      ...firstPractice("fixture", "በ"),
      step: "match" as const,
      matched: true,
    };
    expect(firstTransition(s, { type: "answer", correct: false })).toBe(s);
  });
  it("does not report progress from an empty visit", () => {
    expect(visitSummary([]).what).toContain("No first practice");
  });
});
