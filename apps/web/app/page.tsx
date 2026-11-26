import Link from "next/link";
import { Badge, Card } from "@polyglot/ui";
import { BearCompanion } from "../components/bear-companion";
import {
  ArrowRightIcon,
  CompassIcon,
  EarIcon,
  HeartHandshakeIcon,
  PenIcon,
} from "../components/icons";

const HERO_FORMS = [
  { glyph: "በ", order: "1st" },
  { glyph: "ቡ", order: "2nd" },
  { glyph: "ቢ", order: "3rd" },
  { glyph: "ባ", order: "4th" },
];

export default function Landing() {
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Tigrinya · your pace</p>
          <h1>
            Small steps.
            <br />
            Real understanding.
          </h1>
          <p className="hero-lead">
            Explore Fidäl, connect pictures and words, and practise writing in a
            calm space shaped around your rhythm—whether you are four, forty, or
            reconnecting with the language you grew up hearing.
          </p>
          <BearCompanion large caption="I’m Mele. Let’s take a small step." />
          <div className="actions">
            <Link
              className="button button-primary button-lg"
              href="/first-lesson"
            >
              Try the first small lesson →
            </Link>
            <Link
              className="button button-outline button-lg"
              href="/onboarding"
            >
              Find my starting point
            </Link>
          </div>
        </div>
        <div
          className="hero-art"
          aria-label="Tigrinya Fidäl forms"
          lang="ti"
          dir="ltr"
        >
          {HERO_FORMS.map(({ glyph }) => (
            <span className="fidal-tile" key={glyph}>
              {glyph}
            </span>
          ))}
        </div>
      </section>

      <section aria-label="How learning works">
        <p className="eyebrow">Calm learning rhythm</p>
        <h2>Three gentle steps in every activity</h2>
        <div className="grid">
          <Card variant="elevated">
            <span className="step-badge" aria-hidden="true">
              1
            </span>
            <h2>Look and understand</h2>
            <p>
              Meet a form or picture before trying it yourself. Every lesson
              opens with a clear model—never a surprise quiz.
            </p>
          </Card>
          <Card variant="elevated">
            <span className="step-badge step-badge-warm" aria-hidden="true">
              2
            </span>
            <h2>Try with support</h2>
            <p>
              See a model, practise drawing or typing, and try again at your
              pace. Asking for help never costs a life or erases progress.
            </p>
          </Card>
          <Card variant="elevated">
            <span className="step-badge step-badge-explore" aria-hidden="true">
              3
            </span>
            <h2>Return and remember</h2>
            <p>
              Review familiar material another day and see honestly what feels
              steady and what benefits from another quiet look.
            </p>
          </Card>
        </div>
      </section>

      <section className="audience-band" aria-label="Designed for every learner">
        <div className="audience-band-header">
          <p className="eyebrow">Built for your path</p>
          <h2>One thoughtful craft, adapted to who is learning</h2>
          <p>
            Change presentation, pace, and quiet view anytime without locking
            away content or inventing a placement score.
          </p>
        </div>
        <div className="grid">
          <Card variant="default">
            <Badge tone="sage">
              <PenIcon size={14} /> Young learners
            </Badge>
            <h3>Pictures first & unhurried</h3>
            <p>
              Large touch targets, warm illustrations, gentle freehand drawing,
              and a patient companion who never rushes or scolds.
            </p>
          </Card>
          <Card variant="default">
            <Badge tone="warm">
              <CompassIcon size={14} /> Adult beginners
            </Badge>
            <h3>Clear, respectful & structured</h3>
            <p>
              Understand the seven-order Fidäl system cleanly, switch to adult
              presentation or quiet view, and practise in 3-to-30-minute visits.
            </p>
          </Card>
          <Card variant="default">
            <Badge tone="explore">
              <EarIcon size={14} /> Heritage speakers & listeners
            </Badge>
            <h3>Bridge sound to script</h3>
            <p>
              Familiar with spoken Tigrinya at home, yet new to Fidäl? Keep
              listening, speaking, and reading separate from day one.
            </p>
          </Card>
        </div>
        <div className="actions">
          <Link className="button button-primary" href="/learn">
            Open the learning path <ArrowRightIcon size={18} />
          </Link>
          <Link className="button button-quiet" href="/parents">
            <HeartHandshakeIcon size={18} /> For parents & grown-ups
          </Link>
        </div>
      </section>

      <aside className="notice">
        <strong>Learning preview · Native review pending.</strong>
        <p>
          The existing Fidäl and picture-word preview is available now. Approved
          native recordings and new course content still need qualified Tigrinya
          review.
        </p>
      </aside>
    </>
  );
}
