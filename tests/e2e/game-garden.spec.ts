import { test, expect, type Page } from "@playwright/test";

const units = [
  [
    "lantern",
    "baskets",
    "bridge",
    "twins",
    "mosaic",
    "stones",
    "loom",
    "ink",
    "detective",
    "spotlight",
  ],
  [
    "post",
    "forge",
    "market",
    "lenses",
    "repair",
    "windows",
    "domino",
    "notebook",
    "shared",
    "recall",
  ],
];
const press = (page: Page, action: string, value?: string | number) =>
  page
    .locator(
      `button[data-action="${action}"]${value === undefined ? "" : `[data-value=${JSON.stringify(String(value))}]`}`,
    )
    .first()
    .click();
async function puzzle(page: Page, id: string, variation = 0): Promise<any> {
  return page.evaluate(
    ({ id, variation }) => {
      const w = window as any;
      return w.GameGarden.build(
        id,
        w.GameGarden.content(w.FidalContent, w.GardenWords),
        variation,
      );
    },
    { id, variation },
  );
}
async function begin(page: Page, unit: number, id: string) {
  await page.goto(`/preview/games/index.html?unit=${unit}&game=${id}`);
  const p = await puzzle(page, id);
  await expect(
    page.getByRole("heading", { name: p.game.name, exact: true }),
  ).toBeVisible();
  await expect(page.locator(".model-card").first()).toBeVisible();
  await press(page, "play");
  return p;
}
async function solve(page: Page, id: string, p: any) {
  if (
    ["lantern", "baskets", "bridge", "loom", "detective", "repair"].includes(id)
  ) {
    for (let i = 0; i < p.rounds.length; i++) {
      const r = p.rounds[i];
      await press(
        page,
        "answer",
        id === "baskets"
          ? r.answer
          : id === "repair"
            ? r.letters[i % 2]
            : r.target,
      );
      await expect(page.getByRole("status")).toContainText(/Yes|belongs/);
      await press(page, "continue");
    }
  } else if (id === "twins") {
    for (const pair of [
      [0, 4],
      [1, 3],
      [2, 5],
    ])
      for (const n of pair) await press(page, "flip", n);
    await press(page, "continue");
  } else if (id === "mosaic") {
    for (let i = 0; i < 4; i++) await press(page, "piece", i);
    await press(page, "continue");
  } else if (id === "stones") {
    for (const n of p.path) await press(page, "stone", n);
    await press(page, "continue");
  } else if (id === "ink") {
    for (let i = 0; i < 2; i++) {
      await page.locator("#inkPad").scrollIntoViewIfNeeded();
      const box = await page.locator("#inkPad").boundingBox();
      await page.mouse.move(
        box!.x + box!.width * 0.3,
        box!.y + box!.height * 0.3,
      );
      await page.mouse.down();
      await page.mouse.move(
        box!.x + box!.width * 0.7,
        box!.y + box!.height * 0.7,
      );
      await page.mouse.up();
      await press(page, "compare");
      await expect(page.getByRole("status")).toContainText("No accuracy score");
      await press(page, "continue");
    }
  } else if (id === "spotlight") {
    for (const r of p.rounds) {
      await press(page, "spot", Array.from(r.word).indexOf(r.target));
      await press(page, "continue");
    }
  } else if (id === "post") {
    for (const w of p.words) {
      await press(page, "label", w.id);
      await press(page, "deliver", w.id);
    }
    await press(page, "continue");
  } else if (id === "forge") {
    for (const r of p.rounds) {
      for (const f of r.letters) await press(page, "forge", f);
      await press(page, "continue");
    }
  } else if (id === "market") {
    for (const r of p.rounds) {
      for (const w of r.list) await press(page, "shop", w.id);
      await press(page, "checkout");
      await press(page, "continue");
    }
  } else if (id === "lenses") {
    for (const r of p.rounds) {
      await press(page, "position", r.position);
      await press(page, "continue");
    }
  } else if (id === "windows") {
    for (const r of p.rounds) {
      for (const cell of r.positions) await press(page, "window", cell);
      await press(page, "continue");
    }
  } else if (id === "domino") {
    for (let i = 0; i < 3; i++) await press(page, "domino", i);
    await press(page, "continue");
  } else if (id === "notebook") {
    for (let i = 0; i < p.rounds.length; i++) {
      if (i === 0) await page.locator("#wordEntry").fill(p.rounds[i].target);
      else for (const f of p.rounds[i].letters) await press(page, "key", f);
      await press(page, "write-check");
      await press(page, "continue");
    }
  } else if (id === "shared") {
    for (const r of p.rounds) {
      await press(page, "shared", `0:${r.left.letters.indexOf(r.target)}`);
      await press(page, "shared", `1:${r.right.letters.indexOf(r.target)}`);
      await press(page, "continue");
    }
  } else if (id === "recall") {
    for (let i = 0; i < 3; i++) {
      await press(page, "reveal");
      await press(page, "remember");
    }
    await press(page, "continue");
  }
  await expect(
    page.getByRole("heading", { name: "A little more familiar." }),
  ).toBeVisible();
}
async function wrongMove(page: Page, id: string, p: any) {
  const r = p.rounds[0];
  switch (id) {
    case "lantern":
    case "detective":
    case "loom":
      await press(
        page,
        "answer",
        id === "loom"
          ? p.other[0]
          : r.choices.find((f: string) => f !== r.target),
      );
      break;
    case "baskets":
      await press(
        page,
        "answer",
        r.answer === p.family ? p.otherFamily : p.family,
      );
      break;
    case "bridge":
      await press(page, "answer", p.forms[1]);
      break;
    case "repair":
      await press(
        page,
        "answer",
        r.choices.find((f: string) => f !== r.letters[0]),
      );
      break;
    case "twins":
      await press(page, "flip", 0);
      await press(page, "flip", 1);
      break;
    case "mosaic":
      await press(page, "piece", 2);
      break;
    case "stones":
      await press(page, "stone", 8);
      break;
    case "ink": {
      await expect(page.locator('[data-action="compare"]')).toBeDisabled();
      await press(page, "dot", 0);
      await expect(
        page.getByRole("button", { name: "Dot 1", exact: true }),
      ).toBeVisible();
      await press(page, "dot", 1);
      await expect(page.locator("#inkPad polyline")).toHaveCount(1);
      await expect(page.locator("#inkPad polyline")).toHaveAttribute(
        "points",
        /150,50/,
      );
      await press(page, "clear-ink");
      await expect(page.locator('[data-action="compare"]')).toBeDisabled();
      await page.getByRole("button", { name: "Dot 5", exact: true }).focus();
      await page.keyboard.press("Space");
      await press(page, "compare");
      await expect(page.getByRole("status")).toContainText("No accuracy score");
      return;
    }
    case "spotlight":
      await press(
        page,
        "spot",
        Array.from(r.word).findIndex((f) => f !== r.target),
      );
      break;
    case "post":
      await press(page, "deliver", p.words[0].id);
      await expect(page.getByRole("status")).toContainText(
        "Choose a word label first",
      );
      await press(page, "label", p.words[0].id);
      await press(page, "deliver", p.words[1].id);
      break;
    case "forge":
      await press(
        page,
        "forge",
        r.choices.find((f: string) => f !== r.letters[0]),
      );
      break;
    case "market":
      await press(page, "checkout");
      break;
    case "lenses":
      await press(page, "position", 1 - r.position);
      break;
    case "windows":
      await press(page, "window", 0);
      break;
    case "domino":
      await press(page, "domino", 2);
      break;
    case "notebook": {
      await page.locator("#wordEntry").fill("not Fidäl");
      await press(page, "write-check");
      await expect(page.getByRole("status")).toContainText("Compare");
      await page.locator("#wordEntry").fill(r.target);
      await page.locator("#wordEntry").dispatchEvent("compositionstart");
      await press(page, "write-check");
      await expect(page.getByRole("status")).toContainText("Finish entering");
      await page.locator("#wordEntry").dispatchEvent("compositionend");
      return;
    }
    case "shared":
      await press(
        page,
        "shared",
        `0:${r.left.letters.findIndex((f: string) => f !== r.target)}`,
      );
      break;
    case "recall": {
      await expect(page.locator('[data-action="remember"]')).toHaveCount(0);
      await press(page, "reveal");
      await press(page, "again");
      await expect(page.getByRole("status")).toContainText("return once more");
      for (let i = 0; i < 3; i++) {
        await press(page, "reveal");
        await press(page, "again");
      }
      // Each requested card returns at most once, so another three supported revisits finish.
      for (let i = 0; i < 2; i++) {
        await press(page, "reveal");
        await press(page, "again");
      }
      await expect(page.getByRole("status")).toContainText("own recall check");
      return;
    }
  }
  await expect(page.getByRole("status")).toContainText(
    /Look|Find|Compare|Different|Connect|Next|First|list|goes with/i,
  );
  await expect(page.locator('[data-action="continue"]')).toHaveCount(0);
}

