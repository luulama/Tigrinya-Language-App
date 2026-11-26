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
