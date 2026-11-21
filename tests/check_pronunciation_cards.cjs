const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict"),
  path = require("node:path");
const root = path.join(__dirname, ".."),
  ctx = vm.createContext({});
for (const f of [
  "unit-01-fidel-foundations/pronunciation-content.js",
  "unit-01-fidel-foundations/pronunciation-core.js",
])
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx);
const S = ctx.PronunciationCards,
  cards = ctx.PronunciationCardContent.cards,
  D = S.DAY,
  char = cards[0].character;
let count = 0;
function test(name, fn) {
  fn();
  count++;
  console.log("PASS: " + name);
}
function reflect(h, rating, t, sid = "session-" + t, extra = {}) {
  const recall = S.attempt(h, char, t);
  S.model(h, char, t + 1);
  return S.rate(h, char, rating, {
    time: t + 2,
    id: "event-" + t,
    sessionId: sid,
    ready: true,
    modelHeard: true,
    recall,
    ...extra,
  });
}
test("all 293 cards retain actual source family, order, form and pending audio", () => {
  S.validate(ctx.PronunciationCardContent);
  const inv = JSON.parse(
    fs.readFileSync(
      path.join(root, "shared/content-review/fidal-writing.json"),
    ),
  );
  const original = inv.families.flatMap((f) => f.forms);
  assert.equal(cards.length, 293);
  for (const c of cards) {
    const p = original.find((p) => p.character === c.character);
    assert(p);
    assert.equal(c.family, p.family);
    assert.equal(c.order, p.order);
    assert.equal(S.ready(c), false);
  }
  assert.throws(() => S.validate({}), /unavailable/);
  assert.throws(
    () => S.validate({ ...ctx.PronunciationCardContent, cards: [] }),
    /unavailable/,
  );
});
test("a model requires matching Tigrinya target, reviewed normal/slow audio, provenance and variety", () => {
  const review = {
    status: "approved",
    language: "ti",
    reviewer: "TEST FIXTURE ONLY",
    rights: "test fixture, not native evidence",
    reviewedAt: "2026-11-21",
    sourceUrl: "https://example.test/evidence",
    sourceLocator: "synthetic test fixture",
  };
  const c = {
    ...cards[0],
    target: {
      ...review,
      character: char,
      variety: "test-only",
      kind: "syllabic-form",
    },
    audio: {
      ...review,
      normal: "../shared/assets/test.wav",
      slow: "../shared/assets/test-slow.wav",
    },
  };
  assert(S.ready(c));
  for (const change of [
    { target: null },
    { target: { ...c.target, character: "ቡ" } },
    { target: { ...c.target, variety: "" } },
    { audio: { ...c.audio, language: "am" } },
    { audio: { ...c.audio, reviewer: "" } },
    { audio: { ...c.audio, slow: null } },
    { audio: { ...c.audio, normal: "https://example.test/a.wav" } },
    { audio: { ...c.audio, normal: "../shared/assets/../a.wav" } },
  ])
    assert.equal(S.ready({ ...c, ...change }), false);
  const sixth = {
    ...c,
    character: "ብ",
    order: 6,
    target: { ...c.target, character: "ብ" },
  };
  assert.equal(S.ready(sixth), false);
  assert(
    S.ready({
      ...sixth,
      target: { ...sixth.target, kind: "contextual-word", text: "ብ" },
    }),
  );
});
test("unheard or missing-model attempts cannot become pronunciation success", () => {
  const h = S.fresh();
  assert.equal(
    S.rate(h, char, "got", {
      time: D,
      id: "a",
      sessionId: "s",
      ready: false,
      modelHeard: false,
    }),
    null,
  );
  assert.equal(Object.keys(h.items).length, 0);
  assert(S.rate(h, char, "unscored", { time: D, id: "b", sessionId: "s" }));
  assert.equal(h.items[char].unscored, 1);
  assert.equal(h.items[char].got, 0);
  assert.equal(h.items[char].delayedSelfRatings, 0);
});
test("an unscored visit cannot skip the initial interval when a verified model arrives", () => {
  const h = S.fresh();
  S.rate(h, char, "unscored", { time: D, id: "no-model", sessionId: "old" });
  assert.equal(h.items[char].lastModel, 0);
  const r = reflect(h, "got", 10 * D);
  assert.equal(r.delayed, false);
  assert.equal(h.items[char].step, 0);
  assert.equal(h.items[char].due, 11 * D + 2);
  assert.equal(h.items[char].delayedSelfRatings, 0);
});
test("first reflection schedules tomorrow; later independent due sessions expand 3/7/14/30/60 days", () => {
  const h = S.fresh();
  let t = 10 * D;
  reflect(h, "got", t);
  assert.equal(h.items[char].step, 0);
  assert(h.items[char].due >= t + D);
  for (const days of [3, 7, 14, 30, 60]) {
    t = h.items[char].due + 5;
    const r = reflect(h, "got", t);
    assert(r.delayed);
    assert.equal(h.items[char].due, t + 2 + days * D);
  }
  assert.equal(h.items[char].delayedSelfRatings, 5);
});
test("same-day, same-session and supported retries do not inflate later-day reflection", () => {
  for (const kind of ["same-day", "same-session", "supported"]) {
    const h = S.fresh();
    reflect(h, "got", 10 * D, "same");
    const due = h.items[char].due,
      t = kind === "same-day" ? 10 * D + 1000 : due + D;
    reflect(h, "got", t, kind === "same-session" ? "same" : "new", {
      supported: kind === "supported",
    });
    assert.equal(h.items[char].step, 0);
    assert.equal(h.items[char].delayedSelfRatings, 0);
    assert.equal(h.items[char].due, due);
  }
});
test("hearing a model records exposure even without rating and prevents false delayed recall", () => {
  const h = S.fresh();
  S.model(h, char, 10 * D);
  assert.equal(h.items[char].attempts, 0);
  reflect(h, "got", 10 * D + 500);
  S.model(h, char, 12 * D);
  reflect(h, "got", 12 * D + 500);
  assert.equal(h.items[char].delayedSelfRatings, 0);
});
test("need/almost shorten calendar and card spacing without a punitive result", () => {
  for (const [r, delay, turns] of [
    ["need", 600000, 3],
    ["almost", D / 2, 5],
  ]) {
    const h = S.fresh();
    reflect(h, "got", D);
    reflect(h, "got", 3 * D);
    const t = 10 * D;
    reflect(h, r, t);
    assert.equal(h.items[char].step, 0);
    assert.equal(h.items[char].due, t + 2 + delay);
    assert.equal(h.items[char].nextTurn, turns);
  }
});
test("supported revisits require intervening cards and remain bounded", () => {
  for (const [rating, gap] of [
    ["need", 2],
    ["almost", 3],
  ]) {
    const queue = cards
      .slice(0, 5)
      .map((c) => ({ character: c.character, supported: false }));
    assert(S.revisit(queue, 0, rating, 0));
    assert.equal(queue[gap + 1].character, queue[0].character);
    assert(queue[gap + 1].supported);
    assert.equal(S.revisit(queue, gap + 1, rating, 1), false);
    assert.equal(S.revisit(queue, 0, rating, 2), false);
    assert.equal(S.revisit(queue, queue.length - 1, rating, 0), false);
  }
});
test("selection prioritises due forms, limits five unique cards, interleaves source families and avoids the last card", () => {
  const h = S.fresh(),
    last = cards[0].character;
  h.lastCharacter = last;
  reflect(h, "need", D);
  const p = S.plan(cards, h, 10 * D);
  assert.equal(p.length, 5);
  assert.equal(new Set(p.map((q) => q.character)).size, 5);
  assert.notEqual(p[0].character, last);
  assert(p.some((q) => q.character === last));
  assert.equal(S.plan([], h, D).length, 0);
  for (const q of S.plan(cards, h, D, "በ"))
    assert.equal(cards.find((c) => c.character === q.character).family, "በ");
});
test("idempotency, clock rollback and malformed saved records preserve honest bounded evidence", () => {
  const h = S.fresh();
  reflect(h, "got", D);
  const snap = JSON.stringify(h);
  assert.equal(
    S.rate(h, char, "got", {
      time: 0,
      id: "new",
      sessionId: "new",
      ready: true,
      modelHeard: true,
    }),
    null,
  );
  assert.equal(
    S.rate(h, char, "got", {
      time: 2 * D,
      id: "event-" + D,
      sessionId: "new",
      ready: true,
      modelHeard: true,
    }),
    null,
  );
  assert.equal(JSON.stringify(h), snap);
  for (let n = 1; n < 60; n++) reflect(h, "almost", D + n * 1000);
  assert.equal(h.items[char].recent.length, 12);
  assert.equal(h.items[char].events.length, 32);
  const restored = S.restore(JSON.parse(JSON.stringify(h)), cards);
  assert.equal(JSON.stringify(restored.items), JSON.stringify(h.items));
  const bad = JSON.parse(JSON.stringify(h));
  bad.items[char].due = "invalid";
  assert.equal(Object.keys(S.restore(bad, cards).items).length, 0);
});
test("quick reopening keeps the session; meaningful idle creates another session", () => {
  const h = S.fresh();
  assert.equal(S.session(h, D, "one"), "one");
  assert.equal(S.session(h, D + 500, "two"), "one");
  assert.equal(S.session(h, 2 * D, "three"), "three");
});
test("existing opt-in profile preserves visual checks and other keys, excludes all voice data and survives reopening", () => {
  const key = "tigrinya.practice.v1",
    writes = [],
    values = new Map([["unrelated", "keep"]]);
  function harness() {
    const storage = {
      getItem: (k) => values.get(k),
      setItem(k, v) {
        values.set(k, v);
        writes.push(k);
      },
      removeItem: (k) => values.delete(k),
    };
    const ctx = vm.createContext({ localStorage: storage });
    vm.runInContext(
      fs.readFileSync(path.join(root, "shared/learning-path.js"), "utf8"),
      ctx,
    );
    return ctx.LearningPath;
  }
  const app = harness();
  app.record("shapes", [{ id: "በ-0", helped: false }], D);
  app.cardPractice.write(S.fresh());
  assert.equal(writes.length, 0);
  const h = S.fresh();
  reflect(h, "need", D);
  app.cardPractice.write(h);
  assert(app.cardPractice.setSaving(true));
  const next = harness();
  assert.equal(next.cardPractice.read().items[char].need, 1);
  assert.equal(next.due("shapes", 3 * D)[0], "በ-0");
  const copy = next.cardPractice.read();
  copy.items = {};
  assert(next.cardPractice.read().items[char]);
  assert.equal(values.get("unrelated"), "keep");
  assert(!/blob:|voiceUrl|audio\/webm/.test(values.get(key)));
});
console.log(
  `${count} pronunciation card source, scheduling, privacy and compatibility groups passed.`,
);
