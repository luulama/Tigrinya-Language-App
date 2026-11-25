import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { MeleStage, useReducedMotion } from "./MeleStage";
import {
  createSnapshot,
  MELE_STATES,
  reduceMotion,
  type MeleState,
} from "./motion";
import idle from "../../../shared/mascot/assets/neri-idle.svg?url";
import listening from "../../../shared/mascot/assets/neri-listening.svg?url";
import thinking from "../../../shared/mascot/assets/neri-thinking.svg?url";
import teaching from "../../../shared/mascot/assets/neri-demonstrating.svg?url";
import celebrating from "../../../shared/mascot/assets/neri-celebrating.svg?url";
import encouraging from "../../../shared/mascot/assets/neri-encouraging.svg?url";
import waiting from "../../../shared/mascot/assets/neri-resting.svg?url";
import sleeping from "../../../shared/mascot/assets/neri-sleepy.svg?url";
import "./tokens.css";
import "./lab.css";

const posters: Record<MeleState, string> = {
  idle,
  walking: idle,
  talking: teaching,
  listening,
  thinking,
  teaching,
  celebrating,
  encouraging,
  waiting,
  sleeping,
};

function Lab() {
  const [snapshot, setSnapshot] = useState(() =>
    createSnapshot({
      sessionId: "design-lab",
      taskRevision: "design-fixture-1",
      nativeModelReady: false,
    }),
  );
  const [pose, setPose] = useState<MeleState | null>(null);
  const [status, setStatus] = useState(
    "Choose a pose to inspect its static fallback.",
  );
  const [still, setStill] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const reduced = useReducedMotion(still);
  useEffect(() => {
    const update = () => {
      const visible = document.visibilityState !== "hidden";
      if (!visible) setPose(null);
      setSnapshot((value) => reduceMotion(value, { type: "policy", visible }));
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const effective = {
    ...snapshot,
    pose: pose ?? snapshot.pose,
    reduced,
    quiet,
  };
  return (
    <main data-reduced={reduced}>
      <p className="eyebrow">DESIGN LAB · NO SPEECH OR LEARNING SCORE</p>
      <h1>Mele, one clear moment.</h1>
      <p>
        Original project bear artwork, explored under the proposed Mele
        identity. Pose studies do not demonstrate pronunciation. A full walking
        rig is not authored here.
      </p>
      <div className="lab-layout">
        <section className="panel">
          <MeleStage snapshot={effective} posters={posters} status={status} />
          <p className="diagnostic">
            Pose: <strong data-testid="pose">{effective.pose}</strong> ·
            Accepted sequence:{" "}
            <span data-testid="sequence">{snapshot.sequence}</span>
          </p>
          <div className="actions">
            <button
              type="button"
              aria-pressed={quiet}
              onClick={() => setQuiet(!quiet)}
            >
              Quiet view
            </button>
            <button
              type="button"
              aria-pressed={still}
              onClick={() => setStill(!still)}
            >
              Still view
            </button>
          </div>
          <button
            className="primary"
            type="button"
            onClick={() => {
              setPose(null);
              setSnapshot((value) =>
                createSnapshot({
                  ...value,
                  sessionId: `${value.sessionId}-next`,
                }),
              );
              setStatus("Next action available. No animation wait.");
            }}
          >
            Next step
          </button>
        </section>
        <section className="panel" aria-label="Pose study controls">
          <h2>Ten acting states</h2>
          <div className="poses">
            {MELE_STATES.map((state) => (
              <button
                type="button"
                key={state}
                aria-pressed={effective.pose === state}
                onClick={() => {
                  setPose(state);
                  setStatus(
                    `Pose study: ${state}. No teaching audio is connected.`,
                  );
                }}
              >
                {state}
              </button>
            ))}
          </div>
          <h2>Check the event boundary</h2>
          <div className="actions">
            <button
              onClick={() => {
                setPose(null);
                setSnapshot((value) =>
                  reduceMotion(value, {
                    sessionId: value.sessionId,
                    taskRevision: value.taskRevision,
                    type: "activity-confirmed",
                    sequence: value.sequence + 1,
                  }),
                );
                setStatus(
                  "Practice acknowledgement fixture. No score was awarded.",
                );
              }}
            >
              Confirm practice
            </button>
            <button
              onClick={() =>
                setSnapshot((value) =>
                  reduceMotion(value, {
                    sessionId: value.sessionId,
                    taskRevision: value.taskRevision,
                    type: "activity-confirmed",
                    sequence: value.sequence,
                  }),
                )
              }
            >
              Replay same event
            </button>
            <button
              onClick={() => {
                setPose(null);
                setSnapshot((value) =>
                  reduceMotion(value, {
                    ...value,
                    type: "model-playing",
                    sequence: value.sequence + 1,
                    playbackId: "blocked-fixture",
                  }),
                );
                setStatus(
                  "No approved media connected. The talking sequence stays unavailable.",
                );
              }}
            >
              Check missing audio
            </button>
          </div>
        </section>
      </div>
      <aside>
        Static text and Next step remain usable with Still view, missing
        artwork, offline assets or no animation API. The live app remains
        unchanged.
      </aside>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Lab />
  </StrictMode>,
);
