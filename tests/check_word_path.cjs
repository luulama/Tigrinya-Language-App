const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const root = path.join(__dirname, ".."),
  context = vm.createContext({});
for (const name of ["path-content.js", "src/path-core.js"])
  vm.runInContext(
    fs.readFileSync(path.join(root, "unit-02-first-words", name), "utf8"),
    context,
  );
const C = context.WordPathContent,
  W = context.WordPath,
  D = W.DAY;
let count = 0;
function test(name, fn) {
  fn();
  count++;
  console.log("PASS: " + name);
}
test("path source, lesson goals, prerequisite order and content gates are valid", () => {
  W.validate(C);
  assert.equal(C.words.length, 31);
  assert.equal(C.lessons.filter((l) => l.available).length, 27);
  assert.equal(C.lessons.filter((l) => l.available && l.unit === 2).length, 21);
  assert.equal(C.lessons.filter((l) => !l.available).length, 4);
  for (const l of C.lessons) {
    for (const field of [
      "goal",
      "prerequisiteKnowledge",
      "languageScope",
      "completionRule",
      "reviewPlan",
    ])
      assert(l[field]);
    assert(l.recipe.length >= 4);
  }
  assert.throws(() => W.validate({ ...C, words: [] }), /missing/);
  assert.throws(
    () =>
      W.validate({
        ...C,
        lessons: C.lessons.map((l) =>
          l.id === "u4-01" ? { ...l, available: true } : l,
        ),
      }),
    /implemented assessment/,
  );
  assert.throws(
    () =>
      W.validate({
        ...C,
        lessons: [{ ...C.lessons[0], prerequisites: ["missing"] }],
      }),
    /order/,
  );
});
test("only source spellings, character arrays, meanings and artwork are used", () => {
  const original = JSON.parse(
    fs.readFileSync(
      path.join(root, "unit-02-first-words/unit-2-content-review.json"),
    ),
  );
  for (const w of C.words) {
    const source = original.items.find((s) => s.id === w.id);
    assert(source.includedInChildActivity);
    assert.equal(w.word, source.scriptCandidate);
    assert.equal(w.concept, source.pictureLesson.englishConcept);
    assert.equal(w.art, source.pictureLesson.art);
    assert.equal(w.letters.join(""), source.letters.join(""));
  }
  assert.equal(new Set(C.words.map((w) => w.art)).size, 31);
  assert.equal(C.excludedCandidates.length, 1);
  const introduced = new Set(
    C.lessons
      .filter((l) => l.unit === 2 && l.kind === "introduce")
      .flatMap((l) => l.wordIds),
  );
  assert.equal(introduced.size, 31);
  for (const l of C.lessons.filter((l) => l.unit === 3))
    assert(l.wordIds.every((id) => introduced.has(id)));
});
test("only the first lesson is ready; locked and content-blocked nodes cannot be completed", () => {
  const h = W.fresh();
  assert.equal(W.next(C, h).id, "u2-01");
  assert.equal(W.status(C.lessons[1], h), "locked");
  assert.equal(W.complete(C, h, C.lessons[1].id, false, 100), false);
  assert.equal(W.complete(C, h, "u4-01", false, 100), false);
  assert.equal(W.complete(C, h, "u2-01", false, -1), false);
});
test("help records practice but does not unlock; a fresh unassisted check unlocks", () => {
  const h = W.fresh();
  W.complete(C, h, "u2-01", true, 100);
  assert.equal(W.status(C.lessons[0], h), "retry");
  assert.equal(W.status(C.lessons[1], h), "locked");
  W.complete(C, h, "u2-01", false, 200);
  assert.equal(W.status(C.lessons[0], h), "complete");
  assert.equal(W.status(C.lessons[1], h), "ready");
  W.complete(C, h, "u2-01", true, 300);
  assert.equal(W.status(C.lessons[1], h), "ready");
});
test("all 27 lessons unlock in source-defined order; future media/sentence units remain gated", () => {
  const h = W.fresh();
  for (const l of C.lessons.filter((l) => l.available)) {
    assert.equal(W.next(C, h).id, l.id);
    assert(W.complete(C, h, l.id, false, 100));
  }
  assert.equal(W.next(C, h), undefined);
  assert.equal(Object.keys(h.lessons).length, 27);
  for (const l of C.lessons.filter((l) => !l.available))
    assert.equal(W.status(l, h), "content");
});
test("same-day replays never expand review spacing; later reviews do", () => {
  const h = W.fresh(),
    start = 100;
  W.complete(C, h, "u2-01", false, start);
  const ids = C.lessons[0].wordIds;
  W.review(h, ids, [], start + 100);
  for (const id of ids) {
    assert.equal(h.review[id].step, 0);
    assert.equal(h.review[id].due, start + D);
  }
  W.review(h, ids, [], start + D + 100);
  for (const id of ids) {
    assert.equal(h.review[id].step, 1);
    assert.equal(h.review[id].delayed, true);
  }
  assert.equal(W.due(C, h, start + D + 101).length, 0);
});
test("model exposure prevents a delayed success claim and due count includes only taught words", () => {
  const h = W.fresh();
  W.complete(C, h, "u2-01", false, 100);
  const ids = C.lessons[0].wordIds;
  assert.equal(W.due(C, h, 100 + D).length, 3);
  W.expose(h, ids, 100 + D);
  W.review(h, ids, [], 200 + D);
  for (const id of ids) {
    assert.equal(h.review[id].step, 0);
    assert.equal(h.review[id].delayed, false);
  }
});
test("help affects the relevant review word, rollback is ignored and unsupported IDs cannot add records", () => {
  const h = W.fresh();
  W.complete(C, h, "u2-01", false, 100);
  const ids = C.lessons[0].wordIds;
  W.review(h, [...ids, "missing"], [ids[0]], 100 + D);
  assert.equal(h.review[ids[0]].step, 0);
  assert.equal(h.review[ids[1]].step, 1);
  assert(!h.review.missing);
  const snapshot = JSON.stringify(h);
  W.review(h, ids, [], 0);
  assert.equal(JSON.stringify(h), snapshot);
});
test("opt-in saved progress is versioned and malformed records do not unlock lessons", () => {
  const h = W.fresh();
  W.complete(C, h, "u2-01", false, 100);
  assert.equal(W.restore(h, C).save, false);
  const good = { ...h, save: true, contentVersion: C.contentVersion };
  assert.equal(W.restore(good, C).lessons["u2-01"].passed, true);
  assert.equal(W.restore({ ...good, contentVersion: "old" }, C).save, false);
  assert(
    !W.restore(
      {
        ...good,
        lessons: { "u2-01": { passed: "yes", practised: true, at: 100 } },
      },
      C,
    ).lessons["u2-01"],
  );
});
test("Unit 1/shared baseline is preserved through the card link, isolated storage extension and reversible bear appearance changes", () => {
  const baseline = JSON.parse(
    fs.readFileSync(path.join(__dirname, "fixtures/unit1-path-baseline.json")),
  );
  for (const [name, hash] of Object.entries(baseline)) {
    let source = require("./helpers/bear-preservation.cjs")(
      name,
      require("./helpers/developer-preview-preservation.cjs")(
        name,
        fs.readFileSync(path.join(root, name)),
      ),
    );
    // A later explicit Unit 1 request authorises these additions. Keep the original hashes.
    if (name === "unit-01-fidel-foundations/index.html") {
      const link =
        ' <a class="course-link" href="pronunciation.html">Say &amp; remember · pronunciation cards →</a>\n';
      assert.equal(source.toString().split(link).length, 2);
      source = Buffer.from(source.toString().replace(link, ""));
    }
    if (name === "shared/learning-path.js") {
      const block =
        /  \/\* BEGIN pronunciation-card storage extension \*\/\n[\s\S]*?  \/\* END pronunciation-card storage extension \*\/\n/g;
      assert.equal([...source.toString().matchAll(block)].length, 1);
      source = Buffer.from(source.toString().replace(block, ""));
    }
    assert.equal(
      crypto.createHash("sha256").update(source).digest("hex"),
      hash,
      name,
    );
  }
});
console.log(
  `${count} word-path source, progression, review, storage and Unit 1 preservation checks passed.`,
);
