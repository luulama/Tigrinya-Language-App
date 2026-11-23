import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import crypto from "node:crypto";

const url = "/preview/unit-01-fidel-foundations/pronunciation.html";
const parse = (file: string) => {
  const s = fs.readFileSync(file, "utf8");
  return JSON.parse(
    s
      .slice(s.indexOf("=") + 1)
      .trim()
      .replace(/;$/, ""),
  );
};
const all = parse("unit-01-fidel-foundations/pronunciation-content.js");
const guides = JSON.parse(
  fs.readFileSync("shared/content-review/articulation.json", "utf8"),
);
const act = (p: Page, action: string) =>
  p.locator(`[data-say="${action}"]`).first().click();
async function only(p: Page, character = "በ") {
  await p.route("**/pronunciation-content.js", (r) =>
    r.fulfill({
      contentType: "text/javascript",
      body:
        "globalThis.PronunciationCardContent=" +
        JSON.stringify({
          ...all,
          cards: all.cards.filter((c: any) => c.character === character),
        }) +
        ";",
    }),
  );
}
async function begin(p: Page, character = "በ") {
  await p.goto(url);
  await p
    .locator("#cardFamily")
    .selectOption(all.cards.find((c: any) => c.character === character).family);
  await act(p, "start");
  await act(p, "attempt");
}
// Test-only PCM tones exercise media transport. No speech or native approval is claimed.
function tone(seconds: number) {
  const n = seconds * 16000,
    b = Buffer.alloc(44 + n * 2);
  b.write("RIFF");
  b.writeUInt32LE(36 + n * 2, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(16000, 24);
  b.writeUInt32LE(32000, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++)
    b.writeInt16LE(
      Math.round(Math.sin((i / 16000) * Math.PI * 2 * 300) * 500),
      44 + i * 2,
    );
  return b;
}
async function audioFixture(p: Page, aligned = true, fail = false) {
  const data = structuredClone(guides),
    content = structuredClone(all),
    card = content.cards.find((c: any) => c.character === "በ");
  const review = {
    status: "approved",
    language: "ti",
    reviewer: "TEST FIXTURE ONLY",
    reviewedAt: "2026-11-21",
    variety: "fixture-only",
    rights: "test tone only",
    sourceUrl: "https://example.test/fixture",
    sourceLocator: "transport test, never Tigrinya speech",
  };
  card.target = { ...review, character: "በ", kind: "syllabic-form" };
  card.audio = {
    ...review,
    normal: "../shared/assets/neri-normal.wav",
    slow: "../shared/assets/neri-slow.wav",
  };
  content.cards = [card];
  data.profiles[0].revision = "0".repeat(20);
  data.profiles[0].review = { ...review, revision: data.profiles[0].revision };
  for (const speed of ["normal", "slow"]) {
    const duration = speed === "normal" ? 1600 : 3200,
      bytes = tone(duration / 1000);
    if (aligned)
      data.alignments.push({
        ...review,
        scope: "consonant-component",
        profile: "b-lips",
        character: "በ",
        speed,
        targetKind: "syllabic-form",
        audioPath: card.audio[speed],
        sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
        durationMs: duration,
        frames: data.profiles[0].steps.map((s: any, i: number) => ({
          atMs: [0.05, 0.45, 0.8][i] * duration,
          stage: i,
          pose: s.pose,
        })),
      });
  }
  await p.route("**/pronunciation-content.js", (r) =>
    r.fulfill({
      contentType: "text/javascript",
      body:
        "globalThis.PronunciationCardContent=" + JSON.stringify(content) + ";",
    }),
  );
  await p.route("**/mascot/articulation-data.js", (r) =>
    r.fulfill({
      contentType: "text/javascript",
      body: "globalThis.MascotArticulationData=" + JSON.stringify(data) + ";",
    }),
  );
  await p.route("**/shared/assets/neri-*.wav", (r) =>
    fail
      ? r.abort()
      : r.fulfill({
          contentType: "audio/wav",
          body: tone(r.request().url().includes("slow") ? 3.2 : 1.6),
        }),
  );
  await p.addInitScript(() => {
    const w = window as any,
      Original = window.Audio;
    w.Audio = function (src: string) {
      const a = new Original(src);
      w.__neriTestAudio = a;
      return a;
    };
    w.Audio.prototype = Original.prototype;
  });
}

test("Neri renders nine distinct accessible bear expressions at small and normal sizes", async ({
  page,
}) => {
  await page.goto(url);
  await expect(page.locator('[data-neri-state="idle"]')).toBeVisible();
  const states = await page.evaluate(() => {
    const w = window as any,
      result = [];
    const host = document.createElement("div");
    host.style.width = "64px";
    document.body.append(host);
    const actor = w.Neri.create(host);
    for (const state of w.Neri.states) {
      actor.update({ state, caption: state });
      result.push({
        state,
        label: host.querySelector('[role="img"]')!.getAttribute("aria-label"),
        width: host.getBoundingClientRect().width,
        svg: host.querySelector("svg")!.outerHTML,
      });
    }
    actor.destroy();
    host.remove();
    return result;
  });
  expect(states).toHaveLength(9);
  expect(new Set(states.map((s) => s.svg)).size).toBe(9);
  expect(states.every((s) => s.width === 64 && s.label?.includes("Neri"))).toBe(
    true,
  );
  await page.getByRole("button", { name: "Quiet view", exact: true }).click();
  await expect(page.locator(".neri-companion")).toHaveAttribute(
    "data-quiet",
    "true",
  );
  await page.getByRole("button", { name: "Show Neri", exact: true }).click();
  await expect(page.locator(".neri-companion")).toHaveAttribute(
    "data-quiet",
    "false",
  );
});

test("each of 18 exact form bindings opens its intended consonant guide with three usable still steps", async ({
  page,
}) => {
  for (const binding of guides.bindings) {
    await page.unroute("**/pronunciation-content.js");
    await only(page, binding.character);
    await begin(page, binding.character);
    await expect(page.locator(".neri-guide")).toHaveAttribute(
      "data-profile",
      binding.profile,
    );
    await page.locator(".neri-guide > summary").click();
    for (let i = 0; i < 3; i++) {
      await page.locator(`[data-neri-step="${i}"]`).click();
      await expect(page.locator(`[data-neri-step="${i}"]`)).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await expect(page.locator("#neriCue")).toHaveText(
        guides.profiles.find((p: any) => p.id === binding.profile).steps[i].cue,
      );
    }
    await expect(page.locator('[data-say="rate"]')).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("recall stays quiet; silent movement plays, slows, stops, finishes and replays without awarding a grade", async ({
  page,
}) => {
  await page.clock.install();
  await only(page);
  await page.goto(url);
  await act(page, "start");
  await expect(page.locator('[data-neri-state="resting"]')).toBeVisible();
  await expect(page.locator(".neri-guide")).toHaveCount(0);
  await act(page, "attempt");
  await page.locator(".neri-guide > summary").click();
  await page.locator('[data-neri="play"]').click();
  await expect(
    page.locator('.neri-companion [data-neri-state="demonstrating"]'),
  ).toBeVisible();
  await page.clock.runFor(1200);
  await expect(page.locator('[data-neri-step="1"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator('[data-neri="stop"]').click();
  await expect(page.locator("#neriStatus")).toContainText("stopped");
  await page.locator("#neriSlow").check();
  await page.locator('[data-neri="play"]').click();
  await page.clock.runFor(2600);
  await expect(page.locator('[data-neri="stop"]')).toBeVisible();
  await page.clock.runFor(2400);
  await expect(page.locator("#neriStatus")).toContainText("finished");
  await page.locator('[data-neri="play"]').click();
  await page.clock.runFor(100);
  await act(page, "pause");
  await expect(page.locator('[data-neri-state="resting"]')).toBeVisible();
  await act(page, "resume");
  await act(page, "unscored");
  await act(page, "next");
  await expect(page.locator('[data-neri-state="celebrating"]')).toBeVisible();
  await expect(page.locator('[data-say="rate"]')).toHaveCount(0);
});

test("unsupported forms, sixth order and missing articulation content have honest recoverable fallbacks", async ({
  page,
}) => {
  for (const char of ["ተ", "ብ"]) {
    await page.unroute("**/pronunciation-content.js");
    await only(page, char);
    await begin(page, char);
    await expect(page.locator(".neri-guide")).toHaveCount(0);
    await expect(page.locator(".neri-unavailable")).toContainText(
      "still needed",
    );
    await act(page, "unscored");
    await act(page, "next");
    await expect(
      page.getByRole("heading", { name: "Room to remember." }),
    ).toBeVisible();
  }
  await page.unroute("**/pronunciation-content.js");
  await only(page);
  await page.route("**/mascot/articulation-data.js", (r) => r.abort());
  await begin(page);
  await expect(page.locator(".neri-unavailable")).toContainText(
    "could not load",
  );
  await act(page, "unscored");
});

test("reduced motion and keyboard input preserve every step, disable automatic movement and support narrow screens", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 800 });
  await only(page);
  await begin(page);
  const summary = page.locator(".neri-guide > summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#neriStill")).toBeChecked();
  await expect(page.locator('[data-neri="play"]')).toBeHidden();
  for (let i = 0; i < 3; i++) {
    const b = page.locator(`[data-neri-step="${i}"]`);
    await b.focus();
    await page.keyboard.press("Enter");
    await expect(b).toHaveAttribute("aria-pressed", "true");
  }
  expect(
    await page
      .locator(".neri-guide")
      .evaluate((e) => e.getAnimations({ subtree: true }).length),
  ).toBe(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const glyph = await page.locator(".say-glyph").boundingBox(),
    guide = await page.locator(".neri-guide").boundingBox();
  expect(glyph!.y + glyph!.height).toBeLessThan(guide!.y);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("#neriStill")).toBeEnabled();
  await expect(page.locator("#neriStill")).not.toBeChecked();
  await page.locator('[data-neri="play"]').click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator('[data-neri="stop"]')).toBeHidden();
  await expect(page.locator("#neriStill")).toBeChecked();
});

test("reviewed test-only audio and alignment follow media time, pause and slow recording without invented vowel motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await audioFixture(page);
  await begin(page);
  await page.locator(".neri-guide > summary").click();
  await act(page, "hear");
  await expect(page.locator("#neriStatus")).toContainText(
    "reviewed consonant segment",
  );
  await page.evaluate(() => {
    const a = (window as any).__neriTestAudio;
    a.pause();
  });
  await expect(page.locator("#neriStatus")).toContainText("paused");
  const pose = await page
    .locator("#neriCloseup .neri-mouth")
    .getAttribute("data-mouth-opening");
  await page.waitForTimeout(120);
  expect(
    await page
      .locator("#neriCloseup .neri-mouth")
      .getAttribute("data-mouth-opening"),
  ).toBe(pose);
  await page.evaluate(() => {
    const a = (window as any).__neriTestAudio;
    a.currentTime = 1.4;
    return a.play();
  });
  await expect(page.locator("#neriStatus")).toContainText(
    "consonant segment only",
  );
  await expect(page.locator('[data-say="rate"]')).toHaveCount(3);
  await act(page, "slow");
  await expect(page.locator("#neriStatus")).toContainText(
    "reviewed consonant segment",
  );
  await page.evaluate(() => {
    (window as any).__neriTestAudio.currentTime = 3;
  });
  await expect(page.locator('[data-say="slow"]')).toBeEnabled();
  await page.locator('[data-rating="need"]').click();
  await expect(page.locator('[data-neri-state="kind"]')).toBeVisible();
});

