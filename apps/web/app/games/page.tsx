import Link from "next/link";
import { Badge, Card } from "@polyglot/ui";
import { BearCompanion } from "../../components/bear-companion";

export default function Games() {
  return (
    <>
      <p className="eyebrow">Game Garden · Twenty ways to practise</p>
      <h1>Look. Try. Play.</h1>
      <p>
        Choose your unit. Every game starts with a clear model and lets you try
        again—with no countdowns, no lost lives, and no pressure.
      </p>
      <BearCompanion
        state="encouraging"
        caption="Play gently to notice patterns in shapes and words."
      />
      <div className="grid">
        <Card variant="elevated">
          <div className="card-art" lang="ti" dir="ltr">
            በ ቡ ቢ
          </div>
          <Badge tone="sage">10 calm games</Badge>
          <h2>Unit 1 · Fidäl foundations</h2>
          <p>Ten games with shapes, families, patterns and drawing.</p>
          <div className="actions">
            <Link
              className="button button-primary"
              href="/preview/games/index.html?unit=1"
            >
              Explore Fidäl games →
            </Link>
          </div>
        </Card>
        <Card variant="elevated">
          <div className="card-art card-art-warm" lang="ti" dir="ltr">
            ቤት
          </div>
          <Badge tone="warm">10 calm games</Badge>
          <h2>Unit 2 · First words</h2>
          <p>
            Ten games with pictures, two-character words and real Fidäl text.
          </p>
          <div className="actions">
            <Link
              className="button button-primary"
              href="/preview/games/index.html?unit=2"
            >
              Explore word games →
            </Link>
          </div>
        </Card>
      </div>
      <aside className="notice">
        <strong>Visual practice preview.</strong>
        <p>
          Native review and recordings are pending. Drawing and self-check games
          do not assess handwriting or pronunciation. No account is needed; game
          progress stays in memory for this visit.
        </p>
      </aside>
    </>
  );
}
