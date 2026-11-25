export type Familiarity = "new" | "some" | "comfortable" | "unsure";
export interface StartingPlan {
  listening: Familiarity;
  speaking: Familiarity;
  reading: Familiarity;
  goal: "reading" | "words";
  pace: "step" | "explore";
  quiet: boolean;
}
export interface SavedStartingPlan extends StartingPlan {
  revision: string;
  updatedAt: string;
}
export const DEFAULT_PLAN: StartingPlan = {
  listening: "unsure",
  speaking: "unsure",
  reading: "unsure",
  goal: "reading",
  pace: "step",
  quiet: false,
};
export function validPlan(value: unknown): value is StartingPlan {
  if (!value || typeof value !== "object") return false;
  const p = value as StartingPlan;
  return (
    [p.listening, p.speaking, p.reading].every((x) =>
      ["new", "some", "comfortable", "unsure"].includes(x),
    ) &&
    ["reading", "words"].includes(p.goal) &&
    ["step", "explore"].includes(p.pace) &&
    typeof p.quiet === "boolean"
  );
}
export function startingRecommendation(
  plan: StartingPlan,
  recent?: { recalled: boolean; recallHelp: boolean },
) {
  // A background description selects a useful invitation. It never awards ability.
  const background =
    plan.listening === "new" &&
    plan.speaking === "new" &&
    plan.reading === "new"
      ? "starting_fresh"
      : plan.reading === "comfortable" && plan.speaking === "comfortable"
        ? "literate_speaker"
        : plan.speaking === "comfortable"
          ? "heritage_speaker"
          : ["some", "comfortable"].includes(plan.listening) &&
              ["new", "unsure"].includes(plan.speaking)
            ? "heritage_listener"
            : "mixed_or_unsure";
  if (recent?.recallHelp)
    return {
      background,
      href: "/first-lesson",
      title: "Keep the model nearby",
      why: "Your recent shape practice used help. Revisit with the model, or choose to explore.",
      assessed: false as const,
    };
  if (plan.reading === "new" || plan.reading === "unsure")
    return {
      background,
      href: "/first-lesson",
      title: "Start with one form",
      why:
        plan.listening === "comfortable"
          ? "Build on what you already understand, one written form at a time."
          : "Meet a form before trying it yourself.",
      assessed: false as const,
    };
  if (plan.goal === "words")
    return {
      background,
      href: "/preview/unit-02-first-words/path.html",
      title: "Explore picture words",
      why: "Try the existing word preview. You can return to Fidäl whenever you want.",
      assessed: false as const,
    };
  return {
    background,
    href: "/preview/unit-01-fidel-foundations/index.html",
    title: "Explore a Fidäl family",
    why: "Choose a familiar family or take the short first practice.",
    assessed: false as const,
  };
}

export type FirstStep = "meet" | "trace" | "match" | "recall" | "recap";
export interface FirstPractice {
  sessionId: string;
  target: string;
  step: FirstStep;
  heard: boolean;
  drawing: "not_tried" | "drawn" | "text" | "skipped";
  matched: boolean;
  recalled: boolean;
  recallHelp: boolean;
  needsRetry: boolean;
}
export type FirstAction =
  | { type: "heard" }
  | { type: "next" }
  | { type: "trace"; mode: "drawn" | "text" | "skipped" }
  | { type: "answer"; correct: boolean }
  | { type: "help" }
  | { type: "retry" };
export function firstPractice(
  sessionId: string,
  target: string,
): FirstPractice {
  return {
    sessionId,
    target,
    step: "meet",
    heard: false,
    drawing: "not_tried",
    matched: false,
    recalled: false,
    recallHelp: false,
    needsRetry: false,
  };
}
export function firstTransition(
  s: FirstPractice,
  a: FirstAction,
): FirstPractice {
  if (a.type === "heard") return { ...s, heard: true };
  if (a.type === "help" && s.step === "recall")
    return { ...s, recallHelp: true };
  if (a.type === "retry") return { ...s, needsRetry: false };
  if (a.type === "trace" && s.step === "trace")
    return { ...s, drawing: a.mode };
  if (
    a.type === "answer" &&
    !s.needsRetry &&
    (s.step === "match" || s.step === "recall")
  ) {
    if (
      (s.step === "match" && s.matched) ||
      (s.step === "recall" && s.recalled)
    )
      return s;
    if (!a.correct)
      return {
        ...s,
        needsRetry: true,
        recallHelp: s.recallHelp || s.step === "recall",
      };
    return s.step === "match"
      ? { ...s, matched: true }
      : { ...s, recalled: true };
  }
  if (a.type !== "next") return s;
  if (s.step === "meet") return { ...s, step: "trace" };
  if (s.step === "trace" && s.drawing !== "not_tried")
    return { ...s, step: "match" };
  if (s.step === "match" && s.matched) return { ...s, step: "recall" };
  if (s.step === "recall" && s.recalled) return { ...s, step: "recap" };
  return s;
}
export interface VisitPractice extends FirstPractice {
  finishedAt: string;
  contentRevision: string;
}
export function visitSummary(records: VisitPractice[]) {
  const latest = records.at(-1);
  if (!latest)
    return {
      what: "No first practice recorded in this visit.",
      progress: "A small step is ready.",
      review: "Try one form together.",
      next: "/first-lesson",
    };
  return {
    what: `Was shown ${latest.target} and found its match with a model.`,
    progress:
      latest.drawing === "drawn"
        ? "Tried drawing over the printed shape."
        : latest.drawing === "text"
          ? "Used text instead of drawing."
          : "Chose a visual alternative to drawing.",
    review: latest.recallHelp
      ? "The final shape check used help. Another gentle look may help."
      : "Found the form after the model was hidden. This was a same-visit shape check.",
    next: "/first-lesson",
  };
}
