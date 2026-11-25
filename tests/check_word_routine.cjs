const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const data = JSON.parse(
  fs.readFileSync(path.join(root, "unit-02-first-words/path-curriculum.json")),
);
const ctx = vm.createContext({});
for (const f of [
  "shared/fidal-text.js",
  "unit-02-first-words/src/path-srs.js",
  "unit-02-first-words/src/word-routine.js",
])
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx);
const R = ctx.WordRoutine,
  lesson = data.lessons[0],
  words = lesson.wordIds.map((id) => data.words.find((w) => w.id === id));
let count = 0;
function test(name, fn) {
  fn();
  count++;
  console.log("PASS: " + name);
}
test("every source target is modeled and built before reversed reading and written retrieval", () => {
  const plan = R.plan(lesson, words, data.words);
  assert.equal(plan.status, "ready");
  assert.equal(plan.tasks.length, 12);
  for (const word of words) {
    const tasks = plan.tasks.filter((t) => t.word.id === word.id);
    assert.deepEqual(
      Array.from(tasks, (t) => t.kind).sort(),
      ["build", "look", "read", "type"].sort(),
    );
    const index = (kind) =>
      plan.tasks.findIndex((t) => t.word.id === word.id && t.kind === kind);
    assert(index("look") < index("build"));
    assert(index("build") < index("read"));
    assert(index("build") < index("type"));
    assert(
      tasks
        .filter((t) => ["look", "build"].includes(t.kind))
        .every((t) => t.model),
    );
    assert(
      tasks
        .filter((t) => ["read", "type"].includes(t.kind))
        .every((t) => !t.model),
    );
  }
});
test("successive retrieval prompts change target where the source group permits it", () => {
  const tasks = R.plan(lesson, words, data.words).tasks.slice(6);
  for (let i = 1; i < tasks.length; i++)
    assert.notEqual(tasks[i].word.id, tasks[i - 1].word.id);
});
test("all sixteen introductions use their existing focus words, with bounded one-to-three-word routines", () => {
  for (const l of data.lessons.filter((l) => l.kind === "introduce")) {
    const targets = ctx.PathSRS.focus(data, l).map((id) =>
      data.words.find((w) => w.id === id),
    );
    const plan = R.plan(l, targets, data.words);
    assert.equal(plan.status, "ready");
    assert.equal(plan.tasks.length, targets.length * 4);
    assert(plan.tasks.length <= 12);
    assert(plan.tasks.every((t) => targets.includes(t.word)));
    assert.equal(plan.reviewStatus, "pending");
    assert.match(plan.evidence, /not mastery/);
  }
});
test("each response contract identifies objective, prerequisite and accessible instruction", () => {
  for (const value of Object.values(R.stages))
    for (const key of ["label", "objective", "instruction", "prerequisite"])
      assert(value[key].length > 3);
  assert(Object.isFrozen(R.stages));
  assert(Object.values(R.stages).every(Object.isFrozen));
});
test("source words and approvals are not mutated or manufactured", () => {
  const before = JSON.stringify(data);
  for (const word of data.words) {
    Object.freeze(word.letters);
    Object.freeze(word);
  }
  Object.freeze(data.words);
  const plan = R.plan(lesson, words, data.words);
  assert.equal(plan.status, "ready");
  assert.equal(JSON.stringify(data), before);
  for (const task of plan.tasks)
    assert.equal(
      task.word,
      data.words.find((w) => w.id === task.word.id),
    );
});
test("empty, oversized, duplicate or altered source groups are blocked without an answer key", () => {
  for (const targets of [
    [],
    [...words, words[0]],
    [words[0], words[0]],
    [{ ...words[0], word: "XX" }],
    [{ ...words[0], concept: "invented test-only meaning" }],
  ]) {
    const plan = R.plan(lesson, targets, data.words);
    assert.equal(plan.status, "blocked");
    assert.equal(plan.tasks.length, 0);
  }
});
test("future sound and sentence units and unsupported lessons remain blocked", () => {
  for (const l of data.lessons.filter(
    (l) => !l.available || l.kind !== "introduce",
  ))
    assert.equal(R.plan(l, words, data.words).status, "blocked");
  assert.equal(
    R.plan({ ...lesson, unit: 4 }, words, data.words).status,
    "blocked",
  );
  const tools = ctx.FidalText;
  assert.equal(
    R.plan({ ...lesson, wordIds: null }, words, data.words).status,
    "blocked",
  );
  ctx.FidalText = null;
  assert.equal(R.plan(lesson, words, data.words).status, "blocked");
  ctx.FidalText = tools;
});
console.log(
  `${count} model-fading, source-integrity and content-gate groups passed.`,
);
