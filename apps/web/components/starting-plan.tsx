"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge, Button } from "@polyglot/ui";
import { request } from "../lib/api";
import {
  DEFAULT_PLAN,
  startingRecommendation,
  validPlan,
  type Familiarity,
  type SavedStartingPlan,
} from "../lib/learning-start";
import { usePreferences } from "../lib/preferences";
import {
  MeleCompanion,
  useJourney,
  type GuideLanguage,
} from "./learning-journey";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "./icons";

export function PlanMemoryControls() {
  const { plan, setPlan, reset } = useJourney();
  const [revision, setRevision] = useState<string | null>(null),
    [message, setMessage] = useState("");
  const busy = useRef(false);
  const latestPlan = useRef(plan);
  latestPlan.current = plan;
  const operation = useRef<AbortController | null>(null);
  useEffect(() => () => operation.current?.abort(), []);
  const [working, setWorking] = useState(false);
  async function perform(action: "save" | "load" | "forget") {
    if (busy.current) return;
    busy.current = true;
    const controller = new AbortController();
    operation.current = controller;
    const submitted = JSON.stringify(plan);
    setWorking(true);
    setMessage("");
    try {
      if (action === "forget") {
        const current =
          revision ??
          (
            await request<SavedStartingPlan | null>(
              "/api/users/me/learning-start",
              { signal: controller.signal },
              true,
            )
          )?.revision;
        await request(
          "/api/users/me/learning-start",
          {
            method: "DELETE",
            signal: controller.signal,
            headers: current ? { "If-Match": `"${current}"` } : {},
          },
          true,
        );
        setRevision(null);
        if (JSON.stringify(latestPlan.current) === submitted)
          setPlan({ ...DEFAULT_PLAN });
        setMessage("Saved plan forgotten. Existing course progress was kept.");
      } else {
        const value = await request<SavedStartingPlan | null>(
          "/api/users/me/learning-start",
          action === "save"
            ? {
                method: "PUT",
                body: JSON.stringify({ ...plan, revision }),
                signal: controller.signal,
              }
            : { signal: controller.signal },
          true,
        );
        if (!value) {
          setRevision(null);
          setMessage("There is no saved plan yet.");
          return;
        }
        if (!validPlan(value) || typeof value.revision !== "string")
          throw new Error(
            "The saved plan could not be read. This visit still works.",
          );
        const { listening, speaking, reading, goal, pace, quiet } = value;
        if (controller.signal.aborted) return;
        const changed = JSON.stringify(latestPlan.current) !== submitted;
        if (action === "load")
          if (!changed)
            setPlan({ listening, speaking, reading, goal, pace, quiet });
        setRevision(value.revision);
        setMessage(
          changed
            ? "Your choices changed while waiting. The newer choices in this visit were kept; save them when ready."
            : action === "load"
              ? "Your saved choices are here. You can change them."
              : "Only your starting choices and companion preferences were saved.",
        );
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      setMessage((error as Error).message);
    } finally {
      busy.current = false;
      if (!controller.signal.aborted) setWorking(false);
    }
  }
  return (
    <details className="entry-details">
      <summary>What Mele remembers</summary>
      <p>
        By default, your plan and practice stay in this visit. Reloading clears
        them. Mele is an app guide, not a person or a private chat.
      </p>
      <p>
        With an existing account, you can choose to save just these starting
        choices, pace and Quiet view. No drawings, conversations, voice, mood or
        ability score are saved here.
      </p>
      <div className="actions">
        <Button
          variant="outline"
          size="sm"
          disabled={working}
          onClick={() => perform("save")}
        >
          Save plan to my account
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={working}
          onClick={() => perform("load")}
        >
          Load saved plan
        </Button>
        <Button
          variant="quiet"
          size="sm"
          disabled={working}
          onClick={() => perform("forget")}
        >
          Forget saved plan
        </Button>
        <Button
          variant="quiet"
          size="sm"
          disabled={working}
          onClick={() => {
            reset();
            setMessage(
              "This visit’s plan and practice observations were cleared. Saved account data was not changed.",
            );
          }}
        >
          Clear this visit
        </Button>
      </div>
      <p className="small" role="status">
        {message}
      </p>
      <Link href="/signin">Sign in to an existing account</Link>
    </details>
  );
}

const FAMILIARITY_LABELS: Record<Familiarity, string> = {
  new: "New to me",
  some: "Some familiarity",
  comfortable: "Comfortable",
  unsure: "Not sure yet",
};

const BACKGROUND_LABELS: Record<string, string> = {
  starting_fresh: "Starting fresh",
  heritage_listener: "Heritage listener · bridging to script",
  heritage_speaker: "Heritage speaker · building reading & writing",
  literate_speaker: "Familiar reader & speaker",
  mixed_or_unsure: "Flexible starting point",
};

export function StartingPlanPage() {
  const { plan, setPlan, records, guideLanguage, setGuideLanguage } =
    useJourney();
  const preferences = usePreferences();
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const fields = [
    {
      key: "listening",
      title: "When you hear Tigrinya…",
      lead: "Many learners understand Tigrinya at home before they ever read it.",
      choices: [
        {
          label: "It is new to me",
          hint: "I am meeting the sounds for the first time.",
        },
        {
          label: "I understand some",
          hint: "I catch familiar words or phrases from family or friends.",
        },
        {
          label: "I understand comfortably",
          hint: "Everyday spoken Tigrinya already makes sense to me.",
        },
        {
          label: "I’m not sure",
          hint: "We can explore gently and see what feels familiar.",
        },
      ],
    },
    {
      key: "speaking",
      title: "When you speak Tigrinya…",
      lead: "Understanding and speaking grow at different speeds—both are completely natural.",
      choices: [
        {
          label: "I haven’t started",
          hint: "I haven’t tried speaking Tigrinya yet.",
        },
        {
          label: "I use some words",
          hint: "I know greetings or short everyday expressions.",
        },
        {
          label: "I speak comfortably",
          hint: "I hold conversations and want to strengthen reading or writing.",
        },
        {
          label: "I’m not sure",
          hint: "Skip the label—we will keep everything welcoming.",
        },
      ],
    },
    {
      key: "reading",
      title: "When you see Fidäl…",
      lead: "The Ethiopic script is beautifully patterned once you meet one family at a time.",
      choices: [
        {
          label: "The forms are new",
          hint: "Start calmly with a single shape and clear models.",
        },
        {
          label: "I recognise some",
          hint: "A few shapes look familiar, and I want steady fluency.",
        },
        {
          label: "I read comfortably",
          hint: "Jump into words, families, or review whenever you like.",
        },
        {
          label: "I’m not sure",
          hint: "We can open with one gentle form and adjust from there.",
        },
      ],
    },
  ] as const;

  const recommendation = startingRecommendation(plan, records.at(-1));

  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  function move(next: number) {
    setStep(next);
  }

  return (
    <section className="entry-shell">
      <p className="eyebrow">YOUR STARTING PLAN · NO ACCOUNT NEEDED</p>
      <div
        className="entry-progress"
        aria-label={`Step ${step + 1} of 5`}
      >
        {[0, 1, 2, 3, 4].map((n) => (
          <span key={n} data-done={n <= step} />
        ))}
      </div>
      <h1 ref={heading} tabIndex={-1}>
        {step < 3
          ? fields[step].title
          : step === 3
            ? "What would you like to practise?"
            : "A place to begin."}
      </h1>
      {step < 3 && <p>{fields[step].lead}</p>}
      <MeleCompanion
        state={step === 4 ? "celebrating" : "encouraging"}
        caption={
          step < 3
            ? "You can be familiar with the sounds and new to reading. Both are welcome."
            : step === 3
              ? "Shape the look and rhythm to fit your day. You can change any of this later."
              : "This is a starting suggestion. You can change it."
        }
      />

      {step < 3 ? (
        <div className="entry-panel animate-panel" key={`step-${step}`}>
          <div
            className="entry-options"
            role="group"
            aria-label={fields[step].title}
          >
            {(["new", "some", "comfortable", "unsure"] as Familiarity[]).map(
              (level, i) => {
                const choice = fields[step].choices[i];
                const selected = plan[fields[step].key] === level;
                return (
                  <Button
                    key={level}
                    variant="outline"
                    aria-label={choice.label}
                    aria-pressed={selected}
                    onClick={() =>
                      setPlan({ ...plan, [fields[step].key]: level })
                    }
                  >
                    <span className="option-card-content">
                      <span className="option-card-title">{choice.label}</span>
                      <span className="option-card-hint" aria-hidden="true">
                        {choice.hint}
                      </span>
                    </span>
                    <span className="option-check" aria-hidden="true">
                      <CheckIcon size={14} />
                    </span>
                  </Button>
                );
              },
            )}
          </div>
          <div className="actions">
            {step > 0 && (
              <Button variant="quiet" onClick={() => move(step - 1)}>
                Back
              </Button>
            )}
            <Button onClick={() => move(step + 1)}>Next</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setPlan({ ...plan, [fields[step].key]: "unsure" });
                move(step + 1);
              }}
            >
              Skip this question
            </Button>
          </div>
        </div>
      ) : step === 3 ? (
        <div className="entry-panel animate-panel" key="step-3">
          <div
            className="entry-options"
            role="group"
            aria-label="Choose your focus"
          >
            <Button
              variant="outline"
              aria-label="Read and write Fidäl"
              aria-pressed={plan.goal === "reading"}
              onClick={() => setPlan({ ...plan, goal: "reading" })}
            >
              <span className="option-card-content">
                <span className="option-card-title">Read and write Fidäl</span>
                <span className="option-card-hint" aria-hidden="true">
                  Meet shapes, trace over printed forms, and explore families.
                </span>
              </span>
              <span className="option-check" aria-hidden="true">
                <CheckIcon size={14} />
              </span>
            </Button>
            <Button
              variant="outline"
              aria-label="Connect pictures and words"
              aria-pressed={plan.goal === "words"}
              onClick={() => setPlan({ ...plan, goal: "words" })}
            >
              <span className="option-card-content">
                <span className="option-card-title">
                  Connect pictures and words
                </span>
                <span className="option-card-hint" aria-hidden="true">
                  Build everyday two-character words with illustrations and
                  gentle checkpoints.
                </span>
              </span>
              <span className="option-check" aria-hidden="true">
                <CheckIcon size={14} />
              </span>
            </Button>
          </div>

          <div className="plan-prefs-section">
            <div>
              <p className="chip-group-label">Who is learning? (look & feel)</p>
              <div
                className="chip-row"
                role="group"
                aria-label="Learner presentation"
              >
                {(
                  [
                    ["child", "Young learner (4–8 · Pictures first)"],
                    ["teen", "Teen (9–15)"],
                    ["adult", "Adult learner"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className="chip-btn"
                    aria-pressed={preferences.presentation === value}
                    onClick={() => preferences.set({ presentation: value })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="chip-group-label">Guide language</p>
              <div
                className="chip-row"
                role="group"
                aria-label="Guide language"
              >
                {(
                  [
                    ["en", "English"],
                    ["sv", "Svenska (Swedish)"],
                  ] as [GuideLanguage, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className="chip-btn"
                    aria-pressed={guideLanguage === value}
                    onClick={() => setGuideLanguage(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="chip-group-label">Daily rhythm (no timers)</p>
              <div className="chip-row" role="group" aria-label="Daily rhythm">
                {[3, 5, 10, 15, 30].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className="chip-btn"
                    aria-pressed={preferences.minutes === minutes}
                    onClick={() => preferences.set({ minutes })}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>

            <label>
              How shall we go?
              <select
                value={plan.pace}
                onChange={(e) =>
                  setPlan({
                    ...plan,
                    pace: e.target.value as "step" | "explore",
                  })
                }
              >
                <option value="step">One step at a time</option>
                <option value="explore">Let me explore</option>
              </select>
            </label>
          </div>

          <div className="actions">
            <Button variant="quiet" onClick={() => move(2)}>
              Back
            </Button>
            <Button onClick={() => move(4)}>See my plan</Button>
          </div>
        </div>
      ) : (
        <div className="entry-panel animate-panel" key="step-4">
          <p className="eyebrow">BASED ON YOUR CHOICES</p>
          <div className="today-meta">
            <Badge tone="sage">
              {BACKGROUND_LABELS[recommendation.background] ??
                "Your starting plan"}
            </Badge>
            <Badge tone="warm">
              <ClockIcon size={14} /> {preferences.minutes} min · no timer
            </Badge>
            {guideLanguage === "sv" && (
              <Badge tone="explore">Svenska guide noted</Badge>
            )}
          </div>
          <h2>{recommendation.title}</h2>
          <p>{recommendation.why}</p>
          <div className="plan-summary-grid">
            <div className="plan-summary-chip">
              <span>Listening</span>
              <strong>{FAMILIARITY_LABELS[plan.listening]}</strong>
            </div>
            <div className="plan-summary-chip">
              <span>Speaking</span>
              <strong>{FAMILIARITY_LABELS[plan.speaking]}</strong>
            </div>
            <div className="plan-summary-chip">
              <span>Fidäl reading</span>
              <strong>{FAMILIARITY_LABELS[plan.reading]}</strong>
            </div>
          </div>
          <p className="small">
            No level has been assigned. Listening, speaking and reading can be
            at different starting points.
          </p>
          <div className="actions">
            <Link
              className="button button-primary button-lg"
              href={recommendation.href}
            >
              {recommendation.href === "/first-lesson"
                ? "Try one small practice"
                : recommendation.title}
            </Link>
            <Link className="button button-outline" href="/first-lesson">
              Try the first form
            </Link>
            <Link className="button button-quiet" href="/learn">
              Explore both units
            </Link>
            <Button variant="ghost" onClick={() => move(0)}>
              Change my choices
            </Button>
          </div>
        </div>
      )}

      <p className="small">
        You can skip this and start. This is a starting plan, not a listening or
        speaking test.
      </p>
      <Link className="inline-link" href="/first-lesson">
        Start without questions <ArrowRightIcon size={15} />
      </Link>
      <PlanMemoryControls />
    </section>
  );
}
