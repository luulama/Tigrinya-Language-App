"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Card } from "@polyglot/ui";
import { request } from "../lib/api";
import { visitSummary } from "../lib/learning-start";
import { useJourney } from "./learning-journey";
import { PlanMemoryControls } from "./starting-plan";
import { QueryState } from "./learning";
import { HeartHandshakeIcon, ShieldIcon } from "./icons";

interface FamilySummary {
  from: string;
  until: string;
  partial: boolean;
  checks: number;
  matchedWithHelp: number;
  matchedWithoutAnswerHelp: number;
  revisit: number;
  topics: { id: string; title: string }[];
  laterCorrect: number;
  laterAttempts: number;
  laterScope: "all_time";
  ability: "not_assessed";
  studyTime: null;
  nextAction: string;
}

function SharedSummary({ subject }: { subject: string }) {
  const query = useQuery({
    queryKey: ["parent-summary", subject],
    queryFn: ({ signal }) =>
      request<FamilySummary>(
        `/api/parents/learners/${encodeURIComponent(subject)}/summary`,
        { signal },
        true,
      ),
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: "always",
  });
  return (
    <>
      <QueryState pending={query.isFetching} error={query.error} />
      {query.error && (
        <Button variant="outline" onClick={() => query.refetch()}>
          Try account summary again
        </Button>
      )}
      {query.data && !query.error && !query.isFetching && (
        <section
          className="entry-panel animate-panel"
          aria-label="Last seven days summary"
        >
          <Badge tone="sage">Verified account summary</Badge>
          <h2>Last 7 days</h2>
          <p className="small">
            {new Date(query.data.from).toLocaleDateString()} –{" "}
            {new Date(query.data.until).toLocaleDateString()}
          </p>
          {query.data.partial && (
            <p className="entry-note">
              Showing the most recent 5,000 records. These counts are a sample,
              not complete weekly totals.
            </p>
          )}
          {query.data.checks === 0 ? (
            <p>
              No published checks recorded in this period. That does not mean no
              learning happened.
            </p>
          ) : (
            <>
              <div className="plan-summary-grid">
                <div className="plan-summary-chip">
                  <span>Practice checks</span>
                  <strong>{query.data.checks}</strong>
                </div>
                <div className="plan-summary-chip">
                  <span>With help</span>
                  <strong>{query.data.matchedWithHelp}</strong>
                </div>
                <div className="plan-summary-chip">
                  <span>Without answer help</span>
                  <strong>{query.data.matchedWithoutAnswerHelp}</strong>
                </div>
              </div>
              <p>
                {query.data.checks} practice checks.{" "}
                {query.data.matchedWithHelp} matched with help;{" "}
                {query.data.matchedWithoutAnswerHelp} matched without answer
                help.
              </p>
              {query.data.topics.length > 0 && (
                <>
                  <h3>What was practised</h3>
                  <ul>
                    {query.data.topics.map((t) => (
                      <li key={t.id}>{t.title}</li>
                    ))}
                  </ul>
                </>
              )}
              <p>
                {query.data.revisit
                  ? `${query.data.revisit} recent item/skill checks may benefit from another look.`
                  : "Offer a familiar item another day before assuming it is remembered."}
              </p>
            </>
          )}
          <div className="entry-panel entry-next-action">
            <h3>One useful next action</h3>
            <p>{query.data.nextAction}</p>
            <div className="actions">
              <Link className="button button-primary button-sm" href="/review">
                Open the reviewed practice queue
              </Link>
            </div>
          </div>
          <details>
            <summary>What these records can tell us</summary>
            <p>
              Matching without answer help is not proof of fluent reading. Since
              the account began, {query.data.laterCorrect} of{" "}
              {query.data.laterAttempts} later checks were correct without help.
              These later-check totals cover all visits, not just this week.
            </p>
            <p>
              Speaking, handwriting quality and overall language level have not
              been assessed here. This summary does not collect study time or
              share voice recordings.
            </p>
          </details>
        </section>
      )}
    </>
  );
}

