import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const silence = readFileSync(
  new URL("../fixtures/synthetic-silence.m4a", import.meta.url),
).toString("base64");

async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

test("the bundled home and six complete entry points work without any external request", async ({
  page,
}) => {
  const failures = [],
    external = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("request", (request) => {
    if (
      !request.url().startsWith("http://127.0.0.1:4310/") &&
      !request.url().startsWith("blob:")
    )
      external.push(request.url());
  });
  await page.goto("/");
  await expect(page.locator(".mobile-choices a")).toHaveCount(6);
  expect(
    await page
      .locator(".mobile-welcome img")
      .evaluate((img) => img.complete && img.naturalWidth > 0),
  ).toBe(true);
  const links = await page
    .locator(".mobile-choices a")
    .evaluateAll((items) => items.map((item) => item.getAttribute("href")));
  for (const link of links) {
    await page.goto("/" + link);
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
    await noOverflow(page);
    await page
      .getByRole("link", { name: "Practice home", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "What shall we practise?" }),
    ).toBeVisible();
  }
  expect(failures).toEqual([]);
  expect(external).toEqual([]);
});

test("Fidäl models, typing and freehand writing remain usable inside the bundle", async ({
  page,
}) => {
  await page.goto("/practice/unit-01-fidel-foundations/index.html");
  await page.locator("#startBtn").click();
  await expect(page.locator("#form")).toHaveText("በ");
  await page.locator("#traceAction").click();
  await expect(page.locator("#writingWorkshop")).toBeVisible();
  await page
    .getByText("Text practice · use a keyboard or Fidäl keys", { exact: true })
    .click();
  const input = page
    .locator('#writingWorkshop input[type="text"], #writingWorkshop textarea')
    .first();
  await input.fill("በ");
  await expect(input).toHaveValue("በ");
  const surface = page.locator("#writingPad");
  await surface.scrollIntoViewIfNeeded();
  const box = await surface.boundingBox();
  if (box) {
    await page.mouse.move(box.x + 40, box.y + 45);
    await page.mouse.down();
    await page.mouse.move(box.x + 80, box.y + 90);
    await page.mouse.up();
  }
  await expect(page.locator("#writingInk .writing-stroke")).toHaveCount(1);
  await noOverflow(page);
});

test("the first word lesson launches, accepts practice and preserves revisit navigation", async ({
  page,
}) => {
  await page.goto("/practice/unit-02-first-words/path.html");
  await page.locator('[data-path="start"][data-id="u2-01"]').first().click();
  await expect(page.locator(".lesson-panel")).toBeVisible();
  const begin = page.locator('[data-path="begin"]').first();
  await begin.click();
  await expect(page.locator(".lesson-task")).toBeVisible();
  const advance = page.locator('[data-path="advance"]').first();
  await advance.click();
  await expect(page.locator(".lesson-task")).toBeVisible();
  await noOverflow(page);
  await page.getByRole("link", { name: "Practice home", exact: true }).click();
  await page.getByRole("link", { name: /First words/ }).click();
  await expect(
    page.locator('[data-path="start"][data-id="u2-01"]').first(),
  ).toBeVisible();
});

test("both ten-game collections and full story reading are bundled", async ({
  page,
}) => {
  for (const unit of [1, 2]) {
    await page.goto("/practice/games/index.html?unit=" + unit);
    await expect(page.locator(".game-card")).toHaveCount(10);
    await page.locator(".game-card").first().click();
    await expect(page.locator(".model-card").first()).toBeVisible();
    await page.locator('[data-action="play"]').first().click();
    await expect(page.locator("[data-action]").first()).toBeVisible();
    await noOverflow(page);
  }
  await page.goto("/practice/stories/index.html");
  await expect(page.locator(".story-card")).toHaveCount(20);
  await page.locator('[data-story="open"]').first().click();
  await expect(page.locator(".story-prose p")).toHaveCount(8);
  expect(await page.locator('a[href="/stories/published"]').count()).toBe(0);
  await noOverflow(page);
});

test("offline settings do not attempt an API call and block external links", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => {
    if (request.url().includes("/health/") || request.url().includes(":5080"))
      requests.push(request.url());
  });
  await page.goto("/settings.html");
  await expect(page.locator("#mobile-mode")).toContainText("Offline practice");
  await expect(
    page.getByRole("button", { name: "Check API connection" }),
  ).toBeDisabled();
  await page.evaluate(() => {
    const a = document.createElement("a");
    a.href = "https://example.com";
    a.textContent = "Fixture external source";
    document.querySelector("main").append(a);
  });
  await page.getByRole("link", { name: "Fixture external source" }).click();
  await expect(page.locator(".mobile-link-status")).toContainText(
    "stay closed",
  );
  expect(requests).toEqual([]);
  expect(page.url()).toContain("/settings.html");
});

test("missing microphone support has a usable fallback and reduced-motion small layout", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "MediaRecorder", { value: undefined });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/voice.html");
  await expect(page.locator("#voice-state")).toContainText("Speak aloud");
  await expect(page.locator("#voice-start")).toBeDisabled();
  await noOverflow(page);
  await page.getByRole("link", { name: "Practice home", exact: true }).click();
  await noOverflow(page);
});

test("native bridge adapter supports recording, stop, clip playback controls and deletion", async ({
  page,
}) => {
  // A transport fixture, not an actual microphone or a native pronunciation recording.
  await page.addInitScript((silence) => {
    let resolve, reject;
    window.CapacitorCustomPlatform = { name: "ios" };
    window.Capacitor = {
      PluginHeaders: [
        {
          name: "PrivateVoice",
          methods: ["record", "stop", "cancel"].map((name) => ({
            name,
            rtype: "promise",
          })),
        },
      ],
      nativePromise: async (_plugin, method) => {
        if (method === "record")
          return new Promise((yes, no) => {
            resolve = yes;
            reject = no;
          });
        if (method === "stop") {
          resolve?.({ base64: silence, mimeType: "audio/mp4" });
          return {};
        }
        if (method === "cancel") {
          reject?.(Error("cancelled"));
          reject = undefined;
          return {};
        }
      },
    };
  }, silence);
  await page.goto("/voice.html");
  await expect(page.locator("#voice-start")).toBeEnabled();
  await page.locator("#voice-start").click();
  await expect(page.locator("#voice-stop")).toBeVisible();
  await page.locator("#voice-stop").click();
  await expect(page.locator("#voice-state")).toContainText(
    "private clip is ready",
  );
  await expect(page.locator("#voice-playback")).toBeVisible();
  await page.locator("#voice-delete").click();
  await expect(page.locator("#voice-playback")).toBeHidden();
  await page.locator("#voice-start").click();
  await page.locator("#voice-cancel").click();
  await expect(page.locator("#voice-state")).toContainText(
    "microphone stays off",
  );
});

test("static HTML entry points work when scripts are disabled", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4310/");
  await expect(
    page.getByRole("heading", { name: "What shall we practise?" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Fidäl/ }).click();
  await expect(page.locator("#home img.guide")).toBeVisible();
  await context.close();
});
