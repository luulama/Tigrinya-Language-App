import { test, expect, type Page, type Locator } from "@playwright/test";

async function imageLoaded(img: Locator) {
  await expect
    .poll(() =>
      img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0),
    )
    .toBe(true);
}
async function noOverflow(p: Page) {
  expect(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
}
const native = "/preview/";

test("the animal welcomes learners on the main, Learn and Progress screens with working quiet controls", async ({
  page,
}) => {
  for (const [url, state] of [
    ["/", "idle"],
    ["/learn", "encouraging"],
    ["/progress", "encouraging"],
  ]) {
    await page.goto(url);
    const bear = page.locator("figure.neri-scene").first();
    await expect(bear).toHaveAttribute("data-neri-state", state);
    await imageLoaded(bear.locator("img"));
    await bear.getByRole("button", { name: "Quiet view" }).click();
    await expect(bear.locator("img")).toBeHidden();
    await expect(bear.locator("figcaption p")).toBeVisible();
    await bear.getByRole("button", { name: "Show Mele" }).click();
    await expect(bear.locator("img")).toBeVisible();
    await noOverflow(page);
  }
});

test("Fidäl has a bear welcome and a quiet lesson companion while the original character and writing controls work", async ({
  page,
}) => {
  await page.goto(native + "unit-01-fidel-foundations/index.html");
  const welcome = page.locator("#home img.guide");
  await expect(welcome).toHaveAttribute("alt", /Neri the bear/);
  await imageLoaded(welcome);
  await page.locator("#startBtn").click();
  await expect(page.locator("#form")).toHaveText("በ");
  const bear = page.locator('[data-neri-scene="unit1"]:not(script)');
  await expect(bear).toBeVisible();
  await expect(bear).toHaveAttribute("data-neri-state", "resting");
  await page.locator("#traceAction").click();
  await expect(page.locator("#writingWorkshop")).toBeVisible();
  await noOverflow(page);
});

test("picture words use bear help without changing word models or automatically answering the activity", async ({
  page,
}) => {
  await page.goto(native + "unit-02-first-words/index.html");
  await imageLoaded(page.locator(".guide-hello img"));
  await page.locator("#playButton").click();
  const text = await page.locator("#activity").textContent();
  await page.locator("#helpButton").click();
  await expect(page.locator("#helpButton img")).toHaveAttribute(
    "src",
    /neri-kind.svg/,
  );
  expect(await page.locator("#activity").textContent()).toBe(text);
  await expect(page.locator("#gameScreen")).toBeVisible();
  await noOverflow(page);
});

test("the word path and both game collections keep the bear outside the learning controls", async ({
  page,
}) => {
  await page.goto(native + "unit-02-first-words/path.html");
  const bear = page.locator('[data-neri-scene="path"]:not(script)');
  await expect(bear).toHaveAttribute("data-neri-state", "idle");
  await page.locator('[data-path="start"][data-id="u2-01"]').first().click();
  await expect(bear).toHaveAttribute("data-neri-state", "resting");
  const face = await bear.boundingBox(),
    lesson = await page.locator(".lesson-panel").boundingBox();
  expect(face!.y + face!.height).toBeLessThanOrEqual(lesson!.y);
  await noOverflow(page);
  for (const unit of [1, 2]) {
    await page.goto(native + "games/index.html?unit=" + unit);
    const b = page.locator('[data-neri-scene="games"]:not(script)');
    await expect(b).toBeVisible();
    await imageLoaded(b.locator("img"));
    await noOverflow(page);
  }
});

test("Stories keeps its full text and uses a still sleepy animal outside the prose, with no voice or course effects", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("tigrinya.word-path.v1", "keep-course"),
  );
  await page.goto(native + "stories/index.html");
  await expect(page.locator(".story-card")).toHaveCount(20);
  const bear = page.locator('[data-neri-scene="stories"]:not(script)');
  await expect(bear).toHaveAttribute("data-neri-state", "idle");
  await bear.getByRole("button", { name: "Quiet view" }).click();
  await page.locator('[data-story="open"]').first().click();
  await expect(bear).toHaveAttribute("data-neri-state", "sleepy");
  await expect(bear.locator("img")).toBeHidden();
  await expect(page.locator(".story-prose p")).toHaveCount(8);
  await expect(page.locator(".story-prose .neri-scene")).toHaveCount(0);
  await bear.getByRole("button", { name: "Show Neri" }).click();
  await imageLoaded(bear.locator("img"));
  await expect(page.locator("audio,video")).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("tigrinya.word-path.v1")),
  ).toBe("keep-course");
  await noOverflow(page);
});

test("all nine animal SVGs and the human lip guides load as complete XML without the old object body", async ({
  page,
  request,
}) => {
  const states = [
    "idle",
    "listening",
    "thinking",
    "encouraging",
    "celebrating",
    "kind",
    "demonstrating",
    "resting",
    "sleepy",
  ];
  for (const state of states) {
    const r = await request.get(
      native + "shared/mascot/assets/neri-" + state + ".svg",
    );
    expect(r.ok()).toBe(true);
    const svg = await r.text();
    expect(svg).toContain('data-neri-kind="bear"');
    expect(svg).not.toMatch(/notebook|bookmark|binding rings/);
  }
  await page.goto(native + "unit-01-fidel-foundations/pronunciation.html");
  await page.locator('[data-say="start"]').click();
  await page.locator('[data-say="attempt"]').click();
  await page.locator(".neri-guide > summary").click();
  await expect(page.locator("#neriCloseup svg")).toHaveAttribute(
    "data-neri-kind",
    "human-lip-guide",
  );
  await expect(page.locator(".neri-diagram-label")).toContainText("human lips");
  for (let n = 0; n < 3; n++) {
    await page.locator(`[data-neri-step="${n}"]`).click();
    await expect(page.locator(`[data-neri-step="${n}"]`)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  }
});

test("reduced motion, keyboard quiet controls and a failed bear image preserve an accessible narrow-screen flow", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.route("**/neri-sleepy.svg", (r) => r.abort());
  await page.goto(native + "stories/index.html");
  await page.locator('[data-story="open"]').first().click();
  const bear = page.locator('[data-neri-scene="stories"]:not(script)');
  await expect(bear.locator("img")).toBeHidden();
  await expect(bear.locator("figcaption p")).toBeVisible();
  await bear.getByRole("button", { name: "Quiet view" }).focus();
  await page.keyboard.press("Enter");
  await expect(bear.getByRole("button", { name: "Show Neri" })).toBeFocused();
  expect(
    await bear.evaluate((e) => e.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await noOverflow(page);
});

test("static animal art remains available when JavaScript is disabled", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    }),
    p = await context.newPage();
  await p.goto(baseURL + native + "stories/index.html");
  const bear = p.locator('[data-neri-scene="stories"]:not(script)');
  await expect(bear).toBeVisible();
  await imageLoaded(bear.locator("img"));
  await expect(bear.locator("button")).toBeHidden();
  await context.close();
});