function LinkedFamily() {
  const [selected, setSelected] = useState("");
  const query = useQuery({
    queryKey: ["verified-parent-learners"],
    queryFn: ({ signal }) =>
      request<string[]>("/api/parents/learners", { signal }, true),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
  return (
    <>
      <QueryState pending={query.isFetching} error={query.error} />
      {query.error && (
        <Card variant="tinted">
          <p>
            <Link href="/signin">Sign in with a verified parent account</Link>.
            This visit’s summary is still available.
          </p>
        </Card>
      )}
      {!query.error && !query.isFetching && query.data?.length === 0 && (
        <Card variant="tinted">
          <h2>No linked learners yet</h2>
          <p>
            A verified parent relationship is needed before account records can
            be shared. Choosing this view does not create one.
          </p>
        </Card>
      )}
      {query.data &&
        !query.error &&
        !query.isFetching &&
        query.data.length > 0 && (
          <label>
            Choose a linked learner
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Choose a learner</option>
              {query.data.map((subject, i) => (
                <option key={subject} value={subject}>
                  Learner {i + 1}
                </option>
              ))}
            </select>
          </label>
        )}
      {selected &&
        query.data?.includes(selected) &&
        !query.error &&
        !query.isFetching && (
          <SharedSummary key={selected} subject={selected} />
        )}
    </>
  );
}

export function ParentExperience() {
  const { records } = useJourney();
  const [account, setAccount] = useState(false);
  const summary = visitSummary(records),
    latest = records.at(-1);
  return (
    <section className="entry-shell parent-experience">
      <p className="eyebrow">
        <HeartHandshakeIcon size={14} /> FOR GROWN-UPS
      </p>
      <h1>Small steps you can see.</h1>
      <p>What was tried, what needed help, and one useful thing to do next.</p>
      <div className="actions" role="group" aria-label="Choose summary">
        <Button
          variant={!account ? "default" : "outline"}
          aria-pressed={!account}
          onClick={() => setAccount(false)}
        >
          This visit
        </Button>
        <Button
          variant={account ? "default" : "outline"}
          aria-pressed={account}
          onClick={() => setAccount(true)}
        >
          Linked account · last 7 days
        </Button>
      </div>
      {account ? (
        <LinkedFamily />
      ) : (
        <>
          <p className="small">
            This device’s current visit only. No child account is selected or
            inferred.
          </p>
          <div className="parent-cards">
            <Card variant="elevated">
              <Badge tone="sage">Observed practice</Badge>
              <h2>What was tried</h2>
              <p>{summary.what}</p>
              <p>{summary.progress}</p>
            </Card>
            <Card variant="elevated">
              <Badge tone="warm">Gentle follow-up</Badge>
              <h2>What to revisit</h2>
              <p>{summary.review}</p>
              {latest && (
                <p>
                  {latest.heard
                    ? "The reviewed sound model played."
                    : "Sound was not practised; approved audio is still needed."}
                </p>
              )}
            </Card>
          </div>
          <div className="entry-panel entry-next-action">
            <h2>One useful next action</h2>
            <p>
              {latest
                ? "Ask them to find the form again another day. Show the model whenever they want help."
                : "Sit together for one small shape activity. You can stop after that."}
            </p>
            <div className="actions">
              <Link className="button button-primary" href={summary.next}>
                {latest ? "Revisit the first form" : "Try the first practice"}
              </Link>
            </div>
          </div>
          <p className="entry-note">
            These are practice observations, not proof of lasting reading or
            pronunciation. The source material is still awaiting qualified
            native review.
          </p>
        </>
      )}
      <PlanMemoryControls />
      <details className="entry-details">
        <summary>
          <ShieldIcon size={17} /> Privacy and shared devices
        </summary>
        <p>
          This visit uses memory only and clears on reload. Account summaries
          require sign-in and a current verified parent relationship checked by
          the service. No voice, chat or drawing is uploaded by these screens.
          Do not use a shared sign-in to separate children; use their verified
          account links.
        </p>
      </details>
    </section>
  );
}
