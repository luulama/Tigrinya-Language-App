/* Sourced consonant components, never inferred whole-syllable visemes. */
(function (root) {
  "use strict";
  const keys = ["open", "contact", "nasal"];
  const poseValid = (p) =>
    p && keys.every((k) => Number.isFinite(p[k]) && p[k] >= 0 && p[k] <= 1);
  const reviewValid = (r) =>
    r?.status === "approved" &&
    r.language === "ti" &&
    [
      "reviewer",
      "reviewedAt",
      "variety",
      "sourceUrl",
      "sourceLocator",
      "rights",
    ].every((k) => typeof r[k] === "string" && r[k].trim()) &&
    /^\d{4}-\d{2}-\d{2}$/.test(r.reviewedAt) &&
    Number.isFinite(Date.parse(r.reviewedAt)) &&
    new Date(r.reviewedAt).toISOString().slice(0, 10) === r.reviewedAt &&
    /^https:\/\//.test(r.sourceUrl);
  function profile(data, card) {
    if (
      data?.schemaVersion !== 1 ||
      data.language !== "ti" ||
      !Array.isArray(data.bindings) ||
      !Array.isArray(data.profiles) ||
      !Array.isArray(data.sources) ||
      !card ||
      card.order === 6 ||
      card.target?.kind === "contextual-word"
    )
      return null;
    const b = data.bindings?.find(
      (b) =>
        b?.character === card.character &&
        b.family === card.family &&
        b.order === card.order,
    );
    const p = data.profiles.find((p) => p?.id === b?.profile);
    if (
      !p ||
      p.scope !== "consonant-component" ||
      p.evidenceStatus !== "source-supported" ||
      !Array.isArray(p.sourceIds) ||
      p.sourceIds.length < 2 ||
      !p.sourceIds.every((id) =>
        data.sources.some((s) => s?.id === id && /^https:\/\//.test(s.url)),
      ) ||
      !Array.isArray(p.steps) ||
      p.steps.length !== 3 ||
      !p.steps.every(
        (s) =>
          typeof s?.label === "string" &&
          typeof s.cue === "string" &&
          s.label &&
          s.cue &&
          poseValid(s.pose),
      )
    )
      return null;
    return p;
  }
  function at(frames, time) {
    if (!frames.length || !Number.isFinite(time)) return null;
    if (time < frames[0].atMs || time > frames.at(-1).atMs) return null;
    let a = frames[0],
      b = a;
    for (const f of frames) {
      if (f.atMs <= time) a = f;
      else {
        b = f;
        break;
      }
      b = a;
    }
    const t = a === b ? 0 : (time - a.atMs) / (b.atMs - a.atMs);
    return {
      pose: Object.fromEntries(
        keys.map((k) => [k, a.pose[k] + (b.pose[k] - a.pose[k]) * t]),
      ),
      stage: a.stage,
    };
  }
  function frames(p, duration = 2400) {
    return p.steps.map((s, i) => ({
      atMs: [0, 0.45, 1][i] * duration,
      stage: i,
      pose: s.pose,
    }));
  }
  function alignment(data, card, slow, ready) {
    if (!ready || !profile(data, card) || !Array.isArray(data.alignments))
      return null;
    const p = profile(data, card);
    if (
      !reviewValid(profile(data, card).review) ||
      !/^[a-f0-9]{20}$/.test(p.revision) ||
      p.review.revision !== p.revision ||
      profile(data, card).review.variety !== card.target?.variety
    )
      return null;
    const speed = slow ? "slow" : "normal";
    const a = data.alignments?.find(
      (a) =>
        a?.character === card.character &&
        a.speed === speed &&
        a.profile === profile(data, card).id &&
        a.audioPath === card.audio?.[speed] &&
        a.variety === card.target?.variety &&
        a.targetKind === card.target?.kind,
    );
    if (
      !a ||
      !reviewValid(a) ||
      a.scope !== "consonant-component" ||
      !/^[a-f0-9]{64}$/.test(a.sha256) ||
      !Number.isFinite(a.durationMs) ||
      a.durationMs <= 0 ||
      !Array.isArray(a.frames) ||
      a.frames.length < 3
    )
      return null;
    if (
      !a.frames.every(
        (f, i) =>
          Number.isFinite(f?.atMs) &&
          f.atMs >= 0 &&
          f.atMs <= a.durationMs &&
          (!i || f.atMs > a.frames[i - 1].atMs) &&
          [0, 1, 2].includes(f.stage) &&
          poseValid(f.pose),
      )
    )
      return null;
    return a;
  }
  function follow(audio, timeline, options) {
    let id = null,
      stopped = false;
    const schedule = options.schedule || root.requestAnimationFrame.bind(root),
      cancel = options.cancel || root.cancelAnimationFrame.bind(root);
    function clear() {
      if (id !== null) cancel(id);
      id = null;
    }
    function update() {
      clear();
      if (stopped) return;
      if (options.staticMode) {
        options.onState("static");
        return;
      }
      if (
        !Number.isFinite(audio.duration) ||
        Math.abs(audio.duration * 1000 - timeline.durationMs) > 100
      ) {
        options.onState("unavailable");
        return;
      }
      if (audio.paused || audio.ended || audio.readyState < 2) {
        options.onState("paused");
        return;
      }
      const value = at(timeline.frames, audio.currentTime * 1000);
      options.onPose(value);
      options.onState(value ? "synced" : "listening");
      id = schedule(update);
    }
    function pause() {
      clear();
      options.onState("paused");
    }
    function fail() {
      clear();
      options.onPose(null);
      options.onState("unavailable");
    }
    const listeners = {
      playing: update,
      seeked: update,
      timeupdate: update,
      waiting: pause,
      pause,
      ended: pause,
      error: fail,
      emptied: fail,
    };
    for (const [name, fn] of Object.entries(listeners))
      audio.addEventListener(name, fn);
    update();
    return {
      stop() {
        stopped = true;
        clear();
        for (const [name, fn] of Object.entries(listeners))
          audio.removeEventListener(name, fn);
      },
    };
  }
  root.MascotArticulation = {
    profile,
    at,
    frames,
    alignment,
    follow,
    poseValid,
    reviewValid,
  };
})(globalThis);
