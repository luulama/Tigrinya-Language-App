import { z } from "zod";
export const approvalScopes = [
  "Language",
  "Teaching",
  "Rights",
  "Accessibility",
  "Audio",
  "Culture",
  "Strokes",
] as const;
export const contentSchema = z.object({
  languageTag: z.string().min(2).max(35),
  kind: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  payload: z.record(z.string(), z.unknown()),
});
export interface Approval {
  revision: number;
  payloadHash: string;
  reviewerSubject: string;
  scope: string;
  approved: boolean;
}
export function canPublish(
  item: { revision: number; payloadHash: string; authorSubject: string },
  approvals: Approval[],
  required: readonly string[],
): boolean {
  return required.every((scope) =>
    approvals.some(
      (a) =>
        a.revision === item.revision &&
        a.payloadHash === item.payloadHash &&
        a.reviewerSubject !== item.authorSubject &&
        a.scope === scope &&
        a.approved,
    ),
  );
}
export function languageDirection(
  language: string,
  fallback: "ltr" | "rtl" = "ltr",
): "ltr" | "rtl" {
  const locale = new Intl.Locale(language) as Intl.Locale & {
    getTextInfo?: () => { direction: "ltr" | "rtl" };
    textInfo?: { direction: "ltr" | "rtl" };
  };
  return (
    locale.getTextInfo?.().direction ?? locale.textInfo?.direction ?? fallback
  );
}