test("reviewed audio without timing keeps a still mouth, and failed audio retains unscored recovery", async ({
  page,
}) => {
  await audioFixture(page, false);
  await begin(page);
  await page.locator(".neri-guide > summary").click();
  await act(page, "hear");
  await expect(page.locator("#neriStatus")).toContainText("without lip sync");
  const mouth = page.locator("#neriCloseup .neri-mouth");
  const before = await mouth.getAttribute("data-mouth-opening");
  await page.waitForTimeout(150);
  expect(await mouth.getAttribute("data-mouth-opening")).toBe(before);
  await act(page, "pause");
  await act(page, "resume");
  await page.route("**/shared/assets/neri-*.wav", (r) => r.abort());
  await act(page, "hear");
  await expect(page.locator('[data-neri-state="kind"]')).toBeVisible();
  await expect(page.locator('[data-say="rate"]')).toHaveCount(0);
  await act(page, "unscored");
  await act(page, "next");
});

test("denied microphone and unavailable recognition remain optional, with no mascot storage or upload", async ({
  page,
}) => {
  await only(page);
  await page.addInitScript(() => {
    const w = window as any;
    w.SpeechRecognition = undefined;
    w.webkitSpeechRecognition = undefined;
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: () => Promise.reject(new DOMException("no", "NotAllowedError")),
      configurable: true,
    });
    localStorage.setItem("tigrinya.stories.v1", "keep-stories");
  });
  await page.goto(url);
  await act(page, "start");
  await page.locator(".say-voice > summary").click();
  await act(page, "record");
  await expect(page.locator(".say-voice")).toContainText(
    "Microphone access was not allowed",
  );
  await act(page, "attempt");
  await page.locator(".neri-guide > summary").click();
  await page.locator("#neriStill").check();
  await act(page, "unscored");
  await act(page, "next");
  expect(
    await page.evaluate(() => localStorage.getItem("tigrinya.stories.v1")),
  ).toBe("keep-stories");
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => /neri|mascot/.test(k)),
    ),
  ).toEqual([]);
});

test("missing mascot code preserves the original card flow; Stories has a quiet bear and no voice controls", async ({
  page,
}) => {
  await only(page);
  await page.route("**/mascot/neri.js", (r) => r.abort());
  await begin(page);
  await act(page, "unscored");
  await act(page, "next");
  await expect(
    page.getByRole("heading", { name: "Room to remember." }),
  ).toBeVisible();
  await page.goto("/preview/stories/index.html");
  await expect(page.locator(".story-card")).toHaveCount(20);
  await expect(
    page.locator('.neri-scene[data-neri-scene="stories"]'),
  ).toBeVisible();
  await expect(page.locator("audio")).toHaveCount(0);
});
