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
