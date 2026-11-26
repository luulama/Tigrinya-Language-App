"use client";
import { useState } from "react";
import { MELE_MOODS } from "./mele-system";

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
  name = "Mele",
  quiet: controlledQuiet,
  onQuietChange,
}: {
  state?: BearState;
  caption?: string;
  large?: boolean;
  name?: string;
  quiet?: boolean;
  onQuietChange?: (quiet: boolean) => void;
}) {
  const [localQuiet, setQuiet] = useState(false);
  const quiet = controlledQuiet ?? localQuiet;
  const mood = MELE_MOODS[state];
  return (
    <figure
      className={`neri-scene${large ? " neri-scene-large" : ""}`}
      data-neri-state={state}
      data-mele-tone={mood.tone}
      data-quiet={quiet}
    >
      <img
        className="neri-scene-art"
        src={`/preview/shared/mascot/assets/neri-${state}.svg`}
        alt={`${name} the bear, ${state === "kind" ? "offering gentle support" : state}.`}
        width={large ? 136 : 76}
        height={large ? 146 : 82}
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
        onLoad={(event) => {
          event.currentTarget.hidden = false;
        }}
      />
      <figcaption>
        <span className="mele-badge">{mood.label}</span>
        <p>{caption}</p>
        <button
          type="button"
          aria-pressed={quiet}
          onClick={() =>
            onQuietChange ? onQuietChange(!quiet) : setQuiet(!quiet)
          }
        >
          {quiet ? `Show ${name}` : "Quiet view"}
        </button>
      </figcaption>
    </figure>
  );
}
