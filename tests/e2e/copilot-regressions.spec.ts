import { test, expect } from "@playwright/test";

test("a standalone published question exposes usable answer controls", async ({ page }) => {
  const id = "10000000-0000-0000-0000-000000000001";
  await page.route(`**/api/content/${id}`, (route) => route.fulfill({
    json: {
      id,
      languageTag: "en",
      kind: "Question",
      revision: 1,
      title: "Synthetic browser-test question",
      state: "Published",
      concurrencyStamp: "test-only",
      payload: {
        targetId: "20000000-0000-0000-0000-000000000001",
        prompt: "Test-only prompt",
        options: ["alpha", "beta"],
        skill: "Reading",
      },
    },
  }));
  await page.goto(`/learn/${id}`);
  await expect(page.getByRole("button", { name: "Check", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "alpha", exact: true }).click();
  await expect(page.getByRole("button", { name: "Check", exact: true })).toBeEnabled();
});

test("settings warn when an automatic save fails after opt-in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Save preferences on this device" }).click();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "polyglot.preferences.v1")
        throw new DOMException("Synthetic test storage failure", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.getByLabel("Time available").selectOption("3");
  await expect(page.getByRole("dialog").getByRole("status")).toContainText(/could not be saved|Saving is unavailable/i);
  await expect(page.getByLabel("Time available")).toHaveValue("3");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("polyglot.preferences.v1")!).minutes)).toBe(5);
});
