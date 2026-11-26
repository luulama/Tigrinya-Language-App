"use client";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card } from "@polyglot/ui";
import { languageDirection } from "@polyglot/content-engine";
import type {
  ContentItem,
  ContentPage,
  Question,
  ReviewResult,
} from "@polyglot/shared-types";
import { recordExposure, sawModel } from "../lib/exposures";
import { ApiError, apiBase, request } from "../lib/api";
import { LEARNING_PATH_UNITS } from "../lib/learning-path-data";
import { startingRecommendation } from "../lib/learning-start";
import { usePreferences } from "../lib/preferences";
import { BearCompanion } from "./bear-companion";
import { useJourney } from "./learning-journey";
import { MELE_EMPTY_STATES } from "./mele-system";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  ClockIcon,
  LockIcon,
  RefreshIcon,
  SparklesIcon,
} from "./icons";

export function QueryState({
  pending,
  error,
}: {
  pending: boolean;
  error: Error | null;
}) {
  return pending ? (
    <p role="status" className="status">
      Opening your learning…
    </p>
  ) : error ? (
    <div role="status" className="notice">
      <p>{error.message}</p>
      <Link href="/preview/index.html">Use the practice preview</Link>
    </div>
  ) : null;
}

export function Library({
  resource,
  title,
  description,
}: {
  resource: string;
  title: string;
  description: string;
}) {
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: [resource, search],
    queryFn: () =>
      request<ContentPage>(
        `/api/${resource}?language=ti&limit=24&q=${encodeURIComponent(search)}`,
      ),
  });
  return (
    <>
      <p className="eyebrow">Your learning library</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <label>
        Find content
        <input
          type="search"
          placeholder="Search published titles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxLength={100}
        />
      </label>
      <QueryState pending={query.isPending} error={query.error} />
      {query.data?.items.length === 0 && (
        <Card variant="tinted">
          <BearCompanion
            state={MELE_EMPTY_STATES.library.state}
            caption={MELE_EMPTY_STATES.library.caption}
          />
          <h2>Reviewed content comes first</h2>
          <p>
            No published {resource} are available yet. You can use the existing
            visual practice preview while Tigrinya material is reviewed.
          </p>
          <div className="actions">
            <Link className="button button-primary" href="/preview/index.html">
              Open practice preview
            </Link>
          </div>
        </Card>
      )}
      <div className="grid">
        {query.data?.items.map((item) => (
          <Card key={item.id} variant="interactive">
            <Badge tone="sage">{item.kind}</Badge>
            <h2>{item.title}</h2>
            <Link className="button button-outline" href={`/learn/${item.id}`}>
              Open →
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}

export function LearnHome() {
  const { plan, records } = useJourney();
  const preferences = usePreferences();
  const completedFirst = records.length > 0;
  const recommendation = startingRecommendation(plan, records.at(-1));
  const activeMilestoneId = completedFirst
    ? plan.goal === "words"
      ? "u2-familiar"
      : "u1-families"
    : "u1-first";

  return (
    <>
      <section className="learn-hero-grid" aria-label="Recommended next step">
        <div className="today-card">
          <p className="eyebrow">One clear next step</p>
          <h1>Start with Fidäl.</h1>
          <p>
            Look at a form, practise writing, and find its match. Every step
            begins with a clear model—never a guess.
          </p>
          <div className="today-meta">
            <Badge tone="sage">
              <ClockIcon size={14} /> {preferences.minutes} min pace · no timer
            </Badge>
            {completedFirst && (
              <Badge tone="review">
                <CheckIcon size={14} /> First form practised this visit
              </Badge>
            )}
          </div>
          <div className="actions">
            <Link
              className="button button-primary button-lg"
              href="/first-lesson"
            >
              Try one form first
            </Link>
            <Link className="button button-outline" href="/onboarding">
              Choose my starting plan
            </Link>
          </div>
        </div>

        <aside aria-label="Mele companion and quick review">
          <BearCompanion
            caption="Look first. Try when you’re ready."
            state="encouraging"
          />
          <Card variant="tinted">
            <p className="eyebrow">Suggested for you</p>
            <h3>{recommendation.title}</h3>
            <p className="small">{recommendation.why}</p>
            <div className="actions">
              <Link
                className="button button-quiet button-sm"
                href={recommendation.href}
              >
                Open suggestion <ArrowRightIcon size={15} />
              </Link>
            </div>
          </Card>
        </aside>
      </section>

      <div className="path-layout">
        <section className="path-units" aria-label="Tigrinya learning path">
          {LEARNING_PATH_UNITS.map((unit) => (
            <div
              key={unit.id}
              className="path-unit"
              data-tone={unit.tone}
            >
              <div className="path-unit-header">
                <div>
                  <p className="eyebrow">{unit.badge}</p>
                  <h2>{unit.title}</h2>
                  <p>{unit.goal}</p>
                </div>
              </div>
              <div className="path-track">
                {unit.milestones.map((milestone) => {
                  const isCompleted =
                    milestone.id === "u1-first" && completedFirst;
                  const isActive = milestone.id === activeMilestoneId;
                  const state = !milestone.available
                    ? "locked"
                    : isCompleted
                      ? "completed"
                      : isActive
                        ? "active"
                        : "ready";

                  const body = (
                    <>
                      <span
                        className="path-node-orb"
                        lang={milestone.available ? "ti" : undefined}
                        dir="ltr"
                        aria-hidden="true"
                      >
                        {!milestone.available ? (
                          <LockIcon size={20} />
                        ) : isCompleted ? (
                          <CheckIcon size={22} />
                        ) : (
                          milestone.orb
                        )}
                      </span>
                      <div className="path-step-body">
                        <p className="path-step-kicker">
                          {isCompleted
                            ? "Practised this visit"
                            : isActive
                              ? `Up next · ${milestone.kicker}`
                              : milestone.kicker}
                        </p>
                        <h3 className="path-step-title">{milestone.title}</h3>
                        <p className="path-step-desc">
                          {milestone.description}
                        </p>
                        {milestone.glyphs && (
                          <div
                            className="path-step-glyphs"
                            lang="ti"
                            dir="ltr"
                            aria-hidden="true"
                          >
                            {milestone.glyphs.map((g) => (
                              <span className="path-glyph-chip" key={g}>
                                {g}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="path-step-cta">
                        {milestone.ctaLabel}
                      </span>
                    </>
                  );

                  return milestone.available && milestone.href ? (
                    <Link
                      key={milestone.id}
                      className="path-step"
                      data-state={state}
                      href={milestone.href}
                    >
                      {body}
                    </Link>
                  ) : (
                    <div
                      key={milestone.id}
                      className="path-step"
                      data-state="locked"
                      aria-disabled="true"
                    >
                      {body}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <aside className="path-rail" aria-label="Review and extra practice">
          <Card variant="elevated">
            <Badge tone="review">
              <RefreshIcon size={14} /> Gentle review
            </Badge>
            <h3>Revisit familiar shapes</h3>
            <p className="small">
              Returning to familiar material on another day builds steady
              recognition without pressure.
            </p>
            <div className="actions">
              <Link className="button button-outline button-sm" href="/review">
                Open review queue
              </Link>
            </div>
          </Card>

          <Card variant="default">
            <Badge tone="explore">
              <SparklesIcon size={14} /> Explore
            </Badge>
            <h3>Games & quiet stories</h3>
            <p className="small">
              Twenty calm visual games and twenty illustrated stories, kept
              separate from course progress.
            </p>
            <div className="actions">
              <Link className="button button-quiet button-sm" href="/games">
                Game Garden
              </Link>
              <Link className="button button-outline button-sm" href="/stories">
                <BookOpenIcon size={15} /> Stories
              </Link>
            </div>
          </Card>

          <p className="notice">
            <strong>Visual practice preview.</strong> These existing activities
            are visual prototypes. Native language review and recordings are
            pending.
          </p>
        </aside>
      </div>

      <details>
        <summary>Development tools</summary>
        <p>
          Inspect all path nodes and lesson steps without recording learner
          progress.
        </p>
        <Link
          className="button button-outline button-sm"
          href="/preview/unit-02-first-words/path.html?developerPreview=1"
        >
          Enable Developer Preview
        </Link>
      </details>

      <details>
        <summary>Published lessons</summary>
        <Library
          resource="lessons"
          title="Your lessons"
          description="Only published, reviewed content appears here."
        />
      </details>
    </>
  );
}

export function QuestionActivity({
  question,
  onComplete,
}: {
  question: Question;
  onComplete?: () => void;
}) {
  const queryClient = useQueryClient();
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [helped, setHelped] = useState(false);
  const event = useRef<{
    eventId: string;
    questionId: string;
    revision: number;
    answer: string;
    helped: boolean;
    confidence: string;
  } | null>(null);

  async function submit() {
    if (!answer || busy) return;
    setBusy(true);
    setError("");
    setErrorStatus(null);
    event.current ??= {
      eventId: crypto.randomUUID(),
      questionId: question.id,
      revision: question.revision,
      answer,
      helped: helped || sawModel(question.targetId, question.skill),
      confidence: "Good",
    };
    try {
      const value = await request<ReviewResult>(
        "/api/reviews",
        { method: "POST", body: JSON.stringify(event.current) },
        true,
      );
      setResult(value);
      if (!value.correct) setHelped(true);
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    } catch (e) {
      setError((e as Error).message);
      setErrorStatus(e instanceof ApiError ? e.status : null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card variant="elevated" className="animate-panel">
      <p className="eyebrow">{question.skill} practice</p>
      <h2>{question.prompt}</h2>
      <BearCompanion
        state={
          busy
            ? "thinking"
            : result
              ? result.correct
                ? "celebrating"
                : "kind"
              : error
                ? "kind"
                : "resting"
        }
        caption={
          busy
            ? "Take a moment."
            : result
              ? result.correct
                ? "One small step completed."
                : "Have another look. You can try again."
              : error
                ? "Your place is safe. Try again when you’re ready."
                : "Take your time."
        }
      />
      {question.audioAssetId && (
        <audio
          controls
          preload="none"
          aria-label="Listen to the question"
          src={`${apiBase}/api/media/${question.audioAssetId}`}
        />
      )}
      <div className="choices" role="group" aria-label="Choose an answer">
        {question.options.map((option) => (
          <Button
            key={option}
            variant={answer === option ? "default" : "outline"}
            aria-pressed={answer === option}
            disabled={busy || result !== null || event.current !== null}
            onClick={() => setAnswer(option)}
          >
            <span lang="ti" dir="ltr">
              {option}
            </span>
          </Button>
        ))}
      </div>
      <div className="actions">
        {!result ? (
          errorStatus === 409 || errorStatus === 404 ? (
            <Button onClick={() => window.location.reload()}>
              Reload question
            </Button>
          ) : (
            <Button disabled={!answer || busy} onClick={submit}>
              {busy ? "Checking…" : "Check"}
            </Button>
          )
        ) : result.correct ? (
          <Button
            onClick={
              onComplete ??
              (() => {
                setResult(null);
                setAnswer("");
                event.current = null;
              })
            }
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={() => {
              setResult(null);
              setAnswer("");
              event.current = null;
            }}
          >
            Try with the model
          </Button>
        )}
      </div>
      <div className="message" role="status" aria-live="polite">
        {result?.correct ? (
          <div className="feedback-banner feedback-banner-success">
            <p>
              Matched.{result.helped ? " You practised with help." : ""}
            </p>
          </div>
        ) : result ? (
          <div className="feedback-banner feedback-banner-kind">
            <p>Compare with the model:</p>
            <p className="native" lang="ti" dir="ltr">
              {result.model}
            </p>
            <p>{result.explanation}</p>
          </div>
        ) : null}
        {error && (
          <div className="feedback-banner feedback-banner-error">
            <p>
              {error}{" "}
              {errorStatus === 401 && <Link href="/signin">Sign in</Link>}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function QuestionContent({
  item,
  onComplete,
}: {
  item: ContentItem;
  onComplete?: () => void;
}) {
  const p = item.payload;
  return (
    <QuestionActivity
      key={`${item.id}:${item.revision}`}
      question={{
        id: item.id,
        revision: item.revision,
        targetId: String(p.targetId),
        prompt: String(p.prompt),
        options: p.options as string[],
        skill: p.skill as Question["skill"],
        audioAssetId:
          typeof p.audioAssetId === "string" ? p.audioAssetId : null,
      }}
      onComplete={onComplete}
    />
  );
}

function Target({ id, onComplete }: { id: string; onComplete: () => void }) {
  const query = useQuery({
    queryKey: ["content", id],
    queryFn: () => request<ContentItem>("/api/content/" + id),
  });
  if (query.isPending || query.error)
    return <QueryState pending={query.isPending} error={query.error} />;
  const item = query.data;
  if (item.kind === "Question") {
    return <QuestionContent item={item} onComplete={onComplete} />;
  }
  return (
    <Card variant="elevated" className="animate-panel">
      <ContentBody item={item} />
      <div className="actions">
        <Button onClick={onComplete}>Continue</Button>
      </div>
    </Card>
  );
}

function ContentBody({ item }: { item: ContentItem }) {
  const p = item.payload;
  const direction = languageDirection(item.languageTag);
  useEffect(() => {
    if (typeof p.script === "string")
      recordExposure(
        item.id,
        item.revision,
        item.kind === "Letter" ? "Visual" : "Reading",
      );
  }, [item.id, item.revision, item.kind, p.script]);
  return (
    <article>
      <h2>{item.title}</h2>
      {typeof p.script === "string" && (
        <p className="native" lang={item.languageTag} dir={direction}>
          {p.script}
        </p>
      )}
      {typeof p.meaning === "string" && <p>{p.meaning}</p>}
      {typeof p.text === "string" && (
        <p lang={item.languageTag} dir={direction}>
          {p.text}
        </p>
      )}
      {typeof p.explanation === "string" && <p>{p.explanation}</p>}
      {Array.isArray(p.segments) &&
        p.segments.map((segment, index) => {
          const part = segment as {
            text: string;
            audioAssetId?: string;
            imageAssetId?: string;
          };
          return (
            <Card key={index} variant="tinted">
              <p lang={item.languageTag} dir={direction}>
                {part.text}
              </p>
              {part.imageAssetId && (
                <img
                  src={`${apiBase}/api/media/${part.imageAssetId}`}
                  alt="Story illustration"
                />
              )}
              {part.audioAssetId && (
                <audio
                  controls
                  preload="none"
                  src={`${apiBase}/api/media/${part.audioAssetId}`}
                >
                  Your browser does not support audio playback.
                </audio>
              )}
            </Card>
          );
        })}
      {typeof p.audioAssetId === "string" && (
        <audio
          controls
          preload="none"
          onPlay={() => recordExposure(item.id, item.revision, "Listening")}
          src={`${apiBase}/api/media/${p.audioAssetId}`}
        />
      )}
      {typeof p.source === "string" && (
        <p className="small">Source: {p.source}</p>
      )}
    </article>
  );
}

export function ContentReader({ id }: { id: string }) {
  const query = useQuery({
    queryKey: ["content", id],
    queryFn: () => request<ContentItem>("/api/content/" + id),
  });
  const [step, setStep] = useState(0);
  if (query.isPending || query.error)
    return <QueryState pending={query.isPending} error={query.error} />;
  const item = query.data;
  if (item.kind === "Question")
    return (
      <section className="entry-shell">
        <h1>{item.title}</h1>
        <QuestionContent item={item} />
        <div className="actions">
          <Link className="button button-quiet" href="/learn">
            Back to learning
          </Link>
        </div>
      </section>
    );
  const activities = item.payload.activities as
    | { kind: string; targetId: string; instruction: string }[]
    | undefined;
  if (item.kind === "Lesson" && activities) {
    if (step >= activities.length)
      return (
        <section className="entry-shell">
          <Card variant="elevated" className="animate-panel">
            <BearCompanion
              state="celebrating"
              caption="You finished this lesson step by step. Rest or revisit whenever you like."
            />
            <h1>Activity complete.</h1>
            <p>You practised this lesson. Checks record support separately.</p>
            <div className="actions">
              <Link className="button button-primary" href="/review">
                Review familiar material
              </Link>
              <Link className="button button-outline" href="/learn">
                Back to learning path
              </Link>
            </div>
          </Card>
        </section>
      );
    const activity = activities[step];
    const progressPct = Math.round(((step + 1) / activities.length) * 100);
    return (
      <section className="entry-shell">
        <p className="eyebrow">
          Step {step + 1} of {activities.length}
        </p>
        <div
          className="meter-track"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={activities.length}
        >
          <div className="meter-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <h1>{item.title}</h1>
        <p>{activity.instruction}</p>
        <Target
          key={step}
          id={activity.targetId}
          onComplete={() => setStep(step + 1)}
        />
      </section>
    );
  }
  const ids = (item.payload.unitIds ??
    item.payload.moduleIds ??
    item.payload.lessonIds ??
    item.payload.questionIds ??
    item.payload.familyIds ??
    item.payload.letterIds) as string[] | undefined;
  return (
    <section className="entry-shell">
      <h1>{item.title}</h1>
      <ContentBody item={item} />
      {ids && (
        <div className="actions">
          {ids.map((child, index) => (
            <Link
              className="button button-outline"
              key={child}
              href={`/learn/${child}`}
            >
              Open part {index + 1}
            </Link>
          ))}
        </div>
      )}
      {item.kind === "Dialogue" &&
        Array.isArray(item.payload.turns) &&
        item.payload.turns.map((turn, index) => (
          <Target
            key={index}
            id={(turn as { sentenceId: string }).sentenceId}
            onComplete={() => {}}
          />
        ))}
      <div className="actions">
        <Link className="button button-quiet" href="/learn">
          Back to learning
        </Link>
      </div>
    </section>
  );
}

export function ReviewPage() {
  const query = useQuery({
    queryKey: ["reviews"],
    queryFn: () => request<Question[]>("/api/reviews", {}, true),
    retry: false,
  });
  const [index, setIndex] = useState(0);
  const question = query.data?.[index];
  return (
    <section className="entry-shell">
      <p className="eyebrow">Remember at your pace</p>
      <h1>A little review.</h1>
      <QueryState pending={query.isPending} error={query.error} />
      {question ? (
        <QuestionActivity
          key={question.id}
          question={question}
          onComplete={() => setIndex(index + 1)}
        />
      ) : (
        query.data && (
          <Card variant="elevated">
            <BearCompanion
              state={index ? "celebrating" : MELE_EMPTY_STATES.review.state}
              caption={
                index
                  ? "Nice quiet review. You can rest here or explore a new step."
                  : MELE_EMPTY_STATES.review.caption
              }
            />
            <h2>{index ? "Review complete" : "Nothing is due"}</h2>
            <p>Choose a lesson or stop here.</p>
            <div className="actions">
              <Link className="button button-primary" href="/learn">
                Choose a lesson
              </Link>
              <Link className="button button-outline" href="/first-lesson">
                Revisit the first form
              </Link>
            </div>
          </Card>
        )
      )}
    </section>
  );
}
