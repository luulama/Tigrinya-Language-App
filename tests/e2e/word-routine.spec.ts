import { test, expect, type Page } from "@playwright/test";
const url = "/preview/unit-02-first-words/path.html",
  key = "tigrinya.word-path.v1";
const click = (p: Page, action: string, id?: string) =>
  p
    .locator(
      `[data-path="${action}"]${id === undefined ? "" : `[data-id=${JSON.stringify(id)}]`}`,
    )
    .first()
    .click();
async function content(p: Page) {
  return p.evaluate(() => (window as any).WordPathContent);
}
async function current(p: Page, d: any) {
  const task = p.locator(".lesson-task"),
    script = task.locator('.prompt-word [lang="ti"]').first();
  const text = (await script.count()) ? await script.textContent() : null;
  const art = text
    ? null
    : await task.locator(":scope > .word-picture use").getAttribute("href");
  return {
    kind: await task.getAttribute("data-kind"),
    word: d.words.find((w: any) =>
      text ? w.word === text : art === `#art-${w.art}`,
    ),
  };
}
async function solve(p: Page, d: any) {
  const { kind, word } = await current(p, d);
  if (kind === "build")
    for (const ch of word.letters) await click(p, "place", ch);
  if (kind === "read") await click(p, "answer-picture", word.id);
  if (kind === "choose") await click(p, "answer-word", word.id);
  if (kind === "type") {
    await p.locator("#pathWordEntry").fill(word.word);
    await click(p, "compare");
  }
  await click(p, "advance");
}
test("the actual first lesson teaches, builds, reads and recalls with correction and unchanged check gates", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  await page.goto(url);
  const d = await content(page);
  await click(page, "start", "u2-01");
  await expect(page.locator(".routine-route li")).toHaveText([
    "Look",
    "Build",
    "Read",
    "Recall",
  ]);
  await page.getByText("Words and Fidäl reference", { exact: true }).click();
  await expect(page.locator(".routine-reference").first()).toContainText(
    "qualified native Tigrinya review",
  );
  await expect(page.locator(".routine-reference").first()).toContainText(
    "recorded order",
  );
  await click(page, "begin");
  const kinds: string[] = [];
  for (let i = 0; i < 12; i++) {
    const { kind, word } = await current(page, d);
    kinds.push(kind!);
    if (kind === "look") {
      await expect(page.locator(".answer-model")).toBeVisible();
      await click(page, "advance");
      continue;
    }
    if (kind === "build" && i === 1) {
      const wrong = await page
        .locator('[data-path="place"]')
        .evaluateAll(
          (buttons, first) =>
            buttons
              .map((b) => (b as HTMLElement).dataset.id!)
              .find((id) => id !== first),
          word.letters[0],
        );
      const positions = await page
        .locator('[data-path="place"]')
        .evaluateAll((b) => b.map((x) => (x as HTMLElement).dataset.id));
      await click(page, "place", wrong!);
      await expect(page.locator("#taskFeedback")).toContainText(
        "Follow the model",
      );
      expect(
        await page
          .locator('[data-path="place"]')
          .evaluateAll((b) => b.map((x) => (x as HTMLElement).dataset.id)),
      ).toEqual(positions);
    }
    if (kind === "read") {
      await expect(page.locator(".answer-model")).toHaveCount(0);
      if (i === 6) {
        const wrong = d.words.find(
          (w: any) => w.id !== word.id && d.lessons[0].wordIds.includes(w.id),
        );
        await click(page, "answer-picture", wrong.id);
        await expect(page.locator("#taskFeedback")).toContainText(word.word);
      }
    }
    if (kind === "type") {
      await expect(page.locator(".answer-model")).toHaveCount(0);
      await expect(page.locator("#pathWordEntry")).toHaveAttribute(
        "dir",
        "ltr",
      );
      if (i === 9) {
        await page.locator("#pathWordEntry").fill(word.letters[0]);
        await click(page, "leave");
        await expect(page.locator("#courseProgress")).toHaveAttribute(
          "value",
          "0",
        );
        await expect(
          page.locator('.path-node [data-path="start"][data-id="u2-02"]'),
        ).toBeDisabled();
        await click(page, "resume");
        await expect(page.locator("#pathWordEntry")).toHaveValue(
          word.letters[0],
        );
        await page.locator("#pathWordEntry").fill("XX");
        await click(page, "compare");
        await expect(page.locator(".answer-model")).toContainText(word.word);
        await expect(page.locator("#taskFeedback")).toContainText(
          "Keep both forms in order",
        );
      }
      if (i === 10) {
        for (const ch of word.letters) await click(page, "insert", ch);
        await click(page, "compare");
        await click(page, "advance");
        continue;
      }
    }
    await solve(page, d);
  }
  expect(kinds).toEqual([
    "look",
    "build",
    "look",
    "build",
    "look",
    "build",
    "read",
    "read",
    "read",
    "type",
    "type",
    "type",
  ]);
  await expect(
    page.getByRole("heading", { name: "Ready to try?", exact: true }),
  ).toBeVisible();
  await click(page, "check");
  for (let i = 0; i < 3; i++) {
    await expect(page.locator(".lesson-task")).toHaveAttribute(
      "data-kind",
      "choose",
    );
    await solve(page, d);
  }
  await click(page, "map");
  await expect(page.locator("#courseProgress")).toHaveAttribute("value", "1");
  await expect(
    page.locator('.path-node [data-path="start"][data-id="u2-02"]'),
  ).toBeEnabled();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.screenshot({
    path: info.outputPath("routine-path.png"),
    fullPage: false,
  });
});
test("keyboard entry, IME guards, form-key fallback and same-visit evidence remain honest", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url);
  const d = await content(page);
  await click(page, "save");
  await click(page, "start", "u2-01");
  await click(page, "begin");
  for (let i = 0; i < 9; i++) await solve(page, d);
  const { word } = await current(page, d);
  await click(page, "compare");
  await expect(page.locator("#taskFeedback")).toHaveText(
    "Enter the two forms, or choose Show the model.",
  );
  await page.locator("#pathWordEntry").dispatchEvent("compositionstart");
  await page.locator("#pathWordEntry").fill(word.word);
  await click(page, "compare");
  await expect(page.locator("#taskFeedback")).toContainText(
    "Finish entering the form",
  );
  await page.locator("#pathWordEntry").dispatchEvent("compositionend");
  await page.locator("#pathWordEntry").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#taskFeedback")).toContainText(
    "Text matched; handwriting and pronunciation are not assessed",
  );
  await page.screenshot({
    path: info.outputPath("routine-recall.png"),
    fullPage: false,
  });
  await click(page, "leave");
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(saved.lessons["u2-01"]).toBeUndefined();
  const entries = Object.values(saved.srs.items).filter(
    (x: any) => x.skill === "entry",
  ) as any[];
  expect(entries.some((x) => x.correct > 0)).toBe(true);
  expect(entries.every((x) => x.sessions.length === 0)).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("developer inspection reaches the new recall step without writing existing progress", async ({
  page,
}, info) => {
  await page.addInitScript(() =>
    localStorage.setItem("fixture-unrelated", "keep"),
  );
  await page.goto(
    url + "?developerPreview=1&inspectLesson=u2-01&inspectStep=practice:9",
  );
  const saved = await page.evaluate(() => ({ ...localStorage }));
  await expect(page.locator(".lesson-task")).toHaveAttribute(
    "data-kind",
    "type",
  );
  await expect(page.locator(".answer-model")).toHaveCount(0);
  const d = await content(page),
    { word } = await current(page, d);
  await click(page, "help");
  await expect(page.locator(".answer-model")).toContainText(word.word);
  for (const ch of word.letters) {
    const button = page.locator(
      `[data-path="insert"][data-id=${JSON.stringify(ch)}]`,
    );
    if (info.project.name === "phone") await button.tap();
    else {
      await button.focus();
      await page.keyboard.press("Enter");
    }
  }
  await click(page, "compare");
  await expect(page.locator("#taskFeedback")).toContainText("Text matched");
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(saved);
  await page
    .getByRole("button", { name: "Return to normal gating", exact: true })
    .click();
  await expect(page.locator("#courseProgress")).toHaveAttribute("value", "0");
  await expect(
    page.locator('.path-node [data-path="start"][data-id="u2-02"]'),
  ).toBeDisabled();
});
test("missing routine assets recover clearly and future language modalities stay blocked", async ({
  page,
}) => {
  await page.route("**/word-routine.js", (r) => r.abort());
  await page.goto(url);
  await click(page, "start", "u2-01");
  await click(page, "begin");
  await expect(page.getByRole("alert")).toContainText(
    "word-practice tools did not load",
  );
  await page.unroute("**/word-routine.js");
  await click(page, "reload");
  await expect(page.locator("#courseProgress")).toHaveAttribute("value", "0");
  await page
    .getByText("See the planned steps and what they need", { exact: true })
    .click();
  await expect(page.locator(".beyond-card")).toContainText(
    "Needs reviewed, licensed Tigrinya",
  );
  await expect(page.locator(".beyond-card")).toContainText(
    "No sentence has been invented",
  );
  await expect(page.locator("audio")).toHaveCount(0);
});
