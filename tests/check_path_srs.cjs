const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  path = require("node:path");
const root = path.join(__dirname, ".."),
  c = vm.createContext({});
for (const f of ["path-content.js", "src/path-core.js", "src/path-srs.js"])
  vm.runInContext(
    fs.readFileSync(path.join(root, "unit-02-first-words", f), "utf8"),
    c,
  );
const S = c.PathSRS,
  W = c.WordPath,
  C = c.WordPathContent,
  B = 1700000000000,
  D = S.DAY;
let n = 0,
  event = 0;
function test(name, fn) {
  fn();
  n++;
  console.log("PASS: " + name);
}
const ctx = (
  at = B,
  serial = 0,
  lesson = "u2-01",
  session = "one",
  prompt = 0,
) => ({ at, serial, lesson, session, prompt });
function fixture() {
  const h = W.fresh();
  S.open(C, h, B);
  for (const w of C.words.slice(0, 3)) S.teach(C, h, w, ctx());
  W.complete(C, h, "u2-01", false, B);
  return h;
}
function answer(
  h,
  id,
  context,
  outcome = "correct",
  supported = false,
  idempotency,
) {
  return S.answer(h, id, {
    ...context,
    id: idempotency || "event-" + ++event,
    outcome,
    supported,
    kind: "choose",
  });
}
function passed(h, count) {
  for (const l of C.lessons.filter((l) => l.available).slice(0, count))
    h.lessons[l.id] = { passed: true, practised: true, at: B };
}
test("introduction schedules a word/skill for tomorrow and two later path positions", () => {
  const h = fixture(),
    i = h.srs.items[S.key(C.words[0].id, "recognition")];
  assert.equal(i.dueAt, B + D);
  assert.equal(i.dueLesson, 2);
  assert.equal(i.correct, 0);
  assert.equal(i.sessions.length, 0);
});
test("elapsed independent successes across sessions expand 3/7/14/30/60-day intervals", () => {
  const h = fixture(),
    id = S.key(C.words[0].id, "recognition");
  let at = B;
  for (let step = 1; step <= 5; step++) {
    at = h.srs.items[id].dueAt;
    answer(
      h,
      id,
      ctx(at, step * 2, "lesson-" + step, "session-" + step, step * 10),
    );
    assert.equal(h.srs.items[id].step, step);
    assert.equal(h.srs.items[id].dueAt, at + S.intervals[step] * D);
    assert.equal(h.srs.items[id].sessions.length, step);
  }
});
test("same-session/same-day repeats and models cannot inflate delayed recall", () => {
  const h = fixture(),
    w = C.words[0],
    id = S.key(w.id, "recognition");
  answer(h, id, ctx(B + 100, 2, "later", "one", 10));
  assert.equal(h.srs.items[id].step, 0);
  S.teach(C, h, w, ctx(B + D, 2, "model", "two", 11));
  answer(h, id, ctx(B + D + 100, 2, "test", "two", 12));
  assert.equal(h.srs.items[id].sessions.length, 0);
});
test("wrong answers and repeated hints reset spacing and preserve bounded recent history", () => {
  const h = fixture(),
    id = S.key(C.words[0].id, "recognition");
  answer(h, id, ctx(B + D, 3, "later", "two", 30));
  const long = h.srs.items[id].dueAt;
  answer(h, id, ctx(B + D + 10, 3, "later", "two", 31), "incorrect");
  answer(h, id, ctx(B + D + 20, 3, "later", "two", 31), "hint");
  answer(h, id, ctx(B + D + 30, 3, "later", "two", 31), "hint");
  const i = h.srs.items[id];
  assert.equal(i.step, 0);
  assert(i.dueAt < long);
  assert.equal(i.incorrect, 1);
  assert.equal(i.hints, 2);
  assert.equal(i.weak, true);
  for (let x = 0; x < 20; x++)
    answer(h, id, ctx(B + D + 100 + x, 3, "later", "two", 31), "hint");
  assert.equal(i.recent.length, 12);
  assert(i.events.length <= 32);
});
test("old words return after a real lesson/prompt gap and never in every consecutive lesson", () => {
  const h = fixture();
  h.srs.prompt = 20;
  passed(h, 1);
  assert.equal(S.plan(C, h, { lesson: "u2-02", at: B + 200 }).length, 0);
  passed(h, 3);
  const plan = S.plan(C, h, { lesson: "u2-04", at: B + 1000 });
  assert.equal(plan.length, 2);
  assert(
    plan.every((x) => C.words.slice(0, 3).some((w) => w.id === x.word.id)),
  );
  for (const p of plan) answer(h, p.id, ctx(B + 1001, 3, "u2-04", "one", 21));
  passed(h, 4);
  assert(
    !S.plan(C, h, { lesson: "u2-05", at: B + 2000 }).some((x) =>
      plan.some((p) => p.word.id === x.word.id),
    ),
  );
});
test("time works after a long break even with no new lesson advancement; review budgets remain bounded", () => {
  const h = fixture();
  assert.equal(
    S.plan(C, h, { lesson: "return", at: B + 60 * D, limit: 2 }).length,
    2,
  );
  const plan = S.plan(C, h, { lesson: "return", at: B + 60 * D, limit: 2 });
  assert.equal(new Set(plan.map((x) => x.word.id)).size, 2);
});
test("model and feedback exposure protect other modalities without transferring success counts", () => {
  const h = fixture(),
    w = C.words[0],
    recognition = S.key(w.id, "recognition"),
    reading = S.key(w.id, "reading");
  answer(h, reading, ctx(B + D, 2, "new", "two", 20));
  assert.equal(h.srs.items[reading].sessions.length, 1);
  assert.equal(h.srs.items[recognition].sessions.length, 0);
  answer(h, recognition, ctx(B + D + 10, 2, "new", "two", 21));
  assert.equal(h.srs.items[recognition].sessions.length, 0);
});
test("idempotency and clock rollback do not create extra outcomes", () => {
  const h = fixture(),
    id = S.key(C.words[0].id, "recognition"),
    context = ctx(B + D, 2, "late", "two", 10);
  assert(answer(h, id, context, "correct", false, "stable"));
  assert.equal(answer(h, id, context, "correct", false, "stable"), false);
  assert.equal(h.srs.items[id].correct, 1);
  const before = JSON.stringify(h.srs.items[id]);
  assert.equal(answer(h, id, ctx(B, 2, "old", "one", 10)), false);
  assert.equal(JSON.stringify(h.srs.items[id]), before);
});
test("saved local progress round-trips rich history; legacy records migrate without fake successes", () => {
  const h = fixture();
  h.save = true;
  const id = S.key(C.words[0].id, "recognition");
  answer(h, id, ctx(B + D, 2, "late", "two", 10));
  const saved = JSON.parse(
    JSON.stringify({ ...h, contentVersion: C.contentVersion }),
  );
  const restored = W.restore(saved, C);
  assert.equal(restored.srs.items[id].sessions.length, 1);
  assert.equal(restored.lessons["u2-01"].passed, true);
  delete saved.srs;
  const legacy = W.restore(saved, C);
  S.open(C, legacy, B + 2 * D);
  assert.equal(legacy.srs.items[id].correct, 0);
  assert.equal(legacy.lessons["u2-01"].passed, true);
  const malformed = JSON.parse(JSON.stringify(h.srs));
  malformed.items[id].step = 900;
  assert(!S.restore(malformed, C).items[id]);
});
test("new lesson focus excludes the immediately previous familiar word; skills require actual content", () => {
  const l = C.lessons.find((l) => l.id === "u2-03"),
    ids = S.focus(C, l);
  assert.equal(ids.length, 2);
  assert(!ids.includes(C.words[2].id));
  const h = fixture();
  assert(
    !Object.values(h.srs.items).some((i) =>
      ["entry", "sound", "sentence"].includes(i.skill),
    ),
  );
  passed(h, 27);
  for (const l of C.lessons.filter((l) => !l.available))
    assert.equal(W.status(l, h), "content");
});
test("a form item uses an existing character in an existing word, with no invented audio/phonetics", () => {
  const h = fixture(),
    w = C.words[0],
    id = S.form(h, w, w.letters[0], ctx(), true);
  assert(id);
  assert.equal(S.form(h, w, "A", ctx(), true), null);
  assert.equal(h.srs.items[id].kind, "form");
  const cat = C.words.find((w) => w.word === "ድሙ"),
    banana = C.words.find((w) => w.word === "ሙዝ");
  const shared = S.form(h, cat, "ሙ", ctx(), true);
  S.teach(C, h, banana, ctx(B + D, 2, "another-model", "two", 10));
  assert.equal(h.srs.items[shared].lastExposureAt, B + D);
});
test("many later lessons keep review scarce and distribute source words", () => {
  const h = fixture(),
    seen = new Set();
  for (let i = 3; i < 23; i++) {
    passed(h, i);
    h.srs.prompt = i * 10;
    const plan = S.plan(C, h, { lesson: "pass-" + i, at: B + i * 1000 });
    assert(plan.length <= 2);
    for (const p of plan) {
      seen.add(p.word.id);
      answer(h, p.id, ctx(B + i * 1000, i, "pass-" + i, "one", i * 10));
    }
  }
  assert.equal(seen.size, 3);
});
test("the earlier path format migrates without resetting passed lessons", () => {
  const h = W.fresh();
  W.complete(C, h, "u2-01", false, B);
  const restored = W.restore(
    { ...h, save: true, contentVersion: C.compatibleProgressVersions[0] },
    C,
  );
  assert.equal(restored.lessons["u2-01"].passed, true);
  assert.equal(Object.keys(restored.review).length, 3);
  const future = W.restore(
    {
      ...h,
      save: true,
      contentVersion: "earlier-policy",
      materialVersion: C.materialVersion,
    },
    C,
  );
  assert.equal(future.lessons["u2-01"].passed, true);
});
console.log(
  `${n} spaced-repetition scheduling, migration, isolation and distribution checks passed.`,
);
