import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
const content = JSON.parse(fs.readFileSync("stories/catalog.json", "utf8"));
const url = "/preview/stories/index.html",
  key = "tigrinya.stories.v1";
const act = (page: Page, action: string) =>
  page.locator(`[data-story="${action}"]`).first().click();
for (const [index, s] of content.stories.entries()) {
  test(`story ${index + 1}: complete text, original art, completion and navigation · ${s.id}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(url);
    await expect(page.locator(".story-card")).toHaveCount(20);
    await page.locator(`[data-story="open"][data-id="${s.id}"]`).click();
    await expect(page.locator("[data-reading-story]")).toHaveAttribute(
      "data-reading-story",
      s.id,
    );
    await expect(page.locator("h1.story-title")).toHaveText(s.title);
    await expect(page.locator(".story-prose p")).toHaveCount(
      s.paragraphs.length,
    );
    expect(await page.locator(".story-prose p").allTextContents()).toEqual(
      s.paragraphs.map((p: any) => p.text),
    );
    await expect(page.locator(".story-prose")).toHaveAttribute("lang", "ti");
    await expect(page.locator(".story-prose")).toHaveCSS("direction", "ltr");
    const illustration = page.locator(".story-illustration img");
    await illustration.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        illustration.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
      )
      .toBe(true);
    await expect(illustration).toHaveAttribute("alt", s.illustrations[0].alt);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(await page.locator("audio,video").count()).toBe(0);
    await act(page, "finish");
    await expect(page.locator("#storyFinishStatus")).toContainText(
      "You marked this story read",
    );
    const next = content.stories[index + 1],
      previous = content.stories[index - 1];
    if (next)
      await expect(
        page.locator(`.story-reader-links [data-id="${next.id}"]`),
      ).toBeVisible();
    if (previous)
      await expect(
        page.locator(`.story-reader-links [data-id="${previous.id}"]`),
      ).toBeVisible();
    await act(page, "library");
    await expect(page.locator(`[data-story-id="${s.id}"]`)).toContainText(
      "Marked as read",
    );
    expect(errors).toEqual([]);
  });
}
test("main Stories navigation and standalone entry open a collection outside the learning path", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Stories", exact: true }).click();
  await expect(page).toHaveURL(/\/preview\/stories\/index.html/);
  await expect(
    page.getByRole("heading", { name: "Stories", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".story-card")).toHaveCount(20);
  await page.goto("/preview/index.html");
  await expect(page.locator(".units .unit")).toHaveCount(2);
  await expect(page.locator(".units .story-entry")).toHaveCount(0);
  await page.getByRole("link", { name: "Open Stories →" }).click();
  await expect(page.locator(".story-card")).toHaveCount(20);
});
test("story shelves, Ethiopic search, bookmark removal and empty results are understandable", async ({
  page,
}) => {
  await page.goto(url);
  await page.locator('[data-mode="saved"]').click();
  await expect(
    page.getByRole("heading", { name: "A little shelf for later." }),
  ).toBeVisible();
  await act(page, "reset");
  await page.locator("#storySearch").fill("ወርሒ");
  await expect(page.locator(".story-card")).not.toHaveCount(0);
  await page.locator("#storySearch").fill("zzzz-missing");
  await expect(
    page.getByRole("heading", { name: "No matching titles." }),
  ).toBeVisible();
  await act(page, "reset");
  await page
    .locator(`[data-story="bookmark"][data-id="${content.stories[0].id}"]`)
    .click();
  await page.locator('[data-mode="saved"]').click();
  await expect(page.locator(".story-card")).toHaveCount(1);
  await act(page, "bookmark");
  await expect(page.locator(".story-card")).toHaveCount(0);
  await expect(page.locator('[data-mode="saved"]')).toBeFocused();
});
test("reading position and bookmarks survive reopening only with device saving; course keys stay unchanged", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("tigrinya.practice.v1", "keep-unit1-exact");
    localStorage.setItem("tigrinya.word-path.v1", "keep-course-exact");
  });
  await page.goto(url);
  await page
    .locator(`[data-story="bookmark"][data-id="${content.stories[0].id}"]`)
    .click();
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBeNull();
  await act(page, "settings");
  await page.locator("#storySaving").check();
  await act(page, "close-settings");
  await page
    .locator(`[data-story="open"][data-id="${content.stories[0].id}"]`)
    .click();
  await page
    .locator("#story-p5")
    .evaluate((p) => p.scrollIntoView({ block: "start", behavior: "instant" }));
  await expect
    .poll(() =>
      page.evaluate(
        ({ key, id }) =>
          JSON.parse(localStorage.getItem(key)!).stories[id].position,
        { key, id: content.stories[0].id },
      ),
    )
    .toBeGreaterThanOrEqual(3);
  const before = await page.evaluate(
    ({ key, id }) => JSON.parse(localStorage.getItem(key)!).stories[id],
    { key, id: content.stories[0].id },
  );
  await page.reload();
  await expect(page.locator(`#story-p${before.position + 1}`)).toBeFocused();
  await act(page, "library");
  await page.locator('[data-mode="saved"]').click();
  await expect(page.locator(".story-card")).toHaveCount(1);
  expect(
    await page.evaluate(() => localStorage.getItem("tigrinya.practice.v1")),
  ).toBe("keep-unit1-exact");
  expect(
    await page.evaluate(() => localStorage.getItem("tigrinya.word-path.v1")),
  ).toBe("keep-course-exact");
});
test("between-story navigation and browser back return to the expected complete narrative", async ({
  page,
}) => {
  await page.goto(url + "#story/" + content.stories[0].id);
  await page
    .locator(`.story-reader-links [data-id="${content.stories[1].id}"]`)
    .click();
  await expect(page.locator("[data-reading-story]")).toHaveAttribute(
    "data-reading-story",
    content.stories[1].id,
  );
  await page.goBack();
  await expect(page.locator("[data-reading-story]")).toHaveAttribute(
    "data-reading-story",
    content.stories[0].id,
  );
  await page.getByRole("link", { name: "Stories", exact: true }).click();
  await expect(page.locator(".story-card")).toHaveCount(20);
});
test("missing illustrations explain the failure while every paragraph stays readable", async ({
  page,
}) => {
  await page.route("**/stories/assets/cat-and-moonlight.svg", (route) =>
    route.abort(),
  );
  await page.goto(url + "#story/cat-and-moonlight");
  await page.locator(".story-illustration").scrollIntoViewIfNeeded();
  await expect(
    page.locator(".story-illustration .story-image-error"),
  ).toBeVisible();
  await expect(page.locator(".story-prose p")).toHaveCount(8);
  await act(page, "finish");
  await expect(page.locator("#storyFinishStatus")).toContainText(
    "marked this story read",
  );
});
test("corrupt saved data and missing runtime data preserve the previous copy and keep recovery clear", async ({
  page,
}) => {
  const raw = "{keep-this-corrupt-copy";
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
    key,
    raw,
  });
  await page.goto(url);
  await expect(page.locator("#storySaveNote")).toContainText("kept unchanged");
  await expect(page.locator(".story-card")).toHaveCount(20);
  await page.locator('[data-story="bookmark"]').first().click();
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(raw);
  await page.route("**/stories/data.js", (r) => r.abort());
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("could not load");
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(raw);
});
test("a failed opt-in write is visible and does not interrupt the story", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === "tigrinya.stories.v1") throw new Error("quota");
      return original.call(this, k, v);
    };
  });
  await page.goto(url);
  await act(page, "settings");
  await page.locator("#storySaving").check();
  await expect(page.locator("#storySaveNote")).toContainText(
    "Saving is unavailable",
  );
  await act(page, "close-settings");
  await page.locator('[data-story="open"]').first().click();
  await expect(page.locator(".story-prose p")).toHaveCount(8);
  await act(page, "finish");
  await expect(page.locator("#storyFinishStatus")).toContainText(
    "marked this story read",
  );
});
test("large script, evening view, keyboard controls, reduced motion and narrow layouts remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url);
  await page.locator('[data-story="open"]').first().focus();
  await page.keyboard.press("Enter");
  await act(page, "settings");
  await page.locator("#storyTextSize").selectOption("32");
  await page.locator("#storyEvening").check();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-story="settings"]')).toBeFocused();
  await expect(page.locator(".story-prose")).toHaveCSS("font-size", "32px");
  await expect(page.locator("body")).toHaveAttribute(
    "data-story-evening",
    "true",
  );
  await page.setViewportSize({ width: 320, height: 760 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator("#story-p7").scrollIntoViewIfNeeded();
  await expect(page.locator(".story-reader-bar")).toBeInViewport();
  await act(page, "library");
  await expect(page.locator(".story-card")).toHaveCount(20);
});
