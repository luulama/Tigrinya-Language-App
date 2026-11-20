const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.join(__dirname, "..");
const c = vm.createContext({});
for (const file of [
  "fidal-content.js",
  "game-content.js",
  "game-garden-core.js",
])
  vm.runInContext(fs.readFileSync(path.join(root, "shared", file), "utf8"), c);
const G = c.GameGarden,
  data = G.content(c.FidalContent, c.GardenWords);
assert.equal(G.catalog.length, 20);
assert.equal(new Set(G.catalog.map((g) => g.id)).size, 20);
assert.equal(new Set(G.catalog.map((g) => g.mechanic)).size, 20);
assert.equal(G.catalog.filter((g) => g.unit === 1).length, 10);
assert.equal(G.catalog.filter((g) => g.unit === 2).length, 10);
const source = JSON.parse(
  fs.readFileSync(
    path.join(root, "unit-02-first-words/unit-2-content-review.json"),
    "utf8",
  ),
);
for (const w of data.words) {
  const original = source.items.find((x) => x.id === w.id);
  assert.equal(w.word, original.scriptCandidate);
  assert.equal(w.letters.join(""), w.word);
  assert.equal(w.concept, original.pictureLesson.englishConcept);
  assert.equal(w.art, original.pictureLesson.art);
}
for (const g of G.catalog) {
  assert(g.objective && g.instruction && g.name);
  assert.throws(
    () => G.build(g.id, { families: [], words: [] }),
    /source|families/,
  );
  for (let variation = 0; variation < 35; variation++) {
    const p = G.build(g.id, data, variation);
    assert(p.teaching.length > 0);
    for (const w of p.words) assert(source.items.some((x) => x.id === w.id));
    if (g.id === "bridge") assert.equal(p.rounds.length, 7);
    if (g.id === "spotlight")
      for (const r of p.rounds) assert(r.word.includes(r.target));
    if (g.id === "domino") {
      assert.equal(new Set(p.chain.map((w) => w.id)).size, 3);
      assert.equal(p.chain[0].letters[1], p.chain[1].letters[0]);
      assert.equal(p.chain[1].letters[1], p.chain[2].letters[0]);
    }
    if (g.id === "shared")
      for (const r of p.rounds)
        assert(
          r.left.letters.includes(r.target) &&
            r.right.letters.includes(r.target),
        );
    if (g.id === "windows")
      for (const r of p.rounds) {
        assert.equal(r.positions[1], r.positions[0] + 1);
        assert.equal(
          Math.floor(r.positions[0] / 3),
          Math.floor(r.positions[1] / 3),
        );
      }
    if (g.id === "stones")
      p.path
        .slice(1)
        .forEach((n, i) =>
          assert.equal(
            Math.abs(Math.floor(n / 3) - Math.floor(p.path[i] / 3)) +
              Math.abs((n % 3) - (p.path[i] % 3)),
            1,
          ),
        );
  }
  console.log(
    `PASS: ${g.name} — source integrity, replay variants and empty-content guard`,
  );
}
assert.equal(G.normalize(" ቤት "), "ቤት");
assert.equal(G.normalize("e\u0301"), "é");
for (const file of ["game-garden-core.js", "game-garden.js"])
  assert(
    !/\b(fetch|localStorage|sessionStorage|speechSynthesis|getUserMedia|XMLHttpRequest)\b/.test(
      fs.readFileSync(path.join(root, "shared", file), "utf8"),
    ),
  );
console.log(
  "PASS: 20 game contracts, 700 source-backed variants, NFC input and no game storage/network/audio APIs.",
);
