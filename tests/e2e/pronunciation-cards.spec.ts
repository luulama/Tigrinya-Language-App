import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
const url = "/preview/unit-01-fidel-foundations/pronunciation.html",
  key = "tigrinya.practice.v1";
const click = async (p: Page, action: string) => {
  if (
    action === "save" &&
    (await p.locator(".say-settings").getAttribute("open")) === null
  )
    await p.locator(".say-settings summary").click();
  await p.locator(`[data-say="${action}"]`).first().click();
};
// Synthetic PCM tone, only for transport/playback tests. Never Tigrinya or a native model.
function tone() {
  const n = 3200,
    buffer = Buffer.alloc(44 + n * 2);
  buffer.write("RIFF");
  buffer.writeUInt32LE(36 + n * 2, 4);
  buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(16000, 24);
  buffer.writeUInt32LE(32000, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++)
    buffer.writeInt16LE(
      Math.round(Math.sin((i / 16000) * Math.PI * 2 * 400) * 1000),
      44 + i * 2,
    );
  return buffer;
}
async function modelFixture(p: Page, fail = false) {
  const source = fs.readFileSync(
    "unit-01-fidel-foundations/pronunciation-content.js",
    "utf8",
  );
  const content = JSON.parse(
    source
      .slice(source.indexOf("=") + 1)
      .trim()
      .replace(/;$/, ""),
  );
  const review = {
    status: "approved",
    language: "ti",
    reviewer: "TEST FIXTURE ONLY",
    rights: "synthetic playback test only",
    reviewedAt: "2026-11-21",
    sourceUrl: "https://example.test/evidence",
    sourceLocator: "not a native recording",
  };
  for (const c of content.cards.filter(
    (c: any) => c.family === "በ" && c.order !== 6,
  )) {
    c.target = {
      ...review,
      character: c.character,
      kind: "syllabic-form",
      variety: "test-only",
      guide: "Test-only guide: not pronunciation content.",
    };
    c.audio = {
      ...review,
      normal: "../shared/assets/test-normal.wav",
      slow: "../shared/assets/test-slow.wav",
    };
  }
  await p.route("**/pronunciation-content.js", (r) =>
    r.fulfill({
      contentType: "text/javascript",
      body:
        "globalThis.PronunciationCardContent=" + JSON.stringify(content) + ";",
    }),
  );
  await p.route("**/shared/assets/test-*.wav", (r) =>
    fail ? r.abort() : r.fulfill({ contentType: "audio/wav", body: tone() }),
  );
}
async function reflect(p: Page, rating = "got") {
  await click(p, "attempt");
  await click(p, "hear");
  await expect(p.locator('[data-say="rate"]')).toHaveCount(3);
  await p.locator(`[data-rating="${rating}"]`).click();
  await click(p, "next");
}
test("Unit 1 launches cards; front hides support and audio; missing-model session finishes and replays", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/preview/unit-01-fidel-foundations/index.html");
  await page
    .getByRole("link", { name: "Say & remember · pronunciation cards →" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Say & remember" }),
  ).toBeVisible();
  await expect(page.locator(".say-preview")).toContainText("0 of 293");
  await click(page, "start");
  const first = await page.locator(".say-glyph").textContent();
  await expect(page.locator(".say-reveal")).toHaveCount(0);
  await expect(page.locator('[data-say="hear"]')).toHaveCount(0);
  await expect(page.locator('[data-say="rate"]')).toHaveCount(0);
  await expect(page.locator(".say-glyph")).toHaveAttribute("lang", "ti");
  await expect(page.locator(".say-glyph")).toHaveCSS("direction", "ltr");
  for (let n = 0; n < 5; n++) {
    await click(page, "attempt");
    await expect(
      page.getByRole("status").filter({ hasText: "recording is still needed" }),
    ).toBeVisible();
    await click(page, "unscored");
    await click(page, "next");
  }
  await expect(
    page.getByRole("heading", { name: "Room to remember." }),
  ).toBeVisible();
  await click(page, "start");
  await expect(page.locator(".say-glyph")).not.toHaveText(first!);
  expect(errors).toEqual([]);
});
test("reviewed-fixture flow requires a completed model, supports slow/replay/retry, pause and completion", async ({
  page,
}) => {
  await modelFixture(page);
  await page.goto(url);
  await click(page, "start");
  await expect(page.locator(".say-reveal")).toHaveCount(0);
  await click(page, "attempt");
  await expect(page.locator('[data-say="rate"]')).toHaveCount(0);
  await click(page, "hear");
  await expect(page.locator('[data-say="rate"]')).toHaveCount(3);
  await expect(page.locator('[data-say="hear"]')).toBeFocused();
  await click(page, "slow");
  await expect(page.locator('[data-say="hear"]')).toBeEnabled();
  await expect(page.locator('[data-say="slow"]')).toBeFocused();
  await click(page, "hear");
  await expect(page.locator('[data-say="hear"]')).toBeEnabled();
  await click(page, "retry");
  await expect(page.locator(".say-reveal")).toHaveCount(0);
  await click(page, "pause");
  await expect(
    page.getByRole("heading", { name: "A little pause." }),
  ).toBeVisible();
  await click(page, "resume");
  await page.locator(".say-glyph").waitFor();
  await reflect(page);
  for (let n = 1; n < 5; n++) await reflect(page);
  await expect(
    page.getByRole("heading", { name: "Room to remember." }),
  ).toBeVisible();
});
test("self-ratings persist in existing opt-in profile; a supported weak card returns after two other cards", async ({
  page,
}) => {
  await modelFixture(page);
  await page.goto(url);
  await click(page, "save");
  await click(page, "start");
  const first = await page.locator(".say-glyph").textContent();
  await reflect(page, "need");
  const second = await page.locator(".say-glyph").textContent();
  expect(second).not.toBe(first);
  await reflect(page, "got");
  expect(await page.locator(".say-glyph").textContent()).not.toBe(first);
  await reflect(page, "got");
  await expect(page.locator(".say-glyph")).toHaveText(first!);
  await expect(
    page.locator(".say-eyebrow").filter({ hasText: "supported revisit" }),
  ).toBeVisible();
  const saved = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!),
    key,
  );
  expect(saved.pronunciation.items[first!].need).toBe(1);
  expect(saved.pronunciation.items[first!].step).toBe(0);
  const remaining = saved.pronunciation.items[first!].due - Date.now();
  expect(remaining).toBeGreaterThan(500000);
  expect(remaining).toBeLessThanOrEqual(600000);
  await page.reload();
  const after = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!),
    key,
  );
  expect(after.pronunciation.items).toEqual(saved.pronunciation.items);
});
test("denied microphone and absent recognition do not penalise the speak-aloud flow", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "SpeechRecognition", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(window, "webkitSpeechRecognition", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: () => Promise.reject(new DOMException("no", "NotAllowedError")),
      configurable: true,
    });
  });
  await page.goto(url);
  await click(page, "start");
  await page.locator(".say-voice summary").click();
  await click(page, "record");
  await expect(page.locator(".say-voice")).toContainText(
    "Microphone access was not allowed",
  );
  await click(page, "attempt");
  await click(page, "unscored");
  await click(page, "next");
  await expect(page.locator(".say-panel")).toHaveAttribute(
    "data-phase",
    "attempt",
  );
  await expect(page.locator('[data-say="rate"]')).toHaveCount(0);
});
test("old unscored exploration does not become a longer-interval success when models arrive", async ({
  page,
}) => {
  await modelFixture(page);
  await page.goto(url);
  const char = await page.evaluate(() => {
    const w = window as any,
      h = w.PronunciationCards.fresh(),
      c = w.PronunciationCardContent.cards[0].character;
    w.PronunciationCards.rate(h, c, "unscored", {
      time: Date.now() - 3 * 86400000,
      id: "old-unscored-visit",
      sessionId: "old-no-model",
    });
    w.LearningPath.cardPractice.write(h);
    w.LearningPath.cardPractice.setSaving(true);
    return c;
  });
  await page.reload();
  await click(page, "start");
  await expect(page.locator(".say-glyph")).toHaveText(char);
  await reflect(page, "got");
  const item = await page.evaluate(
    ({ key, char }) =>
      JSON.parse(localStorage.getItem(key)!).pronunciation.items[char],
    { key, char },
  );
  expect(item.got).toBe(1);
  expect(item.step).toBe(0);
  expect(item.delayedSelfRatings).toBe(0);
  expect(item.due - Date.now()).toBeGreaterThan(23.5 * 3600000);
  expect(item.due - Date.now()).toBeLessThanOrEqual(86400000);
});
test("unsupported recording still offers a useful card and no permission request", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "MediaRecorder", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.goto(url);
  await click(page, "start");
  await page.locator(".say-voice summary").click();
  await expect(page.locator(".say-voice")).toContainText(
    "Recording is unavailable here",
  );
  await expect(page.locator('[data-say="record"]')).toHaveCount(0);
  await click(page, "attempt");
  await click(page, "unscored");
  await click(page, "next");
});
test("broken or interrupted reference playback never enables a false pronunciation rating", async ({
  page,
}) => {
  await modelFixture(page, true);
  await page.goto(url);
  await click(page, "start");
  await click(page, "attempt");
  await click(page, "hear");
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "The model could not play." })
      .first(),
  ).toBeVisible();
  await expect(page.locator('[data-say="rate"]')).toHaveCount(0);
  await click(page, "unscored");
  await click(page, "next");
});
test("late microphone permission after pause is stopped and never starts recording", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const w = window as any;
    w.stoppedTracks = 0;
    w.micRequests = 0;
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: () => {
        w.micRequests++;
        return new Promise(
          (resolve) =>
            (w.grantMic = () =>
              resolve({
                getTracks: () => [{ stop: () => w.stoppedTracks++ }],
              })),
        );
      },
      configurable: true,
    });
  });
  await page.goto(url);
  await click(page, "start");
  expect(await page.evaluate(() => (window as any).micRequests)).toBe(0);
  await page.locator(".say-voice summary").click();
  await click(page, "record");
  await click(page, "pause");
  await page.evaluate(() => (window as any).grantMic());
  await expect
    .poll(() => page.evaluate(() => (window as any).stoppedTracks))
    .toBe(1);
  await click(page, "resume");
  await expect(page.locator('[data-say="stop-record"]')).toHaveCount(0);
});
test("temporary recording stops tracks and clears blob on continue without voice storage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const w = window as any;
    w.stoppedTracks = 0;
    w.revokedClips = 0;
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = (url) => {
      w.revokedClips++;
      revoke(url);
    };
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: async () => ({
        getTracks: () => [{ stop: () => w.stoppedTracks++ }],
      }),
      configurable: true,
    });
    class Recorder {
      static isTypeSupported() {
        return true;
      }
      state = "inactive";
      mimeType = "audio/webm";
      ondataavailable: any;
      onstop: any;
      onerror: any;
      start() {
        this.state = "recording";
      }
      stop() {
        this.state = "inactive";
        queueMicrotask(() => {
          this.ondataavailable?.({
            data: new Blob(["test-only clip"], { type: "audio/webm" }),
          });
          this.onstop?.();
        });
      }
    }
    Object.defineProperty(window, "MediaRecorder", {
      value: Recorder,
      configurable: true,
    });
  });
  await page.goto(url);
  await click(page, "save");
  await click(page, "start");
  await page.locator(".say-voice summary").click();
  await click(page, "record");
  await expect(page.locator('[data-say="stop-record"]')).toBeVisible();
  await click(page, "stop-record");
  await expect(page.locator('[data-say="my-voice"]')).toBeVisible();
  expect(
    await page.evaluate(() => (window as any).stoppedTracks),
  ).toBeGreaterThan(0);
  await click(page, "attempt");
  await click(page, "unscored");
  await expect
    .poll(() => page.evaluate(() => (window as any).revokedClips))
    .toBe(1);
  const saved = await page.evaluate((k) => localStorage.getItem(k), key);
  expect(saved).not.toMatch(/blob:|test-only clip|voiceUrl/);
});
test("native MediaRecorder can record and play a temporary synthetic stream without uploading", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const w = window as any;
    w.captureRequests = 0;
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      configurable: true,
      value: async () => {
        w.captureRequests++;
        const ctx = new AudioContext(),
          destination = ctx.createMediaStreamDestination(),
          oscillator = ctx.createOscillator();
        oscillator.connect(destination);
        oscillator.start();
        await ctx.resume();
        w.syntheticContext = ctx;
        return destination.stream;
      },
    });
  });
  const outgoing: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") outgoing.push(r.url());
  });
  await page.goto(url);
  await click(page, "start");
  expect(await page.evaluate(() => (window as any).captureRequests)).toBe(0);
  await page.locator(".say-voice summary").click();
  await click(page, "record");
  await expect(page.locator('[data-say="stop-record"]')).toBeVisible();
  // A real MediaRecorder needs actual media duration to produce a playable clip.
  await page.waitForTimeout(350);
  await click(page, "stop-record");
  await expect(page.locator('[data-say="my-voice"]')).toBeVisible();
  await click(page, "my-voice");
  await expect(page.locator(".say-voice")).toContainText("Your try played.");
  await click(page, "discard");
  await expect(page.locator('[data-say="my-voice"]')).toHaveCount(0);
  expect(outgoing).toEqual([]);
  await page.evaluate(() => (window as any).syntheticContext.close());
});
test("keyboard, reduced motion, source layout and existing Unit 1 stay usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url);
  await page.getByRole("button", { name: "Begin 5 cards →" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".say-panel")).toHaveCSS("animation-name", "none");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "I tried · show support" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".say-reveal")).toBeVisible();
  await page.getByRole("link", { name: "← Unit 1" }).click();
  await page.locator("#startBtn").click();
  await expect(page.locator("#form")).toHaveText("በ");
  await expect(page.locator("#traceAction")).toBeVisible();
});
test("missing card data has clear recovery without changing existing saved history", async ({
  page,
}) => {
  const original = JSON.stringify({
    version: 1,
    save: true,
    mode: "child",
    minutes: 5,
    items: {},
    families: {},
    pronunciation: {
      version: 1,
      turn: 0,
      items: {},
      session: null,
      lastCharacter: null,
    },
  });
  await page.addInitScript(
    ({ key, original }) => localStorage.setItem(key, original),
    { key, original },
  );
  await page.route("**/pronunciation-content.js", (r) => r.abort());
  await page.goto(url);
  await expect(page.getByRole("alert")).toContainText("unavailable");
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(
    original,
  );
});
