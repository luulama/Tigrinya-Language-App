import { test, expect, type Page } from "@playwright/test";
const url = "/preview/unit-02-first-words/path.html",
  key = "tigrinya.word-path.v1";
const click = (p: Page, action: string, id?: string) =>
  p
    .locator(
      `button[data-path="${action}"]${id === undefined ? "" : `[data-id=${JSON.stringify(id)}]`}`,
    )
    .first()
    .click();
async function data(p: Page): Promise<any> {
  return p.evaluate(() => (window as any).WordPathContent);
}
async function current(p: Page, d: any) {
  const t = p.locator(".lesson-task"),
    kind = await t.getAttribute("data-kind"),
    native = t.locator('.prompt-word [lang="ti"]').first();
  const script = (await native.count()) ? await native.textContent() : null;
  const href = script
    ? null
    : await t.locator(":scope > .word-picture use").getAttribute("href");
  return {
    kind,
    word: d.words.find((w: any) =>
      script ? w.word === script : href === `#art-${w.art}`,
    ),
    mixed: (await p.locator(".lesson-panel>.eyebrow").textContent())!.includes(
      "Remember this?",
    ),
    corrective: (await p
      .locator(".lesson-panel>.eyebrow")
      .textContent())!.includes("supported revisit"),
  };
}
async function solve(
  p: Page,
  d: any,
  onTask?: (item: any) => Promise<void | boolean>,
) {
  for (let turn = 0; turn < 90; turn++) {
    if (await p.locator('[data-path="map"]').count()) return;
    if (await p.locator('[data-path="begin"]').count()) {
      await click(p, "begin");
      continue;
    }
    if (await p.locator('[data-path="check"]').count()) {
      await click(p, "check");
      continue;
    }
    const item = await current(p, d);
    if (["choose", "read"].includes(item.kind!)) {
      const action = item.kind === "read" ? "answer-picture" : "answer-word";
      await expect(
        p.locator(`[data-path="${action}"][data-id="${item.word.id}"]`),
      ).toHaveCount(1);
      const ids = await p
        .locator(`[data-path="${action}"]`)
        .evaluateAll((nodes) =>
          nodes.map((n) => (n as HTMLElement).dataset.id),
        );
      expect(new Set(ids).size).toBe(ids.length);
    }
    if (onTask && (await onTask(item))) continue;
    if (await p.locator('[data-path="advance"]').count()) {
      await click(p, "advance");
      continue;
    }
    if (item.kind === "choose") await click(p, "answer-word", item.word.id);
    if (item.kind === "read") await click(p, "answer-picture", item.word.id);
    if (item.kind === "build")
      for (const ch of item.word.letters) await click(p, "place", ch);
    if (item.kind === "type") {
      await p.locator("#pathWordEntry").fill(item.word.word);
      await click(p, "compare");
    }
    if (["position", "locate"].includes(item.kind!)) {
      const target = p.locator('.find-form [lang="ti"]');
      const char = (await target.count()) ? await target.textContent() : null;
      const n = char
        ? item.word.letters.indexOf(char)
        : (await p.getByRole("heading", { level: 1 }).textContent())!.includes(
              "first",
            )
          ? 0
          : 1;
      await click(p, "position", String(n));
    }
    await click(p, "advance");
  }
  throw Error("Mixed lesson did not finish");
}
async function seed(p: Page, next: string) {
  await p.goto(url);
  await p.evaluate(
    ({ next, key }) => {
      const w = window as any,
        h = w.WordPath.fresh(),
        d = w.WordPathContent,
        old = Date.now() - 3 * 86400000;
      for (const l of d.lessons) {
        if (l.id === next) break;
        if (l.available) w.WordPath.complete(d, h, l.id, false, old);
      }
      w.PathSRS.open(d, h, old);
      h.save = true;
      localStorage.setItem(
        key,
        JSON.stringify({ ...h, contentVersion: d.contentVersion }),
      );
    },
    { next, key },
  );
  await p.reload();
}
test("old words reappear inside later lessons after gaps, hidden from new-word models and not every lesson", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto(url);
  const d = await data(page),
    seen: any[] = [];
  for (const [index, l] of d.lessons.slice(0, 8).entries()) {
    await click(page, "start", l.id);
    if (l.kind === "introduce" && index > 1) {
      const models = await page
        .locator(".lesson-models>div>.script")
        .allTextContents();
      for (const w of d.words.slice(0, 3)) expect(models).not.toContain(w.word);
      expect(models.length).toBeLessThanOrEqual(2);
    }
    let mixed = 0;
    await solve(page, d, async (item) => {
      if (item.mixed) {
        mixed++;
        expect(await page.locator(".answer-model").count()).toBe(0);
        seen.push({ lesson: index, word: item.word.id, kind: item.kind });
      }
    });
    expect(mixed).toBeLessThanOrEqual(2);
    await expect(
      page.getByRole("heading", { name: "A step forward." }),
    ).toBeVisible();
    await click(page, "map");
  }
  expect(seen.length).toBeGreaterThan(0);
  expect(
    seen.some(
      (x) =>
        d.words.slice(0, 3).some((w: any) => w.id === x.word) && x.lesson >= 3,
    ),
  ).toBe(true);
  for (const w of new Set(seen.map((x) => x.word))) {
    const occurrences = seen.filter((x) => x.word === w);
    for (let n = 1; n < occurrences.length; n++)
      expect(
        occurrences[n].lesson - occurrences[n - 1].lesson,
      ).toBeGreaterThanOrEqual(2);
  }
});
test("an old-word error gets a later different activity without blocking the new lesson", async ({
  page,
}) => {
  await seed(page, "u2-04");
  const d = await data(page);
  await click(page, "start", "u2-04");
  let target: any = null,
    gap = 0,
    returned = false,
    mixed = 0;
  await solve(page, d, async (item) => {
    if (
      (item.mixed || item.corrective) &&
      !(await page.locator('[data-path="advance"]').count())
    )
      mixed++;
    if (item.mixed && !target) {
      target = item;
      const action = item.kind === "read" ? "answer-picture" : "answer-word";
      await page
        .locator(`[data-path="${action}"]:not([data-id="${item.word.id}"])`)
        .first()
        .click();
      await expect(page.locator("#taskFeedback")).toContainText("Compare");
      await click(page, "help");
    } else if (target && !returned) {
      if (item.corrective && item.word.id === target.word.id) {
        expect(gap).toBeGreaterThanOrEqual(2);
        expect(item.kind).not.toBe(target.kind);
        returned = true;
      } else gap++;
    }
  });
  expect(target).toBeTruthy();
  expect(returned).toBe(true);
  expect(mixed).toBeLessThanOrEqual(3);
  await expect(
    page.getByRole("heading", { name: "A step forward." }),
  ).toBeVisible();
  await click(page, "map");
  await expect(page.locator('.path-node [data-id="u2-05"]')).toBeEnabled();
  const items = (await page.evaluate(
    (key) => Object.values(JSON.parse(localStorage.getItem(key)!).srs.items),
    key,
  )) as any[];
  expect(
    items.some(
      (i) =>
        i.wordId === target.word.id &&
        i.incorrect > 0 &&
        i.hints > 0 &&
        i.step === 0,
    ),
  ).toBe(true);
});
test("detailed recall history survives reopening with consent and never overwrites Unit 1 history", async ({
  page,
}) => {
  await seed(page, "u2-04");
  await page.evaluate(() =>
    localStorage.setItem("tigrinya.practice.v1", "keep-existing-unit1-history"),
  );
  const d = await data(page);
  await click(page, "start", "u2-04");
  await solve(page, d);
  await click(page, "map");
  const before = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(
    Object.values(before.srs.items).some(
      (i: any) => i.correct > 0 && i.contexts.includes("u2-04"),
    ),
  ).toBe(true);
  await page.reload();
  const after = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(after.srs.items).toEqual(before.srs.items);
  expect(after.lessons).toEqual(before.lessons);
  expect(
    await page.evaluate(() => localStorage.getItem("tigrinya.practice.v1")),
  ).toBe("keep-existing-unit1-history");
});
test("a long backlog stays embedded and bounded; learners can skip a mixed item and keep moving", async ({
  page,
}) => {
  await seed(page, "u2-12");
  const d = await data(page);
  await expect(page.locator('.next-card [data-path="start"]')).toHaveAttribute(
    "data-id",
    "u2-12",
  );
  await click(page, "start", "u2-12");
  let skipped = 0,
    mixed = 0;
  await solve(page, d, async (item) => {
    if (item.mixed) {
      mixed++;
      if (!skipped) {
        skipped++;
        await click(page, "skip-mixed");
        return true;
      }
    }
  });
  expect(skipped).toBe(1);
  expect(mixed).toBeLessThanOrEqual(2);
  await expect(
    page.getByRole("heading", { name: "A step forward." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});
test("a missing scheduler fails clearly without overwriting existing saved progress", async ({
  page,
}) => {
  await seed(page, "u2-04");
  const before = await page.evaluate((key) => localStorage.getItem(key), key);
  await page.route("**/src/path-srs.js", (route) => route.abort());
  await page.goto(url);
  await expect(page.getByRole("alert")).toContainText("did not load");
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    before,
  );
  await page.unrouteAll();
  await click(page, "reload");
  await expect(page.locator('.next-card [data-path="start"]')).toHaveAttribute(
    "data-id",
    "u2-04",
  );
});
