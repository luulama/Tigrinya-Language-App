import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const curriculum = JSON.parse(
  readFileSync(
    new URL("../../unit-02-first-words/path-curriculum.json", import.meta.url),
    "utf8",
  ),
) as {
  contentVersion: string;
  materialVersion: string;
  lessons: {
    id: string;
    title: string;
    available: boolean;
    blockedReason?: string;
    wordIds: string[];
  }[];
};
const base = "/preview/unit-02-first-words/path.html";
const unit1 = "/preview/unit-01-fidel-foundations/index.html";
async function jump(page: Page, id: string, step: string) {
  await page
    .getByRole("combobox", { name: "Inspect lesson", exact: true })
    .selectOption(id);
  await page
    .getByRole("combobox", { name: "Jump to step", exact: true })
    .selectOption(step);
  await page
    .getByRole("button", { name: "Open selected step", exact: true })
    .click();
}
test("every node is inspectable, including missing-content outlines, with a one-click return to real locks", async ({
  page,
}) => {
  await page.goto(base);
  await expect(
    page.locator('[data-path="start"][data-id="u3-01"]'),
  ).toBeDisabled();
  await page.getByText("Development tools", { exact: true }).click();
  await page
    .getByRole("button", { name: "Enable Developer Preview", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Developer Preview Mode", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".path-node")).toHaveCount(
    curriculum.lessons.length,
  );
  expect(
    await page.locator('.path-node [data-path="start"]:disabled').count(),
  ).toBe(0);
  for (const lesson of curriculum.lessons) {
    await jump(page, lesson.id, lesson.available ? "intro" : "outline");
    await expect(page.locator(".lesson-panel h1")).toHaveText(lesson.title);
    if (!lesson.available)
      await expect(page.locator(".lesson-panel")).toContainText(
        lesson.blockedReason!,
      );
  }
  await page
    .getByRole("button", { name: "Return to normal gating", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Developer Preview Mode", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.locator('[data-path="start"][data-id="u3-01"]'),
  ).toBeDisabled();
  expect(new URL(page.url()).searchParams.has("developerPreview")).toBe(false);
});
test("direct lesson and task links never write saved history or grant completion, even after a check", async ({
  page,
}) => {
  const history = {
    version: 1,
    save: true,
    contentVersion: curriculum.contentVersion,
    materialVersion: curriculum.materialVersion,
    lessons: { "u2-01": { passed: true, practised: true, at: 10 } },
    review: {
      [curriculum.lessons[0].wordIds[0]]: {
        step: 0,
        last: 10,
        due: 86400010,
        helped: false,
        delayed: false,
      },
    },
  };
  const value = JSON.stringify(history);
  await page.addInitScript(
    ({ value }) => {
      localStorage.setItem("tigrinya.word-path.v1", value);
      localStorage.setItem(
        "tigrinya.practice.v1",
        JSON.stringify({
          version: 1,
          save: true,
          mode: "child",
          minutes: 5,
          items: {},
          families: {},
        }),
      );
      localStorage.setItem("fixture-unrelated-storage", "keep");
    },
    { value },
  );
  await page.goto(
    base + "?developerPreview=1&inspectLesson=u3-01&inspectStep=check:1",
  );
  const saved = await page.evaluate(() => ({ ...localStorage }));
  await expect(page.locator(".lesson-task")).toHaveAttribute(
    "data-kind",
    "position",
  );
  const shownWord = (await page.locator(".prompt-word").textContent())!;
  await page.locator('[data-path="position"][data-id="1"]').click();
  await expect(page.locator("#taskFeedback")).toContainText(shownWord);
  await jump(page, "u2-02", "check:0");
  // Finish a real preview checkpoint using its actual word models, without writing course evidence.
  for (
    let i = 0;
    i < curriculum.lessons.find((l) => l.id === "u2-02")!.wordIds.length;
    i++
  ) {
    await page.locator('[data-path="help"]').click();
    const model = (await page
      .locator(".answer-model .focal-script")
      .textContent())!;
    const answer = page
      .locator('[data-path="answer-word"]')
      .filter({ hasText: model });
    await answer.click();
    await page.locator('[data-path="advance"]').click();
  }
  await expect(
    page.getByRole("heading", { name: "End screen preview", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(saved);
  await page
    .getByRole("button", { name: "Return to normal gating", exact: true })
    .click();
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(saved);
  await expect(
    page.locator('[data-path="start"][data-id="u3-01"]'),
  ).toBeDisabled();
  await expect(page.locator("#courseProgress")).toHaveAttribute("value", "1");
});
test("normal unfinished work survives an in-page preview toggle", async ({
  page,
}) => {
  await page.goto(base);
  await page.locator('[data-path="start"][data-id="u2-01"]').first().click();
  await page.locator('[data-path="begin"]').click();
  const before = await page.locator(".lesson-panel h1").textContent();
  await page.getByText("Development tools", { exact: true }).click();
  await page
    .getByRole("button", { name: "Enable Developer Preview", exact: true })
    .click();
  await jump(page, "u3-05", "check:1");
  await page
    .getByRole("button", { name: "Return to normal gating", exact: true })
    .click();
  await expect(page.locator(".lesson-panel h1")).toHaveText(before!);
  await expect(page.locator(".lesson-task")).toHaveAttribute(
    "data-kind",
    "look",
  );
});
test("all Fidäl families, forms, writing and checkpoints open without changing Unit 1 progress", async ({
  page,
}) => {
  await page.goto(
    unit1 + "?developerPreview=1&inspectLesson=ተ&inspectStep=check:6",
  );
  await expect(
    page.getByRole("heading", { name: "Spot the difference", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("combobox", { name: "Inspect lesson", exact: true })
      .locator("option"),
  ).toHaveCount(43);
  await jump(page, "በ", "write:4");
  await expect(page.locator("#form")).toHaveText("ቤ");
  await expect(page.locator("#writingWorkshop")).toBeVisible();
  await jump(page, "review", "review");
  await expect(page.locator("#soundChoices button").first()).toBeEnabled();
  await expect(page.locator("#journeyText")).toHaveText(
    "0 of 42 activities checked",
  );
  await jump(page, "በ", "done");
  await expect(
    page.getByRole("heading", {
      name: "Preview checkpoint ended",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to normal gating", exact: true })
    .click();
  await expect(page.locator("#journeyText")).toHaveText(
    "0 of 42 activities checked",
  );
  await expect(page.locator("#soundChoices button").first()).toBeDisabled();
});
test("preview navigation carries the temporary flag between both units and leaves content data alone", async ({
  page,
}, info) => {
  const api: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/")) api.push(r.url());
  });
  await page.goto(base + "?developerPreview=1");
  await page
    .getByRole("link", { name: "Unit 1 · all Fidäl families", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Developer Preview Mode", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Unit 2 onward · all lessons", exact: true })
    .click();
  await expect(page.locator(".path-node")).toHaveCount(
    curriculum.lessons.length,
  );
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(api).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("developer-preview.png"),
    fullPage: false,
  });
});
