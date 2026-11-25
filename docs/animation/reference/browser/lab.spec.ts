import { test, expect } from "@playwright/test";

test("all ten pose studies stay readable and Next remains available", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  for (const pose of [
    "idle",
    "walking",
    "talking",
    "listening",
    "thinking",
    "teaching",
    "celebrating",
    "encouraging",
    "waiting",
    "sleeping",
  ]) {
    await page.getByRole("button", { name: pose, exact: true }).click();
    await expect(page.getByTestId("pose")).toHaveText(pose);
    await expect(
      page.getByRole("button", { name: "Next step", exact: true }),
    ).toBeEnabled();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await page.getByRole("button", { name: "idle", exact: true }).click();
  await page.screenshot({
    path: info.outputPath("lab-layout.png"),
    fullPage: true,
  });
});

test("duplicate event and unavailable audio cannot create extra progress or speech", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Confirm practice", exact: true })
    .click();
  await expect(page.getByTestId("sequence")).toHaveText("1");
  await page
    .getByRole("button", { name: "Replay same event", exact: true })
    .click();
  await expect(page.getByTestId("sequence")).toHaveText("1");
  await page
    .getByRole("button", { name: "Check missing audio", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "No approved media connected",
  );
  await expect(page.getByTestId("pose")).toHaveText("teaching");
  expect(await page.locator("audio,video,canvas").count()).toBe(0);
});

test("live reduced motion and quiet mode preserve keyboard next action", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("button", { name: "celebrating", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("main")).toHaveAttribute("data-reduced", "true");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === "running")
            .length,
      ),
    )
    .toBe(0);
  await page.getByRole("button", { name: "Quiet view", exact: true }).click();
  await expect(page.locator(".mele-art")).toBeHidden();
  await expect(page.getByRole("status")).toBeVisible();
  const next = page.getByRole("button", { name: "Next step", exact: true });
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Next action available");
});

test("failed artwork and loaded-page offline use preserve controls", async ({
  page,
  context,
}) => {
  await page.route("**/*", (route) =>
    route.request().resourceType() === "image"
      ? route.abort()
      : route.continue(),
  );
  await page.goto("/");
  await expect(page.locator(".mele-poster-fallback")).toBeVisible();
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "Confirm practice", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("No score was awarded");
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Next action available");
});

test("scene replacement stops old visual playback", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Confirm practice", exact: true })
    .click();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(page.getByTestId("pose")).toHaveText("idle");
  await expect(page.getByTestId("sequence")).toHaveText("0");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === "running")
            .length,
      ),
    )
    .toBe(0);
});

test("hidden-page lifecycle returns still without replaying a pose preview", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "celebrating", exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.getByTestId("pose")).toHaveText("idle");
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.getByTestId("pose")).toHaveText("idle");
});

test("collect local reference-frame diagnostics without a device FPS claim", async ({
  page,
}, info) => {
  await page.goto("/");
  const metrics = await page.evaluate(
    () =>
      new Promise<{
        count: number;
        medianMs: number;
        p95Ms: number;
        maxMs: number;
      }>((resolve) => {
        const samples: number[] = [];
        let previous = performance.now();
        const button = Array.from(document.querySelectorAll("button")).find(
          (node) => node.textContent === "Confirm practice",
        );
        button?.click();
        const exercise = setInterval(() => button?.click(), 400);
        const tick = (now: number) => {
          samples.push(now - previous);
          previous = now;
          if (samples.length < 120) requestAnimationFrame(tick);
          else {
            clearInterval(exercise);
            samples.sort((a, b) => a - b);
            resolve({
              count: samples.length,
              medianMs: samples[60],
              p95Ms: samples[114],
              maxMs: samples[119],
            });
          }
        };
        requestAnimationFrame(tick);
      }),
  );
  expect(metrics.count).toBe(120);
  expect(Number.isFinite(metrics.p95Ms)).toBe(true);
  console.log(
    `${info.project.name}: reference-only RAF ${JSON.stringify(metrics)}`,
  );
  await info.attach("reference-frame-diagnostics", {
    body: JSON.stringify(metrics),
    contentType: "application/json",
  });
  const diagnostics = await page.evaluate(async () => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (node) => node.textContent === "Confirm practice",
    )!;
    const latencies: number[] = [];
    for (let i = 0; i < 12; i++) {
      const start = performance.now();
      button.click();
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      latencies.push(performance.now() - start);
    }
    latencies.sort((a, b) => a - b);
    const resources = performance.getEntriesByType("resource").map((entry) => {
      const r = entry as PerformanceResourceTiming;
      return {
        file: new URL(r.name).pathname.split("/").pop(),
        durationMs: r.duration,
        transferBytes: r.transferSize,
      };
    });
    return {
      syntheticClickToSecondRaf: {
        count: 12,
        medianMs: latencies[6],
        p95Ms: latencies[11],
      },
      resources,
    };
  });
  expect(diagnostics.syntheticClickToSecondRaf.count).toBe(12);
  console.log(
    `${info.project.name}: synthetic click-to-second-RAF ${JSON.stringify(diagnostics.syntheticClickToSecondRaf)}`,
  );
  await info.attach("reference-resource-and-latency-diagnostics", {
    body: JSON.stringify(diagnostics),
    contentType: "application/json",
  });
});
