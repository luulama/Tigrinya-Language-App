/* Read-only preview must guard actual writers, not just hide Save buttons. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const data = JSON.parse(
  fs.readFileSync(path.join(root, "unit-02-first-words/path-curriculum.json")),
);
const preview = { readOnly: true, enabled: true };
const writes = [];
const saved = JSON.stringify({
  version: 1,
  save: true,
  mode: "child",
  minutes: 5,
  items: {},
  families: {},
});
const context = vm.createContext({
  console,
  Date,
  Math,
  Map,
  Set,
  crypto: require("node:crypto").webcrypto,
  DeveloperPreview: preview,
  localStorage: {
    getItem: () => saved,
    setItem: (...args) => writes.push(args),
    removeItem: (...args) => writes.push(args),
  },
});
for (const file of [
  "shared/learning-path.js",
  "unit-02-first-words/src/path-core.js",
  "unit-02-first-words/src/path-srs.js",
])
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
const h = context.WordPath.fresh(),
  before = JSON.stringify(h),
  lesson = data.lessons[0],
  word = data.words[0];
context.WordPath.complete(data, h, lesson.id, false);
context.WordPath.review(h, [word.id], []);
context.WordPath.expose(h, [word.id]);
context.PathSRS.open(data, h);
const ctx = context.PathSRS.context(h, lesson.id);
context.PathSRS.teach(data, h, word, ctx);
context.PathSRS.form(h, word, word.letters[0], ctx, true);
context.PathSRS.itemFor(h, word, "choose", ctx);
context.PathSRS.answer(h, "unknown", {
  ...ctx,
  id: "fixture",
  outcome: "correct",
});
context.PathSRS.advance(h);
context.PathSRS.defer(h, "unknown", ctx);
assert.equal(
  JSON.stringify(h),
  before,
  "preview wrote lesson, review, SRS or session state",
);
context.LearningPath.record("shapes", [{ id: "fixture", helped: false }]);
context.LearningPath.saveFamily("fixture", {
  total: 1,
  withHelp: 0,
  withoutHelp: 1,
});
context.LearningPath.cardPractice.write({ fixture: true });
context.LearningPath.cardPractice.setSaving(false);
assert.equal(Object.keys(context.LearningPath.families).length, 0);
assert.equal(context.LearningPath.cardPractice.read(), null);
assert.equal(context.LearningPath.saving, true);
assert.equal(writes.length, 0, "preview wrote or removed saved learner data");
console.log(
  "PASS: lesson, review, SRS/session, family and pronunciation writers are inert in preview",
);
preview.enabled = false; // The exit transition remains read-only until views are restored.
context.PathSRS.context(h, lesson.id);
context.WordPath.complete(data, h, lesson.id, false);
assert.equal(JSON.stringify(h), before);
preview.readOnly = false;
context.WordPath.complete(data, h, lesson.id, false);
assert.equal(h.lessons[lesson.id].passed, true);
assert.equal(context.WordPath.status(data.lessons[1], h), "ready");
context.LearningPath.record("shapes", [{ id: "fixture", helped: false }]);
assert.equal(writes.length, 1);
console.log(
  "PASS: exit restoration is read-only; normal completion and saving work again afterward",
);