for (const [u, games] of units.entries())
  for (const id of games) {
    const unit = u + 1;
    test(`${unit}/${id} · functional: play, feedback, completion and replay`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      const p = await begin(page, unit, id);
      await solve(page, id, p);
      await press(page, "replay");
      await expect(page.locator(".model-card").first()).toBeVisible();
      await press(page, "play");
      await expect(page.locator(".activity")).toBeVisible();
      await expect(page.getByRole("progressbar")).toHaveAttribute("value", "0");
      expect(errors).toEqual([]);
    });
    test(`${unit}/${id} · edge: correction, repeated attempts and missing source`, async ({
      page,
    }) => {
      const p = await begin(page, unit, id);
      await wrongMove(page, id, p);
      if (!["ink", "recall", "twins", "notebook", "post"].includes(id))
        await wrongMove(page, id, p);
      if (id === "twins") {
        await press(page, "flip", 2);
        await expect(page.getByRole("status")).toContainText(
          "Turn these two cards back",
        );
        await press(page, "turn-back");
      }
      // Re-entering the game resets only this game's in-memory attempt.
      await page.reload();
      await press(page, "play");
      await solve(page, id, p);
      await page.route(
        `**/shared/${unit === 1 ? "fidal-content" : "game-content"}.js`,
        (route) =>
          route.fulfill({
            contentType: "application/javascript",
            body:
              unit === 1
                ? "globalThis.FidalContent={families:[]};"
                : "globalThis.GardenWords={words:[]};",
          }),
      );
      await page.goto(`/preview/games/index.html?unit=${unit}&game=${id}`);
      await expect(page.getByRole("alert")).toContainText(/source|families/);
      await expect(
        page.getByRole("button", { name: "Try loading again" }),
      ).toBeVisible();
      await page.unrouteAll();
      await page.getByRole("button", { name: "Try loading again" }).click();
      await expect(
        page.getByRole("heading", { name: p.game.name, exact: true }),
      ).toBeVisible();
    });
    test(`${unit}/${id} · integration: unit launch, layout, keyboard and return`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(
        `/preview/${unit === 1 ? "unit-01-fidel-foundations" : "unit-02-first-words"}/index.html`,
      );
      await page
        .getByRole("link", {
          name:
            unit === 1
              ? "Game Garden · 10 Fidäl games →"
              : "Game Garden · 10 word games →",
        })
        .click();
      await expect(page.locator(".game-card")).toHaveCount(10);
      await page.locator(`[data-game="${id}"]`).click();
      await expect(page.locator(".eyebrow")).toHaveCount(0);
      await page.locator('[data-action="play"]').focus();
      await page.keyboard.press("Enter");
      await expect(page.locator(".activity")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const targets = await page
        .locator(".activity button")
        .evaluateAll((buttons) =>
          buttons.map((b) => {
            const box = b.getBoundingClientRect();
            return { width: box.width, height: box.height };
          }),
        );
      expect(targets.every((t) => t.width >= 44 && t.height >= 44)).toBe(true);
      await press(page, "model");
      await expect(page.locator("#modelPanel")).toBeVisible();
      const script = page.locator('[lang="ti"]').first();
      await expect(script).toBeVisible();
      await expect(script).toHaveAttribute("dir", "ltr");
      await press(page, "garden");
      await expect(page.locator(".game-card")).toHaveCount(10);
      await page.locator("#unitLink").click();
      await expect(page).toHaveURL(
        new RegExp(
          unit === 1 ? "unit-01-fidel-foundations" : "unit-02-first-words",
        ),
      );
    });
  }
test("main app navigation reaches both game collections", async ({ page }) => {
  await page.goto("/learn");
  await page.getByRole("link", { name: "Games", exact: true }).click();
  await page.getByRole("link", { name: "Explore Fidäl games →" }).click();
  await expect(page.locator(".game-card")).toHaveCount(10);
  await page.goto("/games");
  await page.getByRole("link", { name: "Explore word games →" }).click();
  await expect(page).toHaveURL(/unit=2/);
  await expect(page.locator(".game-card")).toHaveCount(10);
});
test("missing runtime file and unknown game have recoverable error states", async ({
  page,
}) => {
  await page.route("**/shared/game-content.js", (route) => route.abort());
  await page.goto("/preview/games/index.html?unit=2&game=post");
  await expect(page.getByRole("alert")).toContainText("did not load");
  await page.unrouteAll();
  await press(page, "reload");
  await expect(page.locator('[data-action="play"]')).toBeVisible();
  await page.goto("/preview/games/index.html?unit=1&game=unknown");
  await expect(page.getByRole("alert")).toContainText("could not be found");
});
