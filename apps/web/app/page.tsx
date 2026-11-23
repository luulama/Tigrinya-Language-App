import Link from "next/link";
import { Card } from "@polyglot/ui";
import { BearCompanion } from "../components/bear-companion";
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
          <p>
            Explore Fidäl, connect pictures and words, and practise writing.
          </p>
          <BearCompanion large caption="I’m Neri. Let’s take a small step." />
          <div className="actions">
            <Link className="button button-primary" href="/learn">
              Begin learning →
            </Link>
            <Link
              className="button button-outline"
              href="/preview/unit-01-fidel-foundations/index.html"
            >
              Open Fidäl preview
            </Link>
          </div>
        </div>
        <div
          className="hero-art"
          aria-label="Tigrinya Fidäl forms"
          lang="ti"
          dir="ltr"
        >
          {["በ", "ቡ", "ቢ", "ባ"].map((form) => (
            <span className="fidal-tile" key={form}>
              {form}
            </span>
          ))}
        </div>
      </section>
      <div className="grid">
        <Card>
          <h2>Look and understand</h2>
          <p>Meet a form or picture before trying it yourself.</p>
        </Card>
        <Card>
          <h2>Try with support</h2>
          <p>See a model, practise, and try again at your pace.</p>
        </Card>
        <Card>
          <h2>Return and remember</h2>
          <p>Review familiar material and see what needs more practice.</p>
        </Card>
      </div>
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
