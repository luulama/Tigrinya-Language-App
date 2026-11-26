import { test, expect } from "@playwright/test";
test("a learner can reach and use the complete Fidäl preview", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Learn", exact: true })
    .click();
  await page.getByRole("link", { name: "Begin Fidäl preview" }).click();
  await expect(
    page.getByRole("heading", { name: "Meet a Fidäl family." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Start with በ/ })
    .first()
    .click();
  await expect(page.locator("#form")).toHaveText("በ");
  await expect(
    page.getByRole("button", { name: /Write/ }).first(),
  ).toBeVisible();
});
test("settings are keyboard accessible and save only by explicit choice", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Time available").selectOption("3");
  expect(
    await page.evaluate(() => localStorage.getItem("polyglot.preferences.v1")),
  ).toBeNull();
  await page
    .getByRole("button", { name: "Save preferences on this device" })
    .click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByLabel("Time available")).toHaveValue("3");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("account tools fail closed without silently creating an account", async ({
  page,
}) => {
  await page.goto("/progress");
  await expect(
    page
      .getByText(
        /Sign in to use saved learning|offline|Sign-in service is unavailable/,
      )
      .first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your practice." }),
  ).toBeVisible();
});

test("the offline Learn screen requests published lessons only after the library is opened", async ({
  page,
}) => {
  const requests: string[] = [];
  const runtimeErrors: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/lessons")
      requests.push(request.url());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.route("**/api/lessons?**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ items: [], nextCursor: null }),
    }),
  );
  await page.goto("/learn");
  await expect(
    page.getByRole("link", { name: "Follow the word path" }),
  ).toBeVisible();
  // A real interaction establishes hydration before checking for hidden requests.
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  expect(requests).toEqual([]);

  await page.getByText("Published lessons", { exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Reviewed content comes first" }),
  ).toBeVisible();
  expect(requests).toHaveLength(1);
  await page.getByLabel("Find content").fill("test-only search");
  await page.getByText("Published lessons", { exact: true }).click();
  await page.getByText("Published lessons", { exact: true }).click();
  await expect(page.getByLabel("Find content")).toHaveValue("test-only search");
  expect(runtimeErrors).toEqual([]);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test("redesign fonts load locally without third-party font requests or runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  const externalFonts: string[] = [];
  const localFonts: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.hostname === "fonts.googleapis.com" ||
      url.hostname === "fonts.gstatic.com"
    )
      externalFonts.push(request.url());
  });
  page.on("response", (response) => {
    if (response.request().resourceType() === "font" && response.ok())
      localFonts.push(new URL(response.url()).pathname);
  });
  await page.goto("/");
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute(
    "href",
    "/preview/shared/mascot/assets/neri-idle.svg",
  );
  const loaded = await page.evaluate(async () => {
    const families = ["Fraunces", "Source Sans 3", "Noto Sans Ethiopic"];
    await Promise.all(
      families.map((family) =>
        document.fonts.load(
          `600 24px "${family}"`,
          family === "Noto Sans Ethiopic" ? "በቡቢባቤት" : "ÅÄÖåäö",
        ),
      ),
    );
    await document.fonts.ready;
    return families.map((family) =>
      [...document.fonts].some(
        (face) =>
          face.family.replaceAll('"', "") === family &&
          face.status === "loaded",
      ),
    );
  });
  expect(loaded).toEqual([true, true, true]);
  expect(localFonts).toEqual(
    expect.arrayContaining([
      "/fonts/fraunces-latin.woff2",
      "/fonts/source-sans-3-latin.woff2",
      "/fonts/noto-sans-ethiopic.woff2",
    ]),
  );
  expect(externalFonts).toEqual([]);
  expect(errors).toEqual([]);
});

test("the visual path links to preserved activities and leaves pending teaching content blocked", async ({
  page,
}, info) => {
  await page.goto("/learn");
  const path = page.getByRole("region", { name: "Tigrinya learning path" });
  await expect(path).toBeVisible();
  await expect(path.locator('.path-step[data-state="active"]')).toHaveCount(1);
  await expect(path.locator('.path-step[data-state="completed"]')).toHaveCount(
    0,
  );
  await expect(path.locator('.path-step[data-state="locked"]')).toHaveCount(2);
  await expect(path.locator('.path-step[data-state="locked"] a')).toHaveCount(
    0,
  );
  await expect(
    path.getByRole("link", { name: "Begin Fidäl preview", exact: false }),
  ).toHaveAttribute("href", "/preview/unit-01-fidel-foundations/index.html");
  await expect(
    path.getByRole("link", { name: "Follow the word path", exact: false }),
  ).toHaveAttribute("href", "/preview/unit-02-first-words/path.html");
  if (info.project.name === "phone") {
    const navigation = page.getByRole("navigation", {
      name: "Main navigation",
    });
    const rect = (await navigation.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(rect.y).toBeGreaterThan(viewport.height * 0.8);
    expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height + 1);
    await navigation.getByRole("link", { name: "Games", exact: true }).click();
    await expect(page).toHaveURL(/\/games$/);
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Learn", exact: true })
      .click();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.screenshot({
    path: info.outputPath("merged-learning-path.png"),
    fullPage: true,
  });
});
