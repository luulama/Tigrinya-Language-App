import { it, expect } from "vitest";
import { canPublish, contentSchema, languageDirection } from "./index";
it("rejects empty drafts and self-approval or stale version approval", () => {
  expect(
    contentSchema.safeParse({
      languageTag: "ti",
      kind: "Word",
      title: "",
      payload: {},
    }).success,
  ).toBe(false);
  const item = { revision: 2, payloadHash: "hash", authorSubject: "writer" };
  expect(
    canPublish(
      item,
      [
        {
          revision: 2,
          payloadHash: "hash",
          reviewerSubject: "writer",
          scope: "Language",
          approved: true,
        },
      ],
      ["Language"],
    ),
  ).toBe(false);
  expect(
    canPublish(
      item,
      [
        {
          revision: 1,
          payloadHash: "hash",
          reviewerSubject: "reviewer",
          scope: "Language",
          approved: true,
        },
      ],
      ["Language"],
    ),
  ).toBe(false);
  expect(
    canPublish(
      item,
      [
        {
          revision: 2,
          payloadHash: "hash",
          reviewerSubject: "reviewer",
          scope: "Language",
          approved: true,
        },
      ],
      ["Language"],
    ),
  ).toBe(true);
});
it("keeps Tigrinya left-to-right", () =>
  expect(languageDirection("ti")).toBe("ltr"));
