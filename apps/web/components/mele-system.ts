import type { BearState } from "./bear-companion";

export interface MeleMoodProfile {
  label: string;
  tone: "calm" | "warm" | "celebration" | "support" | "rest";
  defaultCaption: string;
}

/**
 * Mele Design System — Phase 6
 * Personality: patient, supportive, wise, friendly.
 * Never loud, distracting, scolding, or gamified.
 */
export const MELE_MOODS: Record<BearState, MeleMoodProfile> = {
  idle: {
    label: "Mele · Ready",
    tone: "calm",
    defaultCaption: "I’m Mele. Let’s take one small step.",
  },
  encouraging: {
    label: "Mele · With you",
    tone: "calm",
    defaultCaption: "Look first. Try when you’re ready.",
  },
  listening: {
    label: "Mele · Listening",
    tone: "calm",
    defaultCaption: "Take a quiet moment to listen closely.",
  },
  thinking: {
    label: "Mele · Checking",
    tone: "calm",
    defaultCaption: "Take a moment while we check.",
  },
  celebrating: {
    label: "Mele · Step complete",
    tone: "celebration",
    defaultCaption: "One small step completed. Notice how it feels.",
  },
  kind: {
    label: "Mele · Gentle help",
    tone: "support",
    defaultCaption: "Have another look at the model. You can try again.",
  },
  demonstrating: {
    label: "Mele · Showing",
    tone: "warm",
    defaultCaption: "Notice the shape before you try it.",
  },
  resting: {
    label: "Mele · Resting",
    tone: "rest",
    defaultCaption: "Your place is safe. Rest as long as you need.",
  },
  sleepy: {
    label: "Mele · Quiet story",
    tone: "rest",
    defaultCaption: "Settling in for a quiet read.",
  },
};

export const MELE_EMPTY_STATES = {
  review: {
    state: "resting" as BearState,
    caption: "Nothing is waiting right now. Choose a gentle new step or rest here.",
  },
  progress: {
    state: "encouraging" as BearState,
    caption: "Every journey begins with a single shape. Your first practice is ready.",
  },
  achievements: {
    state: "idle" as BearState,
    caption: "Milestones grow slowly from real practice. Every visit counts.",
  },
  library: {
    state: "encouraging" as BearState,
    caption: "While new lessons are reviewed, the visual Fidäl and word previews are ready to explore.",
  },
};
