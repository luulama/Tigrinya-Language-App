import { DefaultScheduler, Rating } from "ts-fsrs";
export type LearningKind =
  | "vocabulary"
  | "phrase"
  | "sentence"
  | "grammar"
  | "story"
  | "dialogue"
  | "listening"
  | "speaking"
  | "writing"
  | "culture"
  | "pronunciation"
  | "form";
export interface LearningObject {
  id: string;
  kind: LearningKind;
  difficulty: number;
  visibility: "private" | "preview" | "learner";
  approvalState: "pending" | "approved";
  prerequisites: string[];
}
export interface VocabularyItem extends LearningObject {
  kind: "vocabulary";
  senseId: string;
}
export interface PhraseItem extends LearningObject {
  kind: "phrase";
  functionId: string;
}
export interface SentenceItem extends LearningObject {
  kind: "sentence";
  patternIds: string[];
}
export interface GrammarItem extends LearningObject {
  kind: "grammar";
  patternId: string;
}
export interface StoryItem extends LearningObject {
  kind: "story";
  segmentIds: string[];
}
export interface DialogueItem extends LearningObject {
  kind: "dialogue";
  roleIds: string[];
}
export interface ListeningItem extends LearningObject {
  kind: "listening";
  audioId: string;
}
export interface SpeakingItem extends LearningObject {
  kind: "speaking";
  rubricId: string;
}
export interface WritingItem extends LearningObject {
  kind: "writing";
  rubricId: string;
}
export interface CulturalItem extends LearningObject {
  kind: "culture";
  sourceIds: string[];
}
export type ReviewOutcome = 1 | 2 | 3 | 4;
export interface ReviewEvent {
  id: string;
  at: Date;
  outcome: ReviewOutcome;
  helped: boolean;
  modelFirst: boolean;
}
export interface MemoryModel<T> {
  version: string;
  initial(id: string, now: Date): Promise<T>;
  review(state: T, event: ReviewEvent): Promise<T>;
  dueAt(state: T): Date;
}
export interface LearningState<T> {
  targetKey: string;
  algorithm: string;
  memory: T;
  lastExposureAt: Date | null;
  lastAttemptAt: Date | null;
  eventIds: string[];
  independentCorrect: number;
  independentAttempts: number;
  delayedCorrect: number;
  delayedAttempts: number;
}
export interface MasteryScore {
  correct: number;
  attempts: number;
  value: number | null;
}
export interface RetentionScore {
  correct: number;
  attempts: number;
  observed: number | null;
  predicted: null;
}
export const masteryScore = (
  correct: number,
  attempts: number,
): MasteryScore => ({
  correct,
  attempts,
  value: attempts >= 5 ? (100 * correct) / attempts : null,
});
export const retentionScore = (
  correct: number,
  attempts: number,
): RetentionScore => ({
  correct,
  attempts,
  observed: attempts >= 5 ? (100 * correct) / attempts : null,
  predicted: null,
});
const DAY = 86400000;
export class SchedulingEngine<T> {
  constructor(readonly model: MemoryModel<T>) {}
  async initial(targetKey: string, now: Date): Promise<LearningState<T>> {
    if (!targetKey || !Number.isFinite(now.getTime()))
      throw Error("Invalid target or time");
    return {
      targetKey,
      algorithm: this.model.version,
      memory: await this.model.initial(targetKey, now),
      lastExposureAt: null,
      lastAttemptAt: null,
      eventIds: [],
      independentCorrect: 0,
      independentAttempts: 0,
      delayedCorrect: 0,
      delayedAttempts: 0,
    };
  }
  async review(
    state: LearningState<T>,
    event: ReviewEvent,
  ): Promise<LearningState<T>> {
    if (state.algorithm !== this.model.version)
      throw Error("Migrate the algorithm explicitly before reviewing");
    if (
      !event.id ||
      !Number.isFinite(event.at.getTime()) ||
      ![1, 2, 3, 4].includes(event.outcome)
    )
      throw Error("Invalid review event");
    if (state.eventIds.includes(event.id)) return state;
    if (state.lastAttemptAt && event.at < state.lastAttemptAt)
      throw Error("Review time cannot move backwards");
    const next = structuredClone(state);
    const delayed =
      state.lastExposureAt !== null &&
      event.at.getTime() - state.lastExposureAt.getTime() >= DAY;
    const independent =
      !event.helped &&
      !event.modelFirst &&
      (state.lastExposureAt === null || delayed);
    const correct = event.outcome !== 1;
    if (independent) {
      next.independentAttempts++;
      if (correct) next.independentCorrect++;
      if (delayed) {
        next.delayedAttempts++;
        if (correct) next.delayedCorrect++;
      }
    }
    if (independent || event.helped || event.modelFirst || !correct)
      next.memory = await this.model.review(state.memory, {
        ...event,
        outcome: event.helped || event.modelFirst ? 1 : event.outcome,
      });
    next.lastAttemptAt = event.at;
    next.lastExposureAt = event.at;
    next.eventIds.push(event.id);
    return next;
  }
}
export interface Sm2State {
  dueAt: Date;
  ease: number;
  repetitions: number;
  intervalDays: number;
}
export class Sm2MemoryModel implements MemoryModel<Sm2State> {
  version = "sm2-v1";
  async initial(_id: string, now: Date): Promise<Sm2State> {
    return { dueAt: now, ease: 2.5, repetitions: 0, intervalDays: 0 };
  }
  async review(state: Sm2State, event: ReviewEvent): Promise<Sm2State> {
    if (event.outcome === 1)
      return {
        ...state,
        dueAt: new Date(event.at.getTime() + DAY),
        repetitions: 0,
        intervalDays: 1,
      };
    if (event.at < state.dueAt) return state;
    const quality = event.outcome === 2 ? 3 : event.outcome === 3 ? 4 : 5;
    const intervalDays =
      state.repetitions === 0
        ? 1
        : state.repetitions === 1
          ? 6
          : Math.min(36500, Math.round(state.intervalDays * state.ease));
    const ease = Math.max(
      1.3,
      state.ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
    );
    return {
      dueAt: new Date(event.at.getTime() + intervalDays * DAY),
      ease,
      repetitions: state.repetitions + 1,
      intervalDays,
    };
  }
  dueAt(state: Sm2State) {
    return state.dueAt;
  }
}
async function fsrs() {
  return DefaultScheduler({
    version: "FSRS-7",
    desiredRetention: 0.9,
    enableFuzz: false,
    maximumInterval: 36500,
    enableShortTerm: true,
  });
}
export type FsrsState = ReturnType<Awaited<ReturnType<typeof fsrs>>["newCard"]>;
export class FsrsMemoryModel implements MemoryModel<FsrsState> {
  version = "fsrs-7-default-v1";
  private scheduler = fsrs();
  async initial(id: string, now: Date): Promise<FsrsState> {
    return (await this.scheduler).newCard({ cardId: id, now });
  }
  async review(state: FsrsState, event: ReviewEvent): Promise<FsrsState> {
    return (await this.scheduler).review({
      card: state,
      grade: event.outcome as
        Rating.Again | Rating.Hard | Rating.Good | Rating.Easy,
      now: event.at,
    }).card;
  }
  dueAt(state: FsrsState) {
    return state.dueAt;
  }
}
export class ReviewQueue<T> {
  constructor(private engine: SchedulingEngine<T>) {}
  plan(
    targets: { object: LearningObject; state: LearningState<T> }[],
    now: Date,
    budget: number,
    demonstrated: Set<string>,
  ) {
    if (!Number.isInteger(budget) || budget < 0) throw Error("Invalid budget");
    return targets
      .filter(
        (t) =>
          t.object.approvalState === "approved" &&
          t.object.visibility === "learner" &&
          t.object.prerequisites.every((id) => demonstrated.has(id)) &&
          this.engine.model.dueAt(t.state.memory) <= now,
      )
      .sort(
        (a, b) =>
          this.engine.model.dueAt(a.state.memory).getTime() -
            this.engine.model.dueAt(b.state.memory).getTime() ||
          a.object.id.localeCompare(b.object.id),
      )
      .slice(0, budget);
  }
}
