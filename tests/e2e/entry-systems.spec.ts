import { test, expect, type Page } from "@playwright/test";

async function finishVisualPractice(page: Page) {
  await page
    .getByRole("button", { name: "Try the shape", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Choose a shape instead of drawing" })
    .click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "በ", exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "ቡ", exact: true }).click();
  await expect(
    page.getByText("Here is the model. Have another look, then try again."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await page.getByRole("button", { name: "በ", exact: true }).click();
  await page
    .getByRole("button", { name: "See my practice", exact: true })
    .click();
}

test("home offers an account-free first lesson, corrects kindly and shares a truthful visit recap", async ({
  page,
}, info) => {
  const apiRequests: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/"))
      apiRequests.push(r.url());
  });
  await page.goto("/");
  await page.getByRole("link", { name: "Try the first small lesson" }).click();
  await expect(
    page.getByRole("heading", { name: "Meet one form", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Reviewed sound isn’t available yet. Try the shape preview.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Hear the form", exact: true }),
  ).toHaveCount(0);
  await finishVisualPractice(page);
  await expect(page.getByText("Sound wasn’t practised.")).toBeVisible();
  await page
    .getByRole("link", { name: "Show a grown-up", exact: true })
    .click();
  await expect(page.getByText(/Was shown በ and found its match/)).toBeVisible();
  await expect(page.getByText(/final shape check used help/)).toBeVisible();
  await expect(page.getByText(/Sound was not practised/)).toBeVisible();
  expect(apiRequests).toEqual([]);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("parent-visit.png"),
    fullPage: true,
  });
  await page.reload();
  await expect(page.getByText(/No first practice recorded/)).toBeVisible();
});

test("drawing, cancellation, undo and accessible text alternative work on the actual source form", async ({
  page,
}, info) => {
  await page.goto("/first-lesson");
  await page
    .getByRole("button", { name: "Try the shape", exact: true })
    .click();
  const pad = page.locator(".first-pad");
  const rect = (await pad.boundingBox())!;
  await expect(
    page.getByRole("button", { name: "Next", exact: true }),
  ).toBeDisabled();
  await page.mouse.move(rect.x + rect.width * 0.3, rect.y + rect.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * 0.4, rect.y + rect.height * 0.4);
  await pad.dispatchEvent("pointercancel");
  await page.mouse.up();
  await expect(pad.locator("path")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Next", exact: true }),
  ).toBeDisabled();
  await page.mouse.move(rect.x + rect.width * 0.3, rect.y + rect.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(
    rect.x + rect.width * 0.55,
    rect.y + rect.height * 0.65,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(pad.locator("path")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(pad.locator("path")).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(pad.locator("path")).toHaveCount(1);
  await page.screenshot({
    path: info.outputPath("first-writing.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Use keys instead", exact: true })
    .click();
  await page.getByRole("textbox").fill("በ");
  await page.getByRole("button", { name: "Compare text", exact: true }).click();
  await expect(
    page.getByText("Same form. This checks text, not handwriting."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next", exact: true }),
  ).toBeEnabled();
});

test("heritage listener chooses a reading starting point with no invented placement score", async ({
  page,
}, info) => {
  await page.goto("/onboarding");
  await page
    .getByRole("button", { name: "I understand comfortably", exact: true })
    .click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page
    .getByRole("button", { name: "I haven’t started", exact: true })
    .click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page
    .getByRole("button", { name: "The forms are new", exact: true })
    .click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "See my plan", exact: true }).click();
  await expect(
    page.getByText(
      "Build on what you already understand, one written form at a time.",
    ),
  ).toBeVisible();
  await expect(page.getByText(/No level has been assigned/)).toBeVisible();
  await page.screenshot({
    path: info.outputPath("starting-plan.png"),
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Try one small practice", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Meet one form", exact: true }),
  ).toBeVisible();
});

test("Mele respects quiet, allows breaks and forgets only the current visit on request", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/first-lesson");
  await page.getByRole("button", { name: "Quiet view", exact: true }).click();
  await expect(page.locator(".neri-scene")).toHaveAttribute(
    "data-quiet",
    "true",
  );
  await page.getByText("Choose how we go", { exact: true }).click();
  await page
    .getByRole("button", { name: "I need a break", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "We can pause here.", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Continue this practice", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Meet one form", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === "running")
            .length,
      ),
    )
    .toBe(0);
  await page.getByText("For grown-ups", { exact: true }).first().click();
  await page
    .getByRole("link", { name: "Choose a starting plan", exact: true })
    .click();
  await page.getByText("What Mele remembers", { exact: true }).click();
  await page
    .getByRole("button", { name: "Clear this visit", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Quiet view", exact: true }),
  ).toBeVisible();
});

test("unconfigured cloud memory fails closed and core practice stays available", async ({
  page,
}) => {
  await page.route("**/api/auth/config", (r) =>
    r.fulfill({ json: { enabled: false } }),
  );
  await page.goto("/onboarding");
  await page.getByText("What Mele remembers", { exact: true }).click();
  await page
    .getByRole("button", { name: "Save plan to my account", exact: true })
    .click();
  await expect(
    page.getByText("Sign in to use saved learning and account tools."),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Start without questions", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Meet one form", exact: true }),
  ).toBeVisible();
});

test("keyboard next action and back navigation keep choices usable", async ({
  page,
}) => {
  await page.goto("/onboarding");
  const skip = page.getByRole("button", {
    name: "Skip this question",
    exact: true,
  });
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", {
      name: "When you speak Tigrinya…",
      exact: true,
    }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "When you hear Tigrinya…", exact: true }),
  ).toBeVisible();
});

test("a familiar reader can follow the word recommendation without a beginner gate", async ({
  page,
}) => {
  await page.goto("/onboarding");
  await page
    .getByRole("button", { name: "I understand comfortably", exact: true })
    .click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page
    .getByRole("button", { name: "I speak comfortably", exact: true })
    .click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page
    .getByRole("button", { name: "I read comfortably", exact: true })
    .click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page
    .getByRole("button", { name: "Connect pictures and words", exact: true })
    .click();
  await page.getByRole("button", { name: "See my plan", exact: true }).click();
  await page
    .getByRole("link", { name: "Explore picture words", exact: true })
    .click();
  await expect(page).toHaveURL(/\/preview\/unit-02-first-words\/path.html$/);
});

test("narrow screens retain the main form and next action without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/first-lesson");
  await expect(page.locator(".first-form")).toHaveText("በ");
  await expect(
    page.getByRole("button", { name: "Try the shape", exact: true }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".first-form")).toHaveAttribute("dir", "ltr");
});
