"use client";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Button, Card } from "@polyglot/ui";
import { languageDirection } from "@polyglot/content-engine";
import type {
  ContentItem,
  ContentPage,
  Question,
  ReviewResult,
} from "@polyglot/shared-types";
import { recordExposure, sawModel } from "../lib/exposures";
import { ApiError, apiBase, request } from "../lib/api";
import { BearCompanion } from "./bear-companion";
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
  enabled = true,
}: {
  resource: string;
  title: string;
  description: string;
  enabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: [resource, search],
    enabled,
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxLength={100}
        />
      </label>
      <QueryState pending={query.isPending} error={query.error} />
      {query.data?.items.length === 0 && (
        <Card>
          <h2>Reviewed content comes first</h2>
          <p>
            No published {resource} are available yet. You can use the existing
            visual practice preview while Tigrinya material is reviewed.
          </p>
          <Link className="button button-primary" href="/preview/index.html">
            Open practice preview
          </Link>
        </Card>
      )}
      <div className="grid">
        {query.data?.items.map((item) => (
          <Card key={item.id}>
            <span className="pill">{item.kind}</span>
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
  const [publishedOpen, setPublishedOpen] = useState(false);
  return (
    <>
      <p className="eyebrow">One clear next step</p>
      <h1>Start with Fidäl.</h1>
      <div className="actions">
        <Link className="button button-primary" href="/first-lesson">
          Try one form first
        </Link>
        <Link href="/onboarding">Choose my starting plan</Link>
      </div>
      <p>Look at a form, practise writing, and find its match.</p>
      <BearCompanion
        caption="Look first. Try when you’re ready."
        state="encouraging"
      />
      <div className="grid">
        <Card>
          <div className="card-art" lang="ti" dir="ltr">
            በ ቡ ቢ
          </div>
          <h2>Fidäl families</h2>
          <p>Explore 293 forms, one group at a time.</p>
          <Link
            className="button button-primary"
            href="/preview/unit-01-fidel-foundations/index.html"
          >
            Begin Fidäl preview →
          </Link>
          <p>
            <Link href="/preview/games/index.html?unit=1">
              10 Fidäl games →
            </Link>
          </p>
        </Card>
        <Card>
          <div className="card-art" lang="ti" dir="ltr">
            ቤት
          </div>
          <h2>Unit 2 onward · Your word path</h2>
          <p>
            Short picture-word lessons, clear checkpoints, then reading and
            writing.
          </p>
          <Link
            className="button button-outline"
            href="/preview/unit-02-first-words/path.html"
          >
            Follow the word path →
          </Link>
          <p>
            <Link href="/preview/games/index.html?unit=2">10 word games →</Link>
          </p>
        </Card>
      </div>
      <p className="notice">
        These existing activities are visual prototypes. Native language review
        and recordings are pending.
      </p>
      <details>
        <summary>Development tools</summary>
        <p>
          Inspect all path nodes and lesson steps without recording learner
          progress.
        </p>
        <Link
          className="button button-outline"
          href="/preview/unit-02-first-words/path.html?developerPreview=1"
        >
          Enable Developer Preview
        </Link>
      </details>
      <details onToggle={(event) => setPublishedOpen(event.currentTarget.open)}>
        <summary>Published lessons</summary>
        <Library
          resource="lessons"
          title="Your lessons"
          description="Only published, reviewed content appears here."
          enabled={publishedOpen}
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
    <Card>
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
          <p>Matched.{result.helped ? " You practised with help." : ""}</p>
        ) : result ? (
          <>
            <p>Compare with the model:</p>
            <p className="native" lang="ti" dir="ltr">
              {result.model}
            </p>
            <p>{result.explanation}</p>
          </>
        ) : null}
        {error && (
          <p>
            {error} {errorStatus === 401 && <Link href="/signin">Sign in</Link>}
          </p>
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
    <>
      <ContentBody item={item} />
      <Button onClick={onComplete}>Continue</Button>
    </>
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
            <Card key={index}>
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
      <>
        <h1>{item.title}</h1>
        <QuestionContent item={item} />
        <Link href="/learn">Back to learning</Link>
      </>
    );
  const activities = item.payload.activities as
    { kind: string; targetId: string; instruction: string }[] | undefined;
  if (item.kind === "Lesson" && activities) {
    if (step >= activities.length)
      return (
        <>
          <h1>Activity complete.</h1>
          <p>You practised this lesson. Checks record support separately.</p>
          <Link className="button button-primary" href="/review">
            Review familiar material
          </Link>
        </>
      );
    const activity = activities[step];
    return (
      <>
        <p className="eyebrow">
          Step {step + 1} of {activities.length}
        </p>
        <h1>{item.title}</h1>
        <p>{activity.instruction}</p>
        <Target
          key={step}
          id={activity.targetId}
          onComplete={() => setStep(step + 1)}
        />
      </>
    );
  }
  const ids = (item.payload.unitIds ??
    item.payload.moduleIds ??
    item.payload.lessonIds ??
    item.payload.questionIds ??
    item.payload.familyIds ??
    item.payload.letterIds) as string[] | undefined;
  return (
    <>
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
      <Link href="/learn">Back to learning</Link>
    </>
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
    <>
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
          <Card>
            <h2>{index ? "Review complete" : "Nothing is due"}</h2>
            <p>Choose a lesson or stop here.</p>
            <Link className="button button-primary" href="/learn">
              Choose a lesson
            </Link>
          </Card>
        )
      )}
    </>
  );
}
