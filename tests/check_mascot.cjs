const fs = require("node:fs"),
  path = require("node:path"),
  vm = require("node:vm"),
  assert = require("node:assert/strict"),
  crypto = require("node:crypto");
const { JSDOM } = require("jsdom"),
  withoutMascot = require("./helpers/mascot-preservation.cjs");
const root = path.join(__dirname, ".."),
  dom = new JSDOM('<main><div id="host"></div></main>'),
  ctx = vm.createContext({ document: dom.window.document });
for (const file of [
  "shared/mascot/neri.js",
  "shared/mascot/articulation-data.js",
  "shared/mascot/articulation-core.js",
  "unit-01-fidel-foundations/pronunciation-content.js",
])
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), ctx);
const N = ctx.Neri,
  C = ctx.MascotArticulation,
  D = ctx.MascotArticulationData,
  cards = ctx.PronunciationCardContent.cards;
const copy = (x) => JSON.parse(JSON.stringify(x));
let count = 0;
function test(name, fn) {
  fn();
  count++;
  console.log("PASS: " + name);
}
test("all nine animal expressions render, switch and describe their meaning without color alone", () => {
  const host = dom.window.document.querySelector("#host"),
    mascot = N.create(host, { state: "idle", caption: "One small step." }),
    hashes = new Set();
  assert.equal(N.states.length, 9);
  for (const state of N.states) {
    mascot.update({ state, caption: "Caption " + state });
    assert.equal(host.dataset.neriState, state);
    assert(
      host
        .querySelector('[role="img"]')
        .getAttribute("aria-label")
        .includes("Neri"),
    );
    assert.equal(
      host.querySelector(".neri-caption").textContent,
      "Caption " + state,
    );
    hashes.add(
      crypto
        .createHash("sha256")
        .update(host.querySelector("svg").outerHTML)
        .digest("hex"),
    );
  }
  assert.equal(hashes.size, 9);
  mascot.update({ state: "bogus", caption: "<script>bad</script>" });
  assert.equal(host.querySelector("script"), null);
  assert.equal(host.dataset.neriState, "sleepy");
  mascot.destroy();
  assert.equal(host.children.length, 0);
});
test("exactly 18 source-backed form bindings select b, m or f component guides, never default phonetics", () => {
  assert.equal(D.bindings.length, 18);
  let found = 0;
  for (const card of cards) {
    const p = C.profile(D, card);
    if (p) {
      found++;
      assert.equal(p.scope, "consonant-component");
      assert.equal(
        D.bindings.find((b) => b.character === card.character).profile,
        p.id,
      );
      assert([1, 2, 3, 4, 5, 7].includes(card.order));
    }
  }
  assert.equal(found, 18);
  for (const char of ["ብ", "ም", "ፍ", "ተ", "ኣ"])
    assert.equal(
      C.profile(
        D,
        cards.find((c) => c.character === char),
      ),
      null,
    );
  const card = copy(cards.find((c) => c.character === "በ"));
  card.target = { kind: "contextual-word", text: "not a valid context" };
  assert.equal(C.profile(D, card), null);
  card.target = null;
  card.family = "ተ";
  assert.equal(C.profile(D, card), null);
  assert.equal(C.profile(null, card), null);
});
test("all native illustration reviews and audio timelines remain pending; no whole syllable or audio is fabricated", () => {
  assert.equal(D.alignments.length, 0);
  for (const p of D.profiles) {
    assert.equal(p.review.status, "pending");
    assert.equal(p.review.reviewer, null);
    assert(p.sourceIds.includes("harvard-fidal"));
    assert(p.sourceIds.includes("ipa"));
    assert.equal(p.steps.length, 3);
    assert(p.steps.every((s) => C.poseValid(s.pose)));
  }
  assert.equal(D.profiles.find((p) => p.ipa === "b").steps[1].pose.open, 0);
  assert.equal(D.profiles.find((p) => p.ipa === "m").steps[2].pose.nasal, 1);
  assert.equal(D.profiles.find((p) => p.ipa === "f").steps[1].pose.contact, 1);
});
test("closed-lip poses hide the mouth cavity and the close-up keeps attention on lips and nasal cues", () => {
  assert(
    N.mouth({ open: 0, contact: 0, nasal: 0 }).includes(
      'fill="#603d36" opacity="0"',
    ),
  );
  const closeup = N.svg("demonstrating", true, {
    open: 0,
    contact: 0,
    nasal: 1,
  });
  assert(!closeup.includes('cx="124"'));
  assert(closeup.includes('class="neri-nasal"'));
});
test("invalid evidence, unknown profiles and unsupported context cannot acquire a guide", () => {
  const card = cards.find((c) => c.character === "በ");
  for (const mutate of [
    (d) => (d.profiles[0].sourceIds = ["fake"]),
    (d) => (d.profiles[0].scope = "whole-syllable"),
    (d) => (d.profiles[0].steps[0].pose.open = NaN),
    (d) => (d.bindings[0].profile = "fake"),
  ]) {
    const d = copy(D);
    mutate(d);
    assert.equal(C.profile(d, card), null);
  }
});
test("malformed optional guide data fails closed without breaking the card activity", () => {
  const c = cards.find((c) => c.character === "በ");
  for (const mutate of [
    (d) => (d.bindings = {}),
    (d) => (d.profiles = null),
    (d) => (d.profiles[0].sourceIds = {}),
    (d) => (d.profiles[0].steps = [null, null, null]),
    (d) => (d.sources = [null]),
  ]) {
    const d = copy(D);
    mutate(d);
    assert.equal(C.profile(d, c), null);
  }
  const f = fixture();
  f.data.alignments[0].frames = [null, null, null];
  assert.equal(C.alignment(f.data, f.card, false, true), null);
});
test("interpolation respects explicit stages and visual slow pacing without guessing a speech duration", () => {
  const p = D.profiles[0],
    f = C.frames(p),
    slow = C.frames(p, 4800);
  assert.equal(C.at(f, 0).pose.open, 0.35);
  assert.equal(C.at(f, 1080).pose.open, 0);
  assert.equal(C.at(f, 2400).pose.open, 0.55);
  assert.equal(C.at(f, -1), null);
  assert.equal(C.at(f, 2401), null);
  assert.equal(C.at(f, 540).pose.open, C.at(slow, 1080).pose.open);
  assert(C.at(f, 540).pose.open > 0 && C.at(f, 540).pose.open < 0.35);
});
function fixture() {
  const data = copy(D),
    card = copy(cards.find((c) => c.character === "በ"));
  const review = {
    status: "approved",
    language: "ti",
    reviewer: "TEST FIXTURE ONLY",
    reviewedAt: "2026-11-21",
    variety: "fixture-only",
    sourceUrl: "https://example.test/evidence",
    sourceLocator: "synthetic transport test, not native speech",
    rights: "test only",
  };
  card.target = { ...review, kind: "syllabic-form", character: card.character };
  card.audio = {
    normal: "../shared/assets/fixture-normal.wav",
    slow: "../shared/assets/fixture-slow.wav",
  };
  data.profiles[0].review = { ...review, revision: data.profiles[0].revision };
  const a = {
    ...review,
    scope: "consonant-component",
    profile: "b-lips",
    character: card.character,
    speed: "normal",
    targetKind: "syllabic-form",
    audioPath: card.audio.normal,
    sha256: "a".repeat(64),
    durationMs: 3000,
    frames: data.profiles[0].steps.map((s, i) => ({
      atMs: [300, 800, 1300][i],
      stage: i,
      pose: s.pose,
    })),
  };
  data.alignments.push(a);
  return { data, card, a };
}
test("synchronization requires independent guide approval and exact reviewed character, variety, speed and asset", () => {
  const { data, card, a } = fixture();
  assert.equal(C.alignment(data, card, false, true), a);
  assert.equal(C.alignment(data, card, false, false), null);
  assert.equal(C.alignment(data, card, true, true), null);
  for (const mutate of [
    (d) => (d.profiles[0].review.status = "pending"),
    (d) => (d.profiles[0].review.revision = "0".repeat(20)),
    (d) => (d.alignments[0].character = "ቡ"),
    (d) => (d.alignments[0].audioPath = "../shared/assets/other.wav"),
    (d) => (d.alignments[0].variety = "wrong"),
    (d) => (d.alignments[0].targetKind = "contextual-word"),
    (d) => (d.alignments[0].reviewedAt = "2026-99-99"),
    (d) => (d.alignments[0].sha256 = "bad"),
    (d) => (d.alignments[0].frames[1].atMs = 0),
    (d) => (d.alignments[0].language = "am"),
  ]) {
    const d = copy(data);
    mutate(d);
    assert.equal(C.alignment(d, card, false, true), null);
  }
});
function followFixture(staticMode = false) {
  const { a } = fixture(),
    audio = new EventTarget();
  Object.assign(audio, {
    duration: 3,
    currentTime: 0.3,
    paused: false,
    ended: false,
    readyState: 4,
  });
  let serial = 0;
  const scheduled = new Map(),
    poses = [],
    states = [];
  const driver = C.follow(audio, a, {
    staticMode,
    onPose: (p) => poses.push(p),
    onState: (s) => states.push(s),
    schedule: (fn) => {
      scheduled.set(++serial, fn);
      return serial;
    },
    cancel: (id) => scheduled.delete(id),
  });
  return {
    audio,
    scheduled,
    poses,
    states,
    driver,
    tick() {
      const [id, fn] = [...scheduled][0];
      scheduled.delete(id);
      fn();
    },
  };
}
test("audio animation follows the media clock and seeks; it does not stretch poses across the entire recording", () => {
  const h = followFixture();
  assert.equal(h.scheduled.size, 1);
  assert.equal(h.poses.at(-1).pose.open, 0.35);
  h.audio.currentTime = 0.8;
  h.tick();
  assert.equal(h.poses.at(-1).pose.open, 0);
  h.audio.currentTime = 2;
  h.audio.dispatchEvent(new Event("seeked"));
  assert.equal(h.poses.at(-1), null);
  assert.equal(h.states.at(-1), "listening");
  h.driver.stop();
  assert.equal(h.scheduled.size, 0);
});
test("buffering, pause, end, failure and teardown cancel animation without touching learner grades", () => {
  const h = followFixture();
  h.audio.dispatchEvent(new Event("waiting"));
  assert.equal(h.scheduled.size, 0);
  h.audio.currentTime = 0.9;
  h.audio.dispatchEvent(new Event("playing"));
  assert.equal(h.scheduled.size, 1);
  h.audio.paused = true;
  h.audio.dispatchEvent(new Event("pause"));
  assert.equal(h.scheduled.size, 0);
  h.audio.paused = false;
  h.audio.dispatchEvent(new Event("playing"));
  h.audio.dispatchEvent(new Event("error"));
  assert.equal(h.scheduled.size, 0);
  assert.equal(h.poses.at(-1), null);
  h.driver.stop();
  h.audio.dispatchEvent(new Event("playing"));
  assert.equal(h.scheduled.size, 0);
});
test("reduced motion never schedules automatic mouth frames, and mismatched duration refuses synchronization", () => {
  const h = followFixture(true);
  assert.equal(h.scheduled.size, 0);
  assert.equal(h.poses.length, 0);
  assert.equal(h.states.at(-1), "static");
  h.driver.stop();
  const g = followFixture();
  g.audio.duration = 4;
  g.audio.dispatchEvent(new Event("seeked"));
  assert.equal(g.scheduled.size, 0);
  assert.equal(g.states.at(-1), "unavailable");
  g.driver.stop();
});
test("18 static local exports have descriptive SVG metadata and match the live renderer", () => {
  const dir = path.join(root, "shared/mascot/assets"),
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".svg"));
  assert.equal(files.length, 18);
  for (const file of files) {
    const art = fs.readFileSync(path.join(dir, file), "utf8");
    assert(art.includes("<title>"));
    assert(art.includes("Original Neri"));
    assert(!/<script|<foreignObject|(?:href|src)="https?:/.test(art));
    assert(art.length < 15000);
  }
});
test("the mascot adds no voice capture, recognition, synthetic speech, network or persistent child data", () => {
  for (const file of [
    "neri.js",
    "articulation-core.js",
    "practice.js",
    "scenes.js",
  ]) {
    const code = fs.readFileSync(
      path.join(root, "shared/mascot", file),
      "utf8",
    );
    assert(
      !/getUserMedia|SpeechRecognition|speechSynthesis|localStorage|sessionStorage|fetch\(|XMLHttpRequest|new\s+Audio/.test(
        code,
      ),
    );
  }
});
test("all 91 existing sources and story assets retain their original content through exact reversible mascot UI changes", () => {
  const baseline = JSON.parse(
    fs.readFileSync(path.join(root, "tests/fixtures/mascot-preservation.json")),
  );
  assert.equal(Object.keys(baseline).length, 91);
  for (const [file, hash] of Object.entries(baseline))
    assert.equal(
      crypto
        .createHash("sha256")
        .update(
          withoutMascot(
            file,
            require("./helpers/developer-preview-preservation.cjs")(
              file,
              fs.readFileSync(path.join(root, file)),
            ),
          ),
        )
        .digest("hex"),
      hash,
      file,
    );
});
console.log(
  `${count} mascot, articulation, synchronization and preservation groups passed.`,
);
