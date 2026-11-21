import { test, expect, type Page } from "@playwright/test";
const url = "/preview/unit-02-first-words/path.html",
  key = "tigrinya.word-path.v1";
const press = (page: Page, action: string, id?: string | number) =>
  page
    .locator(
      `button[data-path="${action}"]${id === undefined ? "" : `[data-id=${JSON.stringify(String(id))}]`}`,
    )
    .first()
    .click();
async function content(page: Page): Promise<any> {
  return page.evaluate(() => (window as any).WordPathContent);
}
async function seedBefore(page: Page, id: string, ago = 100) {
  await page.goto(url);
  await page.evaluate(
    ({ id, key, ago }) => {
      const w = window as any,
        h = w.WordPath.fresh(),
        d = w.WordPathContent;
      for (const l of d.lessons) {
        if (l.id === id) break;
        if (l.available)
          w.WordPath.complete(d, h, l.id, false, Date.now() - ago);
      }
      h.save = true;
      localStorage.setItem(
        key,
        JSON.stringify({ ...h, contentVersion: d.contentVersion }),
      );
    },
    { id, key, ago },
  );
  await page.reload();
}
async function answerTask(page: Page, data: any) {
  const task = page.locator(".lesson-task"),
    kind = await task.getAttribute("data-kind");
  if (await page.locator('[data-path="advance"]').count()) {
    await press(page, "advance");
    return;
  }
  let word: any;
  const prompt = task.locator('.prompt-word [lang="ti"]').first();
  const targetScript = (await prompt.count())
    ? await prompt.textContent()
    : null;
  if (targetScript) word = data.words.find((w: any) => w.word === targetScript);
  else {
    const use = task.locator(":scope > .word-picture use");
    const href = await use.getAttribute("href");
    word = data.words.find((w: any) => href === `#art-${w.art}`);
  }
  expect(word).toBeTruthy();
  if (kind === "choose") await press(page, "answer-word", word.id);
  if (kind === "read") await press(page, "answer-picture", word.id);
  if (kind === "build")
    for (const ch of word.letters) await press(page, "place", ch);
  if (kind === "type") {
    await page.locator("#pathWordEntry").fill(word.word);
    await press(page, "compare");
  }
  if (kind === "position" || kind === "locate") {
    const findNode = task.locator('.find-form [lang="ti"]');
    const find = (await findNode.count()) ? await findNode.textContent() : null;
    const position = find
      ? word.letters.indexOf(find)
      : (await page.getByRole("heading", { level: 1 }).textContent())!.includes(
            "first",
          )
        ? 0
        : 1;
    await press(page, "position", position);
  }
  await expect(page.locator("#taskFeedback")).not.toBeEmpty();
  await press(page, "advance");
}
async function finish(page: Page, data: any, stopAtCheck = false) {
  for (let turn = 0; turn < 65; turn++) {
    if (await page.locator('[data-path="map"]').count()) return;
    if (await page.locator('[data-path="begin"]').count()) {
      await press(page, "begin");
      continue;
    }
    if (await page.locator('[data-path="check"]').count()) {
      if (stopAtCheck) return;
      await press(page, "check");
      continue;
    }
    await answerTask(page, data);
  }
  throw Error("Lesson did not reach completion");
}
test("main app opens the ordered path with one available first lesson and unchanged Unit 1 navigation", async ({
  page,
}) => {
  await page.goto("/learn");
  await page
    .getByRole("link", { name: "Follow the word path →", exact: true })
    .click();
  await expect(page).toHaveURL(/unit-02-first-words\/path.html/);
  await expect(page.locator(".path-node")).toHaveCount(27);
  await expect(
    page.locator('[data-path="start"][data-id="u2-01"]').last(),
  ).toBeEnabled();
  await expect(
    page.locator('[data-path="start"][data-id="u2-02"]'),
  ).toBeDisabled();
  await expect(
    page.locator('[data-path="start"][data-id="u3-01"]'),
  ).toBeDisabled();
  await page.locator('.path-node [data-id="u2-01"]').focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Three familiar pictures", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Unit 1 · Fidäl", exact: true }).click();
  await expect(page).toHaveURL(/unit-01-fidel-foundations\/index.html/);
  await expect(
    page.getByRole("heading", { name: "Meet a Fidäl family." }),
  ).toBeVisible();
});
test("all 27 lessons play, unlock in order and remain revisit-able at desktop and phone sizes", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto(url);
  const data = await content(page);
  let cleared = 0;
  for (const l of data.lessons.filter((l: any) => l.available)) {
    await press(page, "start", l.id);
    await finish(page, data);
    await expect(
      page.getByRole("heading", { name: "A step forward." }),
    ).toBeVisible();
    await press(page, "map");
    cleared++;
    await expect(page.locator(".path-progress")).toContainText(
      `${cleared} of 27`,
    );
    const node = page
      .locator(".path-node")
      .filter({ has: page.locator(`[data-id="${l.id}"]`) });
    await expect(node).toHaveClass(/complete/);
    if (l.id === "u2-21")
      await expect(page.locator(".route-summary strong")).toHaveText(
        "3 · Read & write",
      );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await expect(
    page.locator('[data-path="start"][data-id="u3-06"]'),
  ).toBeEnabled();
  await press(page, "start", "u2-01");
  await expect(page.locator(".lesson-models")).toBeVisible();
  await press(page, "leave");
  await expect(
    page.getByRole("button", { name: "Continue lesson →" }),
  ).toBeVisible();
  await press(page, "resume");
  await expect(page.locator('[data-path="begin"]')).toBeVisible();
  expect(errors).toEqual([]);
});
test("help is kind, repeated taps cannot pass a check and a fresh successful check unlocks", async ({
  page,
}) => {
  await page.goto(url);
  const data = await content(page);
  await press(page, "start", "u2-01");
  await finish(page, data, true);
  await press(page, "check");
  const href = await page
    .locator(".lesson-task > .word-picture use")
    .getAttribute("href");
  const correct = data.words.find((w: any) => href === `#art-${w.art}`);
  const wrong = page
    .locator(`[data-path="answer-word"]:not([data-id="${correct.id}"])`)
    .first();
  await wrong.click();
  await expect(page.locator("#taskFeedback")).toContainText("Compare");
  await expect(page.locator(".answer-model")).toBeVisible();
  await expect(page.locator('[data-path="advance"]')).toHaveCount(0);
  await page
    .locator(`[data-path="answer-word"]:not([data-id="${correct.id}"])`)
    .first()
    .click();
  await finish(page, data);
  await expect(
    page.getByRole("heading", { name: "Good practice. Try once more." }),
  ).toBeVisible();
  await press(page, "map");
  await expect(page.locator('.path-node [data-id="u2-02"]')).toBeDisabled();
  await press(page, "start", "u2-01");
  await finish(page, data);
  await press(page, "map");
  await expect(page.locator('.path-node [data-id="u2-02"]')).toBeEnabled();
});
test("consent-controlled saving survives reload and leaves existing Unit 1 history untouched", async ({
  page,
}) => {
  await page.goto(url);
  await page.evaluate(() =>
    localStorage.setItem(
      "tigrinya.practice.v1",
      "existing-history-test-sentinel",
    ),
  );
  const data = await content(page);
  await press(page, "start", "u2-01");
  await finish(page, data);
  await press(page, "map");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), key),
  ).toBeNull();
  await page.locator("#pathSettings summary").first().click();
  await press(page, "save");
  await page.reload();
  await expect(page.locator(".path-progress")).toContainText("1 of 27");
  await expect(page.locator('.path-node [data-id="u2-02"]')).toBeEnabled();
  expect(
    await page.evaluate(() => localStorage.getItem("tigrinya.practice.v1")),
  ).toBe("existing-history-test-sentinel");
});
test("failed save preserves in-tab progress and the previous saved copy", async ({
  page,
}) => {
  await seedBefore(page, "u2-02");
  const saved = await page.evaluate((key) => localStorage.getItem(key), key);
  await page.evaluate((key) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key)
        throw new DOMException(
          "Synthetic storage failure",
          "QuotaExceededError",
        );
      return original.call(this, name, value);
    };
  }, key);
  const data = await content(page);
  await press(page, "start", "u2-02");
  await finish(page, data);
  await press(page, "map");
  await expect(page.locator(".path-progress")).toContainText("2 of 27");
  await expect(page.getByRole("alert")).toContainText("Saving failed");
  await page.locator("#pathSettings summary").first().click();
  await expect(page.locator("#storageStatus")).toContainText("Saving failed");
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    saved,
  );
});
test("a due review begins without the answer model and records delayed visual evidence", async ({
  page,
}) => {
  await seedBefore(page, "u2-02", 2 * 86400000);
  const data = await content(page);
  await press(page, "review");
  await expect(page.locator(".answer-model")).toHaveCount(0);
  await finish(page, data);
  await press(page, "map");
  await expect(page.locator(".path-progress")).toContainText(
    "3 words matched in a later-day review",
  );
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  for (const id of data.lessons[0].wordIds)
    expect(saved.review[id].step).toBe(1);
  await press(page, "review");
  await finish(page, data);
  await press(page, "map");
  const second = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  for (const id of data.lessons[0].wordIds)
    expect(second.review[id].step).toBe(1);
});
test("Ethiopic entry, composition, writing fallback and reduced-motion controls work in Unit 3", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seedBefore(page, "u3-03");
  const data = await content(page);
  await press(page, "start", "u3-03");
  await press(page, "begin");
  const first = data.words.find(
    (w: any) =>
      w.id === data.lessons.find((l: any) => l.id === "u3-03").wordIds[0],
  );
  await page.locator("#writingOptional > summary").click();
  await expect(page.locator("#writingPad")).toBeVisible();
  await expect(page.locator("#writingStill")).toBeChecked();
  await expect(page.getByRole("button", { name: "Watch teacher" })).toHaveCount(
    0,
  );
  await expect(page.locator("audio")).toHaveCount(0);
  await page.locator("#writingPad").scrollIntoViewIfNeeded();
  const box = await page.locator("#writingPad").boundingBox();
  await page.mouse.move(box!.x + 40, box!.y + 40);
  await page.mouse.down();
  await page.mouse.move(box!.x + 90, box!.y + 90);
  await page.mouse.up();
  await expect(page.locator("#writingInk path")).toHaveCount(1);
  await page.locator('[data-writing="clear"]').click();
  await expect(page.locator("#writingInk path")).toHaveCount(0);
  await page.locator('[data-writing="undo"]').click();
  await expect(page.locator("#writingInk path")).toHaveCount(1);
  await page.locator("#pathWordEntry").fill("wrong");
  await press(page, "compare");
  await expect(page.locator("#taskFeedback")).toContainText(first.word);
  await page.locator("#pathWordEntry").fill(first.word);
  await page.locator("#pathWordEntry").dispatchEvent("compositionstart");
  await press(page, "compare");
  await expect(page.locator("#taskFeedback")).toContainText("Finish entering");
  await page.locator("#pathWordEntry").dispatchEvent("compositionend");
  await press(page, "compare");
  await press(page, "advance");
  const second = data.words.find(
    (w: any) =>
      w.id === data.lessons.find((l: any) => l.id === "u3-03").wordIds[1],
  );
  for (const ch of second.letters) await press(page, "insert", ch);
  await press(page, "delete");
  await press(page, "insert", second.letters[1]);
  await expect(page.locator("#pathWordEntry")).toHaveValue(second.word);
  await press(page, "compare");
  await press(page, "advance");
  await finish(page, data);
  await expect(
    page.getByRole("heading", { name: "A step forward." }),
  ).toBeVisible();
});
test("seeing a model resets the delayed-review gap without losing saved lesson checks", async ({
  page,
}) => {
  await seedBefore(page, "u2-02", 2 * 86400000);
  const data = await content(page);
  await press(page, "start", "u2-01");
  await expect(page.locator(".lesson-models")).toBeVisible();
  await page.reload();
  await expect(page.locator(".path-progress")).toContainText("1 of 27");
  await press(page, "review");
  await finish(page, data);
  await press(page, "map");
  await expect(page.locator(".path-progress")).toContainText(
    "0 words matched in a later-day review",
  );
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  for (const id of data.lessons[0].wordIds)
    expect(saved.review[id].step).toBe(0);
});
test("one due word has meaningful taught alternatives and a partial review is not counted twice", async ({
  page,
}) => {
  await seedBefore(page, "u2-02", 2 * 86400000);
  const data = await content(page),
    ids = data.lessons[0].wordIds;
  await page.evaluate(
    ({ key, ids }) => {
      const h = JSON.parse(localStorage.getItem(key)!);
      for (const id of ids.slice(1)) {
        h.review[id].due = Date.now() + 2 * 86400000;
        for (const item of Object.values(h.srs?.items || {}) as any[])
          if (item.wordId === id) item.dueAt = h.review[id].due;
      }
      localStorage.setItem(key, JSON.stringify(h));
    },
    { key, ids },
  );
  await page.reload();
  await press(page, "review");
  for (let turn = 0; turn < 3; turn++) {
    const kind = await page.locator(".lesson-task").getAttribute("data-kind");
    const action = kind === "read" ? "answer-picture" : "answer-word";
    await expect(page.locator(`[data-path="${action}"]`)).toHaveCount(3);
    const prompt = page.locator('.prompt-word [lang="ti"]').first();
    const script = (await prompt.count()) ? await prompt.textContent() : null;
    const href = script
      ? null
      : await page
          .locator(".lesson-task > .word-picture use")
          .getAttribute("href");
    const w = data.words.find((w: any) =>
      script ? w.word === script : href === `#art-${w.art}`,
    );
    await press(page, action, w.id);
    if (w.id === ids[0]) break;
    await press(page, "advance");
  }
  const partial = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(partial.review[ids[0]].step).toBe(1);
  await press(page, "leave");
  await press(page, "abandon");
  await page.reload();
  await press(page, "review");
  await finish(page, data);
  await press(page, "map");
  const after = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(after.review[ids[0]].step).toBe(1);
  for (const id of ids.slice(1)) expect(after.review[id].step).toBe(0);
});
test("missing source and malformed saved data have recovery paths; future audio/messages stay gated", async ({
  page,
}) => {
  await page.route("**/path-content.js", (route) => route.abort());
  await page.goto(url);
  await expect(page.getByRole("alert")).toContainText("did not load");
  await page.unrouteAll();
  await press(page, "reload");
  await expect(page.locator(".next-card")).toBeVisible();
  await page.evaluate(
    (key) => localStorage.setItem(key, "invalid test JSON"),
    key,
  );
  await page.reload();
  await page.locator("#pathSettings summary").first().click();
  await expect(page.locator("#storageStatus")).toContainText(
    "could not be read",
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    "invalid test JSON",
  );
  await page.locator(".beyond-card summary").click();
  await expect(page.locator(".beyond-card")).toContainText(
    "Unit 4 · Listen & respond",
  );
  await expect(page.locator(".beyond-card")).toContainText("Not assessed");
  await expect(page.locator('[data-id="u4-01"]')).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
