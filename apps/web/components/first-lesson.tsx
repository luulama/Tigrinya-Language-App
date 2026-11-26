"use client";
import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import { Badge, Button } from "@polyglot/ui";
import { firstPractice, firstTransition } from "../lib/learning-start";
import type { FirstLessonContent } from "../lib/first-lesson-content";
import { MeleCompanion, useJourney } from "./learning-journey";
import { CheckIcon, PauseIcon, SparklesIcon } from "./icons";

type Point = [number, number];
function TracePad({
  target,
  onTried,
}: {
  target: string;
  onTried: (mode: "drawn" | "text" | "skipped") => void;
}) {
  const [paths, setPaths] = useState<Point[][]>([]),
    [draft, setDraft] = useState<Point[]>([]),
    [text, setText] = useState("");
  const [typing, setTyping] = useState(false),
    [message, setMessage] = useState("");
  const active = useRef<{ id: number; points: Point[] } | null>(null),
    history = useRef<Point[][][]>([]);
  const remember = () => {
    history.current.push(paths);
    if (history.current.length > 20) history.current.shift();
  };
  function point(e: React.PointerEvent<SVGSVGElement>): Point | null {
    const r = e.currentTarget.getBoundingClientRect();
    if (
      !r.width ||
      !r.height ||
      !Number.isFinite(e.clientX) ||
      !Number.isFinite(e.clientY)
    )
      return null;
    return [
      Math.max(0, Math.min(400, ((e.clientX - r.left) / r.width) * 400)),
      Math.max(0, Math.min(300, ((e.clientY - r.top) / r.height) * 300)),
    ];
  }
  const cancel = () => {
    active.current = null;
    setDraft([]);
  };
  return (
    <div className="first-writing">
      {!typing ? (
        <>
          <svg
            viewBox="0 0 400 300"
            role="img"
            aria-label={`Draw over the printed form ${target}`}
            aria-describedby="trace-note"
            className="first-pad"
            onPointerDown={(e) => {
              if (active.current || e.button !== 0 || paths.length >= 40)
                return;
              const p = point(e);
              if (!p) return;
              active.current = { id: e.pointerId, points: [p] };
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {}
              setDraft([p]);
              e.preventDefault();
            }}
            onPointerMove={(e) => {
              const a = active.current;
              if (!a || a.id !== e.pointerId) return;
              const p = point(e);
              if (!p) return;
              if (a.points.length < 512) a.points.push(p);
              setDraft([...a.points]);
            }}
            onPointerUp={(e) => {
              const a = active.current;
              if (!a || a.id !== e.pointerId) return;
              active.current = null;
              if (a.points.length > 1) {
                remember();
                setPaths([...paths, a.points]);
                onTried("drawn");
                setMessage("Your marks are here. You can try again.");
              }
              setDraft([]);
              try {
                e.currentTarget.releasePointerCapture(e.pointerId);
              } catch {}
            }}
            onPointerCancel={cancel}
            onLostPointerCapture={() => {
              if (active.current) cancel();
            }}
          >
            <rect width="400" height="300" rx="18" fill="#fffdf8" />
            <line
              x1="28"
              y1="72"
              x2="372"
              y2="72"
              stroke="#e5dfd1"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
            <line
              x1="28"
              y1="235"
              x2="372"
              y2="235"
              stroke="#d5cdb9"
              strokeWidth="1.5"
            />
            <text
              x="200"
              y="235"
              textAnchor="middle"
              className="entry-fidal"
              fill="#7d9a8b"
              opacity="0.72"
              fontSize="240"
              lang="ti"
              direction="ltr"
            >
              {target}
            </text>
            {[...paths, ...(draft.length ? [draft] : [])].map((points, i) => (
              <path
                key={i}
                d={points
                  .map((p, n) => `${n ? "L" : "M"}${p[0]},${p[1]}`)
                  .join(" ")}
                fill="none"
                stroke="#14614c"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          <p id="trace-note" className="small">
            Printed shape · stroke order isn’t checked. Marks stay in this
            practice.
          </p>
          <div className="actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const old = history.current.pop();
                if (old) {
                  setPaths(old);
                  setMessage("Last change undone.");
                }
              }}
              disabled={!history.current.length}
            >
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                remember();
                setPaths([]);
                setMessage("Cleared. Undo brings your marks back.");
              }}
              disabled={!paths.length}
            >
              Clear
            </Button>
            <Button
              variant="quiet"
              size="sm"
              onClick={() => {
                cancel();
                setTyping(true);
              }}
            >
              Use keys instead
            </Button>
          </div>
        </>
      ) : (
        <>
          <label>
            Enter the form{" "}
            <span className="entry-fidal" lang="ti" dir="ltr">
              {target}
            </span>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              lang="ti"
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              maxLength={16}
            />
          </label>
          <div className="actions">
            <Button variant="outline" onClick={() => setText(target)}>
              Insert <span lang="ti">{target}</span>
            </Button>
            <Button
              onClick={() => {
                if (text.normalize("NFC") === target.normalize("NFC")) {
                  onTried("text");
                  setMessage("Same form. This checks text, not handwriting.");
                } else setMessage("Compare with the form. You can use Insert.");
              }}
            >
              Compare text
            </Button>
          </div>
        </>
      )}
      <p className="small" role="status">
        {message}
      </p>
      <Button variant="quiet" size="sm" onClick={() => onTried("skipped")}>
        Choose a shape instead of drawing
      </Button>
    </div>
  );
}

