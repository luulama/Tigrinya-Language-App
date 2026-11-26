"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { BearCompanion, type BearState } from "./bear-companion";
import {
  DEFAULT_PLAN,
  type StartingPlan,
  type VisitPractice,
} from "../lib/learning-start";

export type GuideLanguage = "en" | "sv";

const JourneyContext = createContext<{
  plan: StartingPlan;
  setPlan: (plan: StartingPlan) => void;
  guideLanguage: GuideLanguage;
  setGuideLanguage: (language: GuideLanguage) => void;
  records: VisitPractice[];
  finish: (record: VisitPractice) => void;
  reset: () => void;
} | null>(null);

export function LearningJourneyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [plan, setPlan] = useState<StartingPlan>({ ...DEFAULT_PLAN });
  const [guideLanguage, setGuideLanguage] = useState<GuideLanguage>("en");
  const [records, setRecords] = useState<VisitPractice[]>([]);
  const finish = useCallback(
    (record: VisitPractice) =>
      setRecords((old) =>
        old.some((x) => x.sessionId === record.sessionId)
          ? old
          : [...old.slice(-9), record],
      ),
    [],
  );
  const reset = useCallback(() => {
    setPlan({ ...DEFAULT_PLAN });
    setGuideLanguage("en");
    setRecords([]);
  }, []);
  return (
    <JourneyContext.Provider
      value={{
        plan,
        setPlan,
        guideLanguage,
        setGuideLanguage,
        records,
        finish,
        reset,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const context = useContext(JourneyContext);
  if (!context) throw new Error("Learning journey provider is missing");
  return context;
}

export function MeleCompanion({
  state = "encouraging",
  caption = "Take your time. You can stop whenever you want.",
  onPause,
}: {
  state?: BearState;
  caption?: string;
  onPause?: () => void;
}) {
  const { plan, setPlan } = useJourney();
  const [reply, setReply] = useState("");
  return (
    <div className="journey-companion">
      <BearCompanion
        name="Mele"
        state={state}
        caption={caption}
        quiet={plan.quiet}
        onQuietChange={(quiet) => setPlan({ ...plan, quiet })}
      />
      <details>
        <summary>Choose how we go</summary>
        <div className="actions">
          <button
            className="button button-outline button-sm"
            type="button"
            aria-pressed={plan.pace === "step"}
            onClick={() => {
              setPlan({ ...plan, pace: "step" });
              setReply("We can take one step at a time.");
            }}
          >
            One step at a time
          </button>
          <button
            className="button button-outline button-sm"
            type="button"
            aria-pressed={plan.pace === "explore"}
            onClick={() => {
              setPlan({ ...plan, pace: "explore" });
              setReply(
                "You can explore, and return to a model whenever you want.",
              );
            }}
          >
            Let me explore
          </button>
          {onPause && (
            <button
              className="button button-quiet button-sm"
              type="button"
              onClick={onPause}
            >
              I need a break
            </button>
          )}
        </div>
        <p className="small" role="status">
          {reply}
        </p>
      </details>
    </div>
  );
}
