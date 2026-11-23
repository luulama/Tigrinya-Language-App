"use client";
import { useState } from "react";

export type BearState =
  | "idle"
  | "listening"
  | "thinking"
  | "encouraging"
  | "celebrating"
  | "kind"
  | "demonstrating"
  | "resting"
  | "sleepy";

export function BearCompanion({
  state = "idle",
  caption = "One small step at a time.",
  large = false,
}: {
  state?: BearState;
  caption?: string;
  large?: boolean;
}) {
  const [quiet, setQuiet] = useState(false);
  return (
    <figure
      className={`neri-scene${large ? " neri-scene-large" : ""}`}
      data-neri-state={state}
      data-quiet={quiet}
    >
      <img
        className="neri-scene-art"
        src={`/preview/shared/mascot/assets/neri-${state}.svg`}
        alt={`Neri the bear, ${state === "kind" ? "offering gentle support" : state}.`}
        width={large ? 148 : 80}
        height={large ? 158 : 86}
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
        onLoad={(event) => {
          event.currentTarget.hidden = false;
        }}
      />
      <figcaption>
        <p>{caption}</p>
        <button
          type="button"
          aria-pressed={quiet}
          onClick={() => setQuiet(!quiet)}
        >
          {quiet ? "Show Neri" : "Quiet view"}
        </button>
      </figcaption>
    </figure>
  );
}
