"use client";
import type { Skill } from "@polyglot/shared-types";
import { request } from "./api";
const seen = new Map<string, number>();
export function sawModel(contentId: string, skill: Skill) {
  return (
    Date.now() - (seen.get(contentId + ":" + skill) ?? -Infinity) < 86400000
  );
}
export function recordExposure(
  contentId: string,
  revision: number,
  skill: Skill,
) {
  seen.set(contentId + ":" + skill, Date.now());
  void request(
    "/api/reviews/exposures",
    {
      method: "POST",
      body: JSON.stringify({
        eventId: crypto.randomUUID(),
        contentId,
        revision,
        skill,
      }),
    },
    true,
  ).catch(() => {});
}
