"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@polyglot/ui";
import { request } from "../lib/api";
import {
  DEFAULT_PLAN,
  startingRecommendation,
  validPlan,
  type Familiarity,
  type SavedStartingPlan,
} from "../lib/learning-start";
import { MeleCompanion, useJourney } from "./learning-journey";

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
          disabled={working}
          onClick={() => perform("save")}
        >
          Save plan to my account
        </Button>
        <Button
          variant="outline"
          disabled={working}
          onClick={() => perform("load")}
        >
          Load saved plan
        </Button>
        <Button
          variant="quiet"
          disabled={working}
          onClick={() => perform("forget")}
        >
          Forget saved plan
        </Button>
        <Button
          variant="quiet"
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
      <p role="status">{message}</p>
      <Link href="/signin">Sign in to an existing account</Link>
    </details>
  );
}

export function StartingPlanPage() {
  const { plan, setPlan, records } = useJourney();
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const fields = [
    {
      key: "listening",
      title: "When you hear Tigrinya…",
      choices: [
        "It is new to me",
        "I understand some",
        "I understand comfortably",
        "I’m not sure",
      ],
    },
    {
      key: "speaking",
      title: "When you speak Tigrinya…",
      choices: [
        "I haven’t started",
        "I use some words",
        "I speak comfortably",
        "I’m not sure",
      ],
    },
    {
      key: "reading",
      title: "When you see Fidäl…",
      choices: [
        "The forms are new",
        "I recognise some",
        "I read comfortably",
        "I’m not sure",
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
      <h1 ref={heading} tabIndex={-1}>
        {step < 3
          ? fields[step].title
          : step === 3
            ? "What would you like to practise?"
            : "A place to begin."}
      </h1>
      <MeleCompanion
        caption={
          step < 3
            ? "You can be familiar with the sounds and new to reading. Both are welcome."
            : "This is a starting suggestion. You can change it."
        }
      />
      {step < 3 ? (
        <div className="entry-panel">
          <div
            className="entry-options"
            role="group"
            aria-label={fields[step].title}
          >
            {(["new", "some", "comfortable", "unsure"] as Familiarity[]).map(
              (level, i) => (
                <Button
                  key={level}
                  variant="outline"
                  aria-pressed={plan[fields[step].key] === level}
                  onClick={() =>
                    setPlan({ ...plan, [fields[step].key]: level })
                  }
                >
                  {fields[step].choices[i]}
                </Button>
              ),
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
              variant="quiet"
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
        <div className="entry-panel">
          <div className="entry-options">
            <Button
              variant="outline"
              aria-pressed={plan.goal === "reading"}
              onClick={() => setPlan({ ...plan, goal: "reading" })}
            >
              Read and write Fidäl
            </Button>
            <Button
              variant="outline"
              aria-pressed={plan.goal === "words"}
              onClick={() => setPlan({ ...plan, goal: "words" })}
            >
              Connect pictures and words
            </Button>
          </div>
          <label>
            How shall we go?
            <select
              value={plan.pace}
              onChange={(e) =>
                setPlan({ ...plan, pace: e.target.value as "step" | "explore" })
              }
            >
              <option value="step">One step at a time</option>
              <option value="explore">Let me explore</option>
            </select>
          </label>
          <div className="actions">
            <Button variant="quiet" onClick={() => move(2)}>
              Back
            </Button>
            <Button onClick={() => move(4)}>See my plan</Button>
          </div>
        </div>
      ) : (
        <div className="entry-panel">
          <p className="eyebrow">BASED ON YOUR CHOICES</p>
          <h2>{recommendation.title}</h2>
          <p>{recommendation.why}</p>
          <p>
            No level has been assigned. Listening, speaking and reading can be
            at different starting points.
          </p>
          <div className="actions">
            <Link className="button button-primary" href={recommendation.href}>
              {recommendation.href === "/first-lesson"
                ? "Try one small practice"
                : recommendation.title}
            </Link>
            <Link href="/first-lesson">Try the first form</Link>
            <Link href="/learn">Explore both units</Link>
            <Button variant="quiet" onClick={() => move(0)}>
              Change my choices
            </Button>
          </div>
        </div>
      )}
      <p className="small">
        You can skip this and start. This is a starting plan, not a listening or
        speaking test.
      </p>
      <Link href="/first-lesson">Start without questions</Link>
      <PlanMemoryControls />
    </section>
  );
}
