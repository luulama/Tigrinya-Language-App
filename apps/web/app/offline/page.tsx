import Link from "next/link";
import { Card } from "@polyglot/ui";
import { BearCompanion } from "../../components/bear-companion";

export default function Page() {
  return (
    <section className="entry-shell">
      <p className="eyebrow">Offline mode</p>
      <h1>You can keep practising.</h1>
      <BearCompanion
        state="resting"
        caption="No connection right now. Your offline preview stays ready."
      />
      <Card variant="elevated">
        <p>
          The connection is unavailable. Previously opened preview activities
          may be available on this device.
        </p>
        <div className="actions">
          <Link className="button button-primary" href="/preview/index.html">
            Open practice preview
          </Link>
        </div>
      </Card>
    </section>
  );
}
