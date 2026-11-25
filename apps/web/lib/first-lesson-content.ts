import "server-only";
import { createHash } from "node:crypto";
import source from "../../../shared/content-review/fidal-writing.json";
import manifest from "../../../content/first-lesson-media.json";

export interface FirstLessonContent {
  target: string;
  options: string[];
  revision: string;
  audioUrl: string | null;
  pendingReview: boolean;
}
export async function firstLessonContent(): Promise<FirstLessonContent> {
  const forms = source.families[0].forms.slice(0, 3);
  const revision = createHash("sha256")
    .update(JSON.stringify(forms))
    .digest("hex");
  const pendingReview = forms.some((form) => form.status !== "approved");
  // Build-time verification binds real bytes and provenance. A source edit
  // without a matching rebuild fails closed, without dynamic file tracing.
  const url = manifest.audioUrl as string | null;
  const audioUrl =
    !pendingReview &&
    manifest.sourceRevision === revision &&
    manifest.status === "ready" &&
    typeof url === "string" &&
    /^\/preview\/(?:shared|unit-01-fidel-foundations)\/assets\/[A-Za-z0-9_./-]+\.(mp3|wav|ogg|m4a)$/.test(
      url,
    ) &&
    !url.includes("..")
      ? url
      : null;
  return {
    target: forms[0].character,
    options: forms.map((f) => f.character),
    revision,
    audioUrl,
    pendingReview,
  };
}
