import tokens from "../motion-tokens.json";

export const MELE_STATES = [
  "idle",
  "walking",
  "talking",
  "listening",
  "thinking",
  "teaching",
  "celebrating",
  "encouraging",
  "waiting",
  "sleeping",
] as const;
export type MeleState = (typeof MELE_STATES)[number];
export type MotionPolicy = {
  reduced: boolean;
  quiet: boolean;
  visible: boolean;
};
export type MotionContext = {
  sessionId: string;
  taskRevision: string;
  nativeModelReady: boolean;
};
export type MotionSnapshot = MotionContext &
  MotionPolicy & {
    pose: MeleState;
    sequence: number;
    playbackId: string | null;
    recording: boolean;
  };
export type IntentType =
  | "navigate"
  | "model-playing"
  | "model-stopped"
  | "recording-started"
  | "recording-stopped"
  | "work-pending"
  | "model-shown"
  | "activity-confirmed"
  | "retry-offered"
  | "request-pending"
  | "bedtime"
  | "idle";
export type MotionEvent =
  | {
      type: IntentType;
      sequence: number;
      sessionId: string;
      taskRevision: string;
      playbackId?: string;
    }
  | ({ type: "policy" } & Partial<MotionPolicy>);

/** Native-model capability must come from the existing validated manifest gate.
 * A boolean in this view contract is not content approval or authorization. */
export function createSnapshot(context: MotionContext): MotionSnapshot {
  if (!context.sessionId.trim() || !context.taskRevision.trim())
    throw new Error(
      "Motion requires an active session and exact task revision",
    );
  return {
    ...context,
    pose: "idle",
    sequence: 0,
    playbackId: null,
    recording: false,
    reduced: true,
    quiet: false,
    visible: true,
  };
}

export function reduceMotion(
  state: MotionSnapshot,
  event: MotionEvent,
): MotionSnapshot {
  if (event.type === "policy") {
    const next = { ...state };
    for (const key of ["reduced", "quiet", "visible"] as const)
      if (typeof event[key] === "boolean") next[key] = event[key];
    if (!next.visible) {
      next.pose = "idle";
      next.playbackId = null;
      next.recording = false;
    }
    return next;
  }
  if (
    event.sessionId !== state.sessionId ||
    event.taskRevision !== state.taskRevision ||
    !Number.isSafeInteger(event.sequence) ||
    event.sequence <= state.sequence ||
    !state.visible
  )
    return state;
  if (state.recording && event.type !== "recording-stopped") return state;
  let pose: MeleState;
  switch (event.type) {
    case "model-playing":
      if (!state.nativeModelReady || !event.playbackId?.trim())
        return {
          ...state,
          pose: "teaching",
          sequence: event.sequence,
          playbackId: null,
        };
      return {
        ...state,
        pose: "talking",
        sequence: event.sequence,
        playbackId: event.playbackId,
      };
    case "model-stopped":
      if (!event.playbackId || event.playbackId !== state.playbackId)
        return state;
      pose = "teaching";
      break;
    case "navigate":
      pose = "walking";
      break;
    case "recording-started":
      return {
        ...state,
        pose: "listening",
        recording: true,
        playbackId: null,
        sequence: event.sequence,
      };
    case "recording-stopped":
      if (!state.recording) return state;
      return {
        ...state,
        pose: "idle",
        recording: false,
        playbackId: null,
        sequence: event.sequence,
      };
    case "work-pending":
      pose = "thinking";
      break;
    case "model-shown":
      pose = "teaching";
      break;
    case "activity-confirmed":
      pose = "celebrating";
      break;
    case "retry-offered":
      pose = "encouraging";
      break;
    case "request-pending":
      pose = "waiting";
      break;
    case "bedtime":
      pose = "sleeping";
      break;
    case "idle":
      pose = "idle";
      break;
    default:
      return state;
  }
  return { ...state, pose, sequence: event.sequence, playbackId: null };
}

export type Cue = { frames: Keyframe[]; durationMs: number; easing: string };
export function cueFor(pose: MeleState): Cue {
  const cue: Cue = { frames: [], durationMs: 0, easing: tokens.easing.settle };
  if (pose === "walking")
    return {
      ...cue,
      frames: [
        { transform: `translateX(-${tokens.limits.translationPx}px)` },
        { transform: "translateX(0)" },
      ],
      durationMs: tokens.durationMs.enter,
    };
  if (pose === "celebrating")
    return {
      ...cue,
      frames: [
        { transform: "translateY(0)" },
        { transform: "translateY(-4px)" },
        { transform: "translateY(0)" },
      ],
      durationMs: tokens.durationMs.celebrate,
    };
  if (pose === "encouraging")
    return {
      ...cue,
      frames: [{ opacity: 0.85 }, { opacity: 1 }],
      durationMs: tokens.durationMs.feedback,
    };
  return cue; // No fabricated speech/mouth cycle, idle bob, loading loop or mic nod.
}

/** No domain mutation, timer queue, persistent listener, telemetry or fill state. */
export async function playCue(
  host: HTMLElement,
  cue: Cue,
  policy: MotionPolicy,
  signal: AbortSignal,
): Promise<boolean> {
  if (
    signal.aborted ||
    policy.reduced ||
    policy.quiet ||
    !policy.visible ||
    !cue.frames.length ||
    typeof host.animate !== "function"
  )
    return false;
  let animation: Animation | undefined;
  const cancel = () => animation?.cancel();
  try {
    animation = host.animate(cue.frames, {
      duration: cue.durationMs,
      easing: cue.easing,
      iterations: 1,
      fill: "none",
    });
    signal.addEventListener("abort", cancel, { once: true });
    if (signal.aborted) cancel();
    await animation.finished;
    return !signal.aborted;
  } catch {
    return false; // The semantic view has already rendered; a renderer is optional.
  } finally {
    signal.removeEventListener("abort", cancel);
    animation?.cancel();
  }
}

export type MediaBinding = {
  targetRevision: string;
  sha256: string;
  variety: string;
  durationMs: number;
};
export type ReviewedAlignment = MediaBinding & {
  reviewed: boolean;
  segments: { startMs: number; endMs: number; graphemeIds: string[] }[];
};

/** The real adapter verifies approval evidence/hashes first. This helper validates
 * clock matching, not reviewer identity. Geometry fixtures are not teaching data. */
export function segmentAt(
  binding: MediaBinding,
  alignment: ReviewedAlignment,
  mediaTimeMs: number,
): string[] {
  if (
    !alignment.reviewed ||
    !Number.isFinite(mediaTimeMs) ||
    mediaTimeMs < 0 ||
    !Number.isFinite(binding.durationMs) ||
    binding.durationMs <= 0 ||
    !/^[0-9a-f]{64}$/.test(binding.sha256)
  )
    return [];
  if (
    alignment.targetRevision !== binding.targetRevision ||
    alignment.sha256 !== binding.sha256 ||
    alignment.variety !== binding.variety ||
    alignment.durationMs !== binding.durationMs
  )
    return [];
  let end = 0;
  for (const segment of alignment.segments) {
    if (
      !Number.isFinite(segment.startMs) ||
      !Number.isFinite(segment.endMs) ||
      segment.startMs < end ||
      segment.endMs <= segment.startMs ||
      segment.endMs > binding.durationMs ||
      !segment.graphemeIds.length ||
      segment.graphemeIds.some((id) => !id.trim())
    )
      return [];
    end = segment.endMs;
  }
  return (
    alignment.segments
      .find(
        (segment) =>
          mediaTimeMs >= segment.startMs && mediaTimeMs < segment.endMs,
      )
      ?.graphemeIds.slice() ?? []
  );
}
