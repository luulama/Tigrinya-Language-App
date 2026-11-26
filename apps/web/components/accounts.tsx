"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Card } from "@polyglot/ui";
import type { Profile } from "@polyglot/shared-types";
import { request, signIn, signOut } from "../lib/api";
import { QueryState } from "./learning";
import { BearCompanion } from "./bear-companion";
import { MELE_EMPTY_STATES } from "./mele-system";
import { ShieldIcon } from "./icons";

export function SignIn({ signup = false }: { signup?: boolean }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  return (
    <section className="entry-shell">
      <p className="eyebrow">
        <ShieldIcon size={14} /> Optional connected account
      </p>
      <h1>{signup ? "Create your learning account." : "Welcome back."}</h1>
      <Card variant="elevated">
        <p>
          Account access is handled by Microsoft Entra External ID. Children can
          use the visual practice preview without an account.
        </p>
        <div className="actions">
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await signIn();
              } catch (e) {
                setMessage((e as Error).message);
                setBusy(false);
              }
            }}
          >
            {busy
              ? "Opening sign-in…"
              : signup
                ? "Continue to sign up"
                : "Continue to sign in"}
          </Button>
          <Link className="button button-outline" href="/preview/index.html">
            Use the practice preview
          </Link>
        </div>
        <p className="small" role="status">
          {message}
        </p>
      </Card>
    </section>
  );
}

export function ProfilePage({ onboarding = false }: { onboarding?: boolean }) {
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: () => request<Profile | null>("/api/users/me", {}, true),
    retry: false,
  });
  const [form, setForm] = useState<Profile | null>(null),
    [message, setMessage] = useState("");
  const profile = form ??
    query.data ?? {
      presentation: "child",
      languageTag: "ti",
      goal: "literacy",
      isChild: true,
      analyticsConsent: false,
    };
  async function save() {
    try {
      await request(
        "/api/users/me",
        { method: "PUT", body: JSON.stringify(profile) },
        true,
      );
      setMessage("Your preferences are saved.");
      query.refetch();
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <section className="entry-shell">
      <p className="eyebrow">Preferences</p>
      <h1>{onboarding ? "Choose your starting point." : "Your profile."}</h1>
      <QueryState pending={query.isPending} error={query.error} />
      {!query.error && (
        <Card variant="elevated">
          <label>
            Presentation
            <select
              value={profile.presentation}
              onChange={(e) =>
                setForm({
                  ...profile,
                  presentation: e.target.value as Profile["presentation"],
                })
              }
            >
              <option value="child">Pictures first</option>
              <option value="teen">Teen</option>
              <option value="adult">Adult</option>
            </select>
          </label>
          <label>
            Your goal
            <select
              value={profile.goal}
              onChange={(e) => setForm({ ...profile, goal: e.target.value })}
            >
              <option value="literacy">Read and write Fidäl</option>
              <option value="general">Everyday language</option>
              <option value="heritage">Heritage language</option>
              <option value="professional">Professional language</option>
            </select>
          </label>
          <p className="small">
            Goals guide recommendations. They do not establish a proficiency
            level.
          </p>
          <div className="actions">
            <Button onClick={save}>Save preferences</Button>
          </div>
          <p className="small" role="status">
            {message}
          </p>
        </Card>
      )}
      <div className="actions">
        <Link className="button button-quiet" href="/learn">
          Continue learning
        </Link>
        <Button
          variant="outline"
          onClick={() => signOut().catch((e) => setMessage(e.message))}
        >
          Sign out
        </Button>
      </div>
    </section>
  );
}

interface Progress {
  skills: {
    skill: string;
    practised: number;
    independentCorrect: number;
    independentAttempts: number;
    retention: { observed: number | null; correct: number; attempts: number };
  }[];
  activities: number;
  proficiency: string;
}

