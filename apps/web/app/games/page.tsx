import Link from "next/link";
import { Card } from "@polyglot/ui";

export default function Games() {
  return (
    <>
      <p className="eyebrow">Game Garden · Twenty ways to practise</p>
      <h1>Look. Try. Play.</h1>
      <p>
        Choose your unit. Every game starts with a model and lets you try again.
      </p>
      <div className="grid">
        <Card>
          <div className="card-art" lang="ti" dir="ltr">
            በ ቡ ቢ
          </div>
          <h2>Unit 1 · Fidäl foundations</h2>
          <p>Ten games with shapes, families, patterns and drawing.</p>
          <Link
            className="button button-primary"
            href="/preview/games/index.html?unit=1"
          >
            Explore Fidäl games →
          </Link>
        </Card>
        <Card>
          <div className="card-art" lang="ti" dir="ltr">
            ቤት
          </div>
          <h2>Unit 2 · First words</h2>
          <p>
            Ten games with pictures, two-character words and real Fidäl text.
          </p>
          <Link
            className="button button-primary"
            href="/preview/games/index.html?unit=2"
          >
            Explore word games →
          </Link>
        </Card>
      </div>
      <p className="notice">
        Visual practice preview · Native review and recordings are pending.
        Drawing and self-check games do not assess handwriting or pronunciation.
        No account is needed; game progress stays in memory for this visit.
      </p>
    </>
  );
}
