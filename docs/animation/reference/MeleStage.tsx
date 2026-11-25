"use client";
import { useEffect, useRef, useState } from "react";
import { cueFor, playCue, type MeleState, type MotionSnapshot } from "./motion";

export function MeleStage({
  snapshot,
  posters,
  status,
}: {
  snapshot: MotionSnapshot;
  posters: Record<MeleState, string>;
  status: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = posters[snapshot.pose];
  useEffect(() => {
    const controller = new AbortController();
    if (host.current)
      void playCue(
        host.current,
        cueFor(snapshot.pose),
        snapshot,
        controller.signal,
      );
    return () => controller.abort();
  }, [
    snapshot.pose,
    snapshot.sequence,
    snapshot.sessionId,
    snapshot.taskRevision,
    snapshot.reduced,
    snapshot.quiet,
    snapshot.visible,
  ]);
  return (
    <section className="mele-stage" aria-label="Mele companion">
      <div
        ref={host}
        className="mele-art"
        hidden={snapshot.quiet}
        aria-hidden="true"
      >
        {failedSource === source ? (
          <span className="mele-poster-fallback">Mele</span>
        ) : (
          <img
            src={source}
            width="150"
            height="160"
            alt=""
            onError={() => setFailedSource(source)}
          />
        )}
      </div>
      <p role="status" aria-live="polite" aria-atomic="true">
        {status}
      </p>
    </section>
  );
}

/** Fail still before the preference has been read. A user can request less
 * motion, never override an OS reduce preference with more motion. */
export function useReducedMotion(still: boolean): boolean {
  const [systemReduce, setSystemReduce] = useState(true);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduce(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return still || systemReduce;
}