export function ProgressPage() {
  const query = useQuery({
    queryKey: ["progress"],
    queryFn: () => request<Progress>("/api/progress", {}, true),
    retry: false,
  });
  return (
    <>
      <p className="eyebrow">Honest skill evidence</p>
      <h1>Your practice.</h1>
      <BearCompanion
        state="encouraging"
        caption="Practice grows one visit at a time."
      />
      <p>
        See the evidence for each skill. Practice counts do not establish
        language proficiency.
      </p>
      <QueryState pending={query.isPending} error={query.error} />
      <div className="grid">
        {query.data?.skills.map((skill) => {
          const pct = skill.independentAttempts
            ? Math.round(
                (skill.independentCorrect / skill.independentAttempts) * 100,
              )
            : 0;
          return (
            <Card key={skill.skill} variant="elevated">
              <Badge tone="sage">{skill.practised} items practised</Badge>
              <h2>{skill.skill}</h2>
              <p>
                {skill.independentCorrect} of {skill.independentAttempts}{" "}
                independent checks correct
              </p>
              <div
                className="meter-track"
                role="progressbar"
                aria-label={`${skill.skill} independent checks`}
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="meter-fill" style={{ width: `${pct}%` }} />
              </div>
              <p className="small">
                {skill.retention.observed === null
                  ? "More delayed checks are needed before showing retention."
                  : `${Math.round(skill.retention.observed)}% on observed delayed checks (${skill.retention.attempts} attempts)`}
              </p>
            </Card>
          );
        })}
      </div>
      {query.data?.skills.length === 0 && (
        <Card variant="tinted">
          <h2>Your first step is ready.</h2>
          <p>
            Published activity checks will appear here after you complete them.
          </p>
          <div className="actions">
            <Link className="button button-primary" href="/learn">
              Choose a lesson
            </Link>
          </div>
        </Card>
      )}
    </>
  );
}

export function AchievementPage() {
  const query = useQuery({
    queryKey: ["achievements"],
    queryFn: () =>
      request<{ id: string; objective: string; earnedAt: string }[]>(
        "/api/achievements",
        {},
        true,
      ),
    retry: false,
  });
  return (
    <section className="entry-shell">
      <p className="eyebrow">Demonstrated objectives</p>
      <h1>What you can do.</h1>
      <p>Achievements recognise demonstrated objectives, with evidence.</p>
      <QueryState pending={query.isPending} error={query.error} />
      {query.data?.length === 0 && (
        <Card variant="tinted">
          <BearCompanion
            state={MELE_EMPTY_STATES.achievements.state}
            caption={MELE_EMPTY_STATES.achievements.caption}
          />
          <p>No assessed achievements yet. Your practice still counts.</p>
          <div className="actions">
            <Link className="button button-primary" href="/learn">
              Continue learning
            </Link>
          </div>
        </Card>
      )}
      <div className="grid">
        {query.data?.map((item) => (
          <Card key={item.id} variant="elevated">
            <Badge tone="review">
              {new Date(item.earnedAt).toLocaleDateString()}
            </Badge>
            <h2>{item.objective}</h2>
          </Card>
        ))}
      </div>
    </section>
  );
}

function LinkedPractice({
  subject,
  kind,
}: {
  subject: string;
  kind: "parents" | "teachers";
}) {
  const query = useQuery({
    queryKey: [kind, "progress", subject],
    queryFn: () =>
      request<Progress>(
        `/api/${kind}/learners/${encodeURIComponent(subject)}/progress`,
        {},
        true,
      ),
    retry: false,
  });
  return (
    <>
      <QueryState pending={query.isPending} error={query.error} />
      {query.data && (
        <div>
          {query.data.skills.length === 0 ? (
            <p>No assessed practice yet.</p>
          ) : (
            query.data.skills.map((skill) => (
              <p key={skill.skill}>
                <strong>{skill.skill}:</strong> {skill.practised} items
                practised, {skill.independentCorrect} of{" "}
                {skill.independentAttempts} independent checks correct.
              </p>
            ))
          )}
          <p className="small">
            These are practice observations, not a proficiency level.
          </p>
        </div>
      )}
    </>
  );
}

export function Supervision({ kind }: { kind: "parents" | "teachers" }) {
  const [selected, setSelected] = useState<string | null>(null);
  const query = useQuery({
    queryKey: [kind],
    queryFn: () => request<string[]>(`/api/${kind}/learners`, {}, true),
    retry: false,
  });
  return (
    <section className="entry-shell">
      <p className="eyebrow">Verified supervision</p>
      <h1>{kind === "parents" ? "Learning together." : "Your learners."}</h1>
      <p>
        Only verified, active learner relationships appear here. A role or email
        address alone does not grant access.
      </p>
      <QueryState pending={query.isPending} error={query.error} />
      {query.data?.length === 0 && (
        <Card variant="tinted">
          <h2>No linked learners</h2>
          <p>
            An administrator must verify the relationship before learner
            information can be shared.
          </p>
        </Card>
      )}
      {query.data?.map((subject) => (
        <Card key={subject} variant="elevated">
          <h2>Linked learner</h2>
          <p className="small">Account reference: {subject}</p>
          <div className="actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected(selected === subject ? null : subject)}
            >
              View practice
            </Button>
          </div>
          {selected === subject && (
            <LinkedPractice subject={subject} kind={kind} />
          )}
        </Card>
      ))}
    </section>
  );
}
