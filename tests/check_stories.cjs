const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict"),
  path = require("node:path"),
  crypto = require("node:crypto");
const withoutMascot = require("./helpers/mascot-preservation.cjs");
const root = path.join(__dirname, ".."),
  ctx = vm.createContext({});
for (const name of ["stories/data.js", "stories/core.js"])
  vm.runInContext(fs.readFileSync(path.join(root, name), "utf8"), ctx);
const C = ctx.StoryLibrary,
  D = ctx.StoryLibraryContent,
  stories = D.stories;
let count = 0;
function test(name, fn) {
  fn();
  count++;
  console.log("PASS: " + name);
}
test("20 complete unique narratives, 160 source paragraphs and original metadata are retained", () => {
  C.validate(D);
  const source = JSON.parse(
    fs.readFileSync(path.join(root, "stories/content/collection.json")),
  );
  assert.equal(stories.length, 20);
  assert.equal(new Set(stories.map((s) => s.id)).size, 20);
  assert.equal(new Set(stories.map((s) => s.title)).size, 20);
  assert.equal(stories.flatMap((s) => s.paragraphs).length, 160);
  for (const s of stories) {
    const original = source.stories.find((x) => x.id === s.id);
    assert.equal(s.title, original.title);
    assert.deepEqual(
      Array.from(s.paragraphs, (p) => p.text),
      original.paragraphs,
    );
    assert(
      s.paragraphs.reduce((n, p) => n + p.text.split(/\s+/).length, 0) >= 100,
    );
    assert.equal(s.approvedForLearnerRelease, false);
    assert.equal(s.reviewStatus, "awaiting-fluent-tigrinya-review");
  }
});
test("Ethiopic text is NFC, LTR and not replaced with Latin outlines or missing-body cards", () => {
  assert.equal(D.language, "ti");
  assert.equal(D.direction, "ltr");
  for (const s of stories)
    for (const p of [s.title, ...s.paragraphs.map((p) => p.text)]) {
      assert.equal(p.normalize("NFC"), p);
      assert(!/[A-Za-z]/.test(p));
      assert(/[\u1200-\u137f]/.test(p));
    }
  const average = (part) => {
    const group = stories.filter((s) => s.part === part);
    return (
      group.reduce(
        (n, s) =>
          n + s.paragraphs.reduce((m, p) => m + p.text.split(/\s+/).length, 0),
        0,
      ) / group.length
    );
  };
  assert(average(1) < average(2));
  assert(average(2) < average(3));
});
test("every story has a dedicated valid local original illustration and descriptive alternative", () => {
  const hashes = new Set();
  for (const s of stories) {
    assert(s.illustrations.length);
    for (const image of s.illustrations) {
      assert(image.alt.length > 35);
      const art = fs.readFileSync(
        path.join(root, "stories", image.src),
        "utf8",
      );
      assert(art.includes('viewBox="0 0 960 640"'));
      assert(art.includes("Original project artwork"));
      assert(art.includes("<title"));
      assert(
        !/<(?:script|foreignObject)|(?:href|src)="https?:|data:image/.test(art),
      );
      hashes.add(crypto.createHash("sha256").update(art).digest("hex"));
    }
  }
  assert.equal(hashes.size, 20);
});
test("each review checklist stays pending; future audio is data only with no playback controls", () => {
  const review = JSON.parse(
    fs.readFileSync(path.join(root, "stories/content/review.json")),
  );
  assert.equal(review.stories.length, 20);
  for (const r of review.stories) {
    assert.equal(r.reviewer, null);
    assert.equal(r.status, "awaiting-fluent-tigrinya-review");
    assert.equal(Object.keys(r.checks).length, 9);
    assert(Object.values(r.checks).every((v) => v === "pending"));
  }
  for (const s of stories) {
    assert.equal(s.audio, null);
    assert(s.paragraphs.every((p) => p.audio === null));
  }
  const code = fs.readFileSync(path.join(root, "stories/app.js"), "utf8");
  assert(
    !/new\s+Audio|speechSynthesis|SpeechRecognition|getUserMedia|fetch\(|XMLHttpRequest/.test(
      code,
    ),
  );
});
test("malformed, missing, duplicate and empty content fails with a clear recovery reason", () => {
  for (const value of [
    null,
    {},
    { ...D, stories: [] },
    { ...D, stories: [...stories.slice(0, 19), stories[0]] },
    {
      ...D,
      stories: stories.map((s, n) => (n ? s : { ...s, paragraphs: [] })),
    },
  ])
    assert.throws(() => C.validate(value), /story|Story/);
  assert.equal(C.find(stories, "unknown"), null);
});
function harness(raw, blocked = false) {
  const values = new Map(raw ? [[C.KEY, raw]] : []);
  values.set("tigrinya.practice.v1", "original-unit1");
  values.set("tigrinya.word-path.v1", "original-path");
  const writes = [];
  const storage = {
    getItem: (k) => values.get(k) || null,
    setItem(k, v) {
      if (blocked) throw Error("blocked");
      values.set(k, v);
      writes.push(k);
    },
    removeItem(k) {
      values.delete(k);
    },
  };
  return { store: C.store(storage, stories), values, writes };
}
test("bookmarks, read markers and positions work without writing before explicit saving", () => {
  const h = harness(),
    s = stories[0];
  assert(h.store.bookmark(s));
  assert.equal(h.store.position(s, 3), true);
  h.store.finish(s);
  assert.equal(h.store.state.stories[s.id].finished, true);
  assert.equal(h.writes.length, 0);
  assert.equal(h.values.get("tigrinya.practice.v1"), "original-unit1");
  assert.equal(h.values.get("tigrinya.word-path.v1"), "original-path");
});
test("opt-in reading choices round-trip, remain bounded and do not overwrite course data", () => {
  const h = harness(),
    s = stories[4];
  h.store.bookmark(s);
  h.store.position(s, 4);
  h.store.size(28);
  h.store.evening(true);
  assert(h.store.enable());
  const next = harness(h.values.get(C.KEY));
  assert.equal(next.store.state.stories[s.id].position, 4);
  assert.equal(next.store.state.stories[s.id].bookmark, true);
  assert.equal(next.store.state.size, 28);
  assert.equal(next.store.state.evening, true);
  assert(h.writes.every((k) => k === C.KEY));
});
test("a new story revision retains its bookmark without inventing completion of changed text", () => {
  const h = harness(),
    s = stories[1];
  h.store.bookmark(s);
  h.store.finish(s);
  h.store.enable();
  const raw = JSON.parse(h.values.get(C.KEY));
  raw.stories[s.id].revision = "previous-revision";
  const restored = C.restore(raw, stories);
  assert(restored.stories[s.id].bookmark);
  assert.equal(restored.stories[s.id].finished, false);
  assert.equal(restored.stories[s.id].position, 0);
});
test("unsupported or corrupt saved data is preserved while in-tab reading still works", () => {
  for (const raw of [
    "{broken",
    JSON.stringify({ version: 9, save: true, stories: {} }),
  ]) {
    const h = harness(raw);
    assert(h.store.blocked);
    assert.equal(h.store.enable(), false);
    h.store.bookmark(stories[0]);
    assert.equal(h.values.get(C.KEY), raw);
    assert(h.store.error);
  }
  const h = harness(null, true);
  h.store.bookmark(stories[0]);
  assert.equal(h.store.enable(), false);
  assert.match(h.store.error, /Saving is unavailable/);
  assert(h.store.state.stories[stories[0].id].bookmark);
});
test("failed saves retain the previous good copy and stop-saving removes only Stories data", () => {
  const h = harness();
  h.store.bookmark(stories[0]);
  h.store.enable();
  assert(h.store.disable());
  assert.equal(h.values.has(C.KEY), false);
  assert.equal(h.values.get("tigrinya.practice.v1"), "original-unit1");
  assert.equal(h.values.get("tigrinya.word-path.v1"), "original-path");
  assert(h.store.state.stories[stories[0].id].bookmark);
  const raw = { version: 1, save: true, size: 24, evening: false, stories: {} };
  const failing = harness(JSON.stringify(raw), true);
  failing.store.bookmark(stories[1]);
  assert.equal(failing.values.get(C.KEY), JSON.stringify(raw));
});
test("title search handles Ethiopic and shelves filter the actual stored choice", () => {
  const h = harness();
  h.store.bookmark(stories[2]);
  h.store.finish(stories[3]);
  assert.equal(C.filter(stories, h.store.state, "saved").length, 1);
  assert.equal(
    C.filter(stories, h.store.state, "finished")[0].id,
    stories[3].id,
  );
  assert(
    C.filter(stories, h.store.state, "all", "ወርሒ").some(
      (s) => s.id === "cat-and-moonlight",
    ),
  );
  assert.equal(
    C.filter(stories, h.store.state, "all", "no such title").length,
    0,
  );
  assert.equal(h.store.position(stories[0], 1000), false);
});
test("all 34 pre-Stories baselines retain their content through the explicitly recorded mascot appearance additions", () => {
  const baseline = JSON.parse(
    fs.readFileSync(
      path.join(root, "tests/fixtures/stories-preservation.json"),
    ),
  );
  assert.equal(Object.keys(baseline).length, 34);
  for (const [name, hash] of Object.entries(baseline))
    assert.equal(
      crypto
        .createHash("sha256")
        .update(withoutMascot(name, require("./helpers/developer-preview-preservation.cjs")(name, fs.readFileSync(path.join(root, name)))))
        .digest("hex"),
      hash,
      name,
    );
});
console.log(
  `${count} Stories content, illustration, persistence and preservation groups passed.`,
);