export function FirstLesson({ content }: { content: FirstLessonContent }) {
  const { finish, records, plan } = useJourney();
  const [state, dispatch] = useReducer(
    firstTransition,
    firstPractice("first-practice", content.target),
  );
  const session = useRef<string | null>(null),
    audio = useRef<HTMLAudioElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const [paused, setPaused] = useState(false),
    [soundError, setSoundError] = useState("");
  useEffect(() => {
    session.current = crypto.randomUUID();
  }, []);
  const previousPosition = useRef({ step: state.step, paused });
  useEffect(() => {
    if (
      previousPosition.current.step !== state.step ||
      previousPosition.current.paused !== paused
    ) {
      previousPosition.current = { step: state.step, paused };
      heading.current?.focus();
    }
    const media = audio.current;
    return () => media?.pause();
  }, [state.step, paused]);
  useEffect(() => {
    if (state.step === "recap" && session.current)
      finish({
        ...state,
        sessionId: session.current,
        contentRevision: content.revision,
        finishedAt: new Date().toISOString(),
      });
  }, [state.step, finish, state, content.revision]);
  const captions = {
    meet: "Look first. We can take one small step.",
    trace: "Try a mark, or choose another way.",
    match: "Look at the model. Find the same form.",
    recall: "Try once with the model hidden. Help is here.",
    recap: "You tried a small practice. You can stop here.",
  };
  const names = {
    meet: "Meet one form",
    trace: "Try its shape",
    match: "Find the same form",
    recall: "Which form did you see?",
    recap: "Your first practice",
  };
  if (!content.target || content.options.length < 3)
    return (
      <section className="entry-panel">
        <h1>First practice is unavailable.</h1>
        <p>No usable source form was found.</p>
        <Link className="button button-outline" href="/learn">
          Choose another activity
        </Link>
      </section>
    );
  const stepOrder = ["meet", "trace", "match", "recall", "recap"] as const;
  const stepIndex = stepOrder.indexOf(state.step);
  const nextAllowed =
    state.step === "meet" ||
    (state.step === "trace" && state.drawing !== "not_tried") ||
    (state.step === "match" && state.matched) ||
    (state.step === "recall" && state.recalled);
  const options =
    state.step === "match"
      ? [content.options[1], content.options[0], content.options[2]]
      : [content.options[2], content.options[1], content.options[0]];

  const feedbackTone = state.needsRetry
    ? "feedback-banner feedback-banner-kind"
    : (state.step === "match" && state.matched) ||
        (state.step === "recall" && state.recalled)
      ? "feedback-banner feedback-banner-success"
      : "";

  return (
    <section className="entry-shell" aria-label="First Fidäl practice">
      <p className="eyebrow">ONE FORM · YOUR PACE</p>
      <div className="entry-progress" aria-label={`Step ${stepIndex + 1} of 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} data-done={n <= stepIndex + 1} />
        ))}
      </div>
      <h1 ref={heading} tabIndex={-1}>
        {paused ? "We can pause here." : names[state.step]}
      </h1>
      <MeleCompanion
        state={
          paused
            ? "resting"
            : state.needsRetry
              ? "kind"
              : state.step === "recap"
                ? "celebrating"
                : "encouraging"
        }
        caption={paused ? "Your practice can wait." : captions[state.step]}
        onPause={() => {
          audio.current?.pause();
          setPaused(true);
        }}
      />
      {paused ? (
        <div className="entry-panel animate-panel">
          <p>
            Your place in this small practice is saved for this visit. Take all
            the time you need.
          </p>
          <div className="actions">
            <Button onClick={() => setPaused(false)}>
              Continue this practice
            </Button>
            <Link className="button button-outline" href="/learn">
              Leave for now
            </Link>
          </div>
        </div>
      ) : (
        <div className="entry-panel animate-panel" key={state.step}>
          {state.step === "meet" && (
            <>
              <div className="first-stage">
                <div className="first-form entry-fidal" lang="ti" dir="ltr">
                  {content.target}
                </div>
              </div>
              {content.audioUrl ? (
                <>
                  <audio
                    ref={audio}
                    src={content.audioUrl}
                    onPlaying={() => dispatch({ type: "heard" })}
                    onError={() =>
                      setSoundError(
                        "Sound couldn’t play. You can continue with the shape.",
                      )
                    }
                    preload="none"
                  />
                  <Button
                    onClick={() =>
                      audio.current
                        ?.play()
                        .catch(() =>
                          setSoundError(
                            "Tap again to play, or continue with the shape.",
                          ),
                        )
                    }
                  >
                    Hear the form
                  </Button>
                  <p className="small" role="status">
                    {soundError}
                  </p>
                </>
              ) : (
                <p className="entry-note">
                  Reviewed sound isn’t available yet. Try the shape preview.
                </p>
              )}
            </>
          )}
          {state.step === "trace" && (
            <TracePad
              target={content.target}
              onTried={(mode) => dispatch({ type: "trace", mode })}
            />
          )}
          {(state.step === "match" || state.step === "recall") && (
            <>
              {(state.step === "match" ||
                state.recallHelp ||
                state.needsRetry) && (
                <div className="first-model-center">
                  <div className="first-model-wrap">
                    <span className="first-model-label">Model</span>
                    <div
                      className="first-model entry-fidal"
                      lang="ti"
                      dir="ltr"
                      aria-label="Model"
                    >
                      {content.target}
                    </div>
                  </div>
                </div>
              )}
              <div
                className="first-choices"
                role="group"
                aria-label="Choose a form"
              >
                {options.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    disabled={
                      state.needsRetry ||
                      (state.step === "match" ? state.matched : state.recalled)
                    }
                    onClick={() =>
                      dispatch({
                        type: "answer",
                        correct: option === content.target,
                      })
                    }
                  >
                    <span className="entry-fidal" lang="ti" dir="ltr">
                      {option}
                    </span>
                  </Button>
                ))}
              </div>
              {state.step === "recall" && !state.recalled && (
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={() => dispatch({ type: "help" })}
                >
                  Show the model
                </Button>
              )}
              <p className={feedbackTone || "small"} role="status">
                {state.needsRetry
                  ? "Here is the model. Have another look, then try again."
                  : state.step === "match" && state.matched
                    ? "Same form. You found its match."
                    : state.step === "recall" && state.recalled
                      ? state.recallHelp
                        ? "You found it with help."
                        : "You found it with the model hidden."
                      : ""}
              </p>
              {state.needsRetry && (
                <div className="actions">
                  <Button onClick={() => dispatch({ type: "retry" })}>
                    Try again
                  </Button>
                </div>
              )}
            </>
          )}
          {state.step === "recap" ? (
            <>
              <div className="milestone-emblem">
                <Badge tone="review">
                  <SparklesIcon size={14} /> First Fidäl met
                </Badge>
                <div className="first-form entry-fidal" lang="ti" dir="ltr">
                  {content.target}
                </div>
              </div>
              <ul className="recap-checklist">
                <li>
                  <span className="recap-dot" aria-hidden="true">
                    <CheckIcon size={14} />
                  </span>
                  <span>Found the form with a model.</span>
                </li>
                <li>
                  <span className="recap-dot" aria-hidden="true">
                    <CheckIcon size={14} />
                  </span>
                  <span>
                    {state.drawing === "drawn"
                      ? "Tried drawing its shape."
                      : state.drawing === "text"
                        ? "Used text instead of drawing."
                        : "Used a visual alternative to drawing."}
                  </span>
                </li>
                <li>
                  <span className="recap-dot" aria-hidden="true">
                    <CheckIcon size={14} />
                  </span>
                  <span>
                    {state.recallHelp
                      ? "Found it again with help."
                      : "Found it with the model hidden."}
                  </span>
                </li>
                <li>
                  <span className="recap-dot" aria-hidden="true">
                    <CheckIcon size={14} />
                  </span>
                  <span>
                    {state.heard
                      ? "The reviewed model played."
                      : "Sound wasn’t practised."}
                  </span>
                </li>
              </ul>
              <p className="small">
                A same-visit shape check, not a reading or pronunciation
                assessment. Revisit another day.
              </p>
              <div className="actions">
                <Link
                  className="button button-primary button-lg"
                  href={
                    plan.goal === "words"
                      ? "/preview/unit-02-first-words/path.html"
                      : "/preview/unit-01-fidel-foundations/index.html"
                  }
                >
                  Choose the next small step
                </Link>
                <Link className="button button-outline" href="/parents">
                  Show a grown-up
                </Link>
                <Link className="button button-quiet" href="/learn">
                  Stop here
                </Link>
              </div>
            </>
          ) : (
            <Button
              className="entry-next"
              disabled={!nextAllowed}
              onClick={() => dispatch({ type: "next" })}
            >
              {state.step === "meet"
                ? "Try the shape"
                : state.step === "recall"
                  ? "See my practice"
                  : "Next"}
            </Button>
          )}
        </div>
      )}
      {!paused && state.step !== "recap" && (
        <Button
          variant="quiet"
          size="sm"
          onClick={() => {
            audio.current?.pause();
            setPaused(true);
          }}
        >
          <PauseIcon size={15} /> Pause
        </Button>
      )}
      <details className="entry-details">
        <summary>For grown-ups</summary>
        <p>
          About a minute is a design target, not a timer. All language and
          visual associations remain pending native review. Tracing uses a
          printed model; no stroke order or handwriting grade is invented.{" "}
          {records.length
            ? "Practice observations stay in this visit."
            : "No account, microphone or analytics upload is needed."}
        </p>
        <Link href="/onboarding">Choose a starting plan</Link>
      </details>
    </section>
  );
}
