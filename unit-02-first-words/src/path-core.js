/* Unit 2 onward only. No changes to Unit 1 or its progress store. */
(function (root) {
  "use strict";
  const DAY = 86400000,
    intervals = [1, 3, 7];
  const playableKinds = new Set([
    "introduce",
    "checkpoint",
    "positions",
    "family",
    "copy",
    "read",
    "write",
    "mixed",
  ]);
  const fresh = () => ({ version: 1, save: false, lessons: {}, review: {} });
  function validate(data) {
    if (
      data?.version !== 1 ||
      !Array.isArray(data.words) ||
      !Array.isArray(data.lessons) ||
      !data.words.length
    )
      throw Error(
        "The word-path source material is missing. Retry or return to the picture library.",
      );
    const words = new Map(data.words.map((w) => [w.id, w])),
      ids = new Set();
    for (const lesson of data.lessons) {
      if (
        lesson.available &&
        (lesson.unit > 3 || !playableKinds.has(lesson.kind))
      )
        throw Error(
          "This lesson still needs reviewed content and an implemented assessment. It cannot be passed as visual practice.",
        );
      if (
        ids.has(lesson.id) ||
        lesson.unit < 2 ||
        !lesson.goal ||
        !Array.isArray(lesson.prerequisites) ||
        lesson.prerequisites.some((id) => !ids.has(id))
      )
        throw Error(
          "The lesson order needs review. No progress has been changed.",
        );
      if (
        lesson.available &&
        (!lesson.wordIds.length || lesson.wordIds.some((id) => !words.has(id)))
      )
        throw Error(
          "A lesson is missing its source words. No examples were invented.",
        );
      ids.add(lesson.id);
    }
    for (const word of words.values())
      if (
        word.letters?.length !== 2 ||
        word.letters.join("") !== word.word ||
        !/^[a-z-]+$/.test(word.art)
      )
        throw Error("A source word needs review before this path can open.");
    return data;
  }
  function status(lesson, history) {
    if (!lesson.available || lesson.unit > 3 || !playableKinds.has(lesson.kind))
      return "content";
    if (lesson.prerequisites.some((id) => !history.lessons[id]?.passed))
      return "locked";
    return history.lessons[lesson.id]?.passed
      ? "complete"
      : history.lessons[lesson.id]?.practised
        ? "retry"
        : "ready";
  }
  function restore(value, data) {
    const result = fresh();
    if (
      value?.version !== 1 ||
      value.save !== true ||
      !(
        value.contentVersion === data.contentVersion ||
        data.compatibleProgressVersions?.includes(value.contentVersion) ||
        (value.materialVersion &&
          value.materialVersion === data.materialVersion)
      )
    )
      return result;
    result.save = true;
    for (const lesson of data.lessons) {
      const s = value.lessons?.[lesson.id];
      if (
        s &&
        typeof s.passed === "boolean" &&
        typeof s.practised === "boolean" &&
        Number.isFinite(s.at) &&
        s.at >= 0
      )
        result.lessons[lesson.id] = {
          passed: s.passed,
          practised: s.practised,
          at: s.at,
        };
    }
    for (const w of data.words) {
      const s = value.review?.[w.id];
      if (
        s &&
        Number.isInteger(s.step) &&
        s.step >= 0 &&
        s.step < intervals.length &&
        Number.isFinite(s.last) &&
        Number.isFinite(s.due) &&
        s.due >= 0 &&
        s.last >= 0 &&
        typeof s.helped === "boolean" &&
        typeof s.delayed === "boolean"
      )
        result.review[w.id] = { ...s };
    }
    if (root.PathSRS) result.srs = root.PathSRS.restore(value.srs, data);
    return result;
  }
  function complete(data, history, id, helped, at = Date.now()) {
    const lesson = data.lessons.find((l) => l.id === id);
    if (
      !lesson ||
      ["locked", "content"].includes(status(lesson, history)) ||
      !Number.isFinite(at) ||
      at < 0
    )
      return false;
    const old = history.lessons[id];
    history.lessons[id] = {
      practised: true,
      passed: !!old?.passed || !helped,
      at: Math.max(old?.at || 0, at),
    };
    for (const key of lesson.wordIds) {
      const s = history.review[key];
      if (!s)
        history.review[key] = {
          step: 0,
          last: at,
          due: at + DAY,
          helped: !!helped,
          delayed: false,
        };
      else if (at >= s.last) {
        s.last = at;
        if (helped) {
          s.step = 0;
          s.helped = true;
          s.due = at + DAY;
        }
      }
    }
    return true;
  }
  function due(data, history, at = Date.now()) {
    const taught = new Set(
      data.lessons
        .filter((l) => history.lessons[l.id]?.practised)
        .flatMap((l) => l.wordIds),
    );
    return data.words
      .filter((w) => taught.has(w.id) && history.review[w.id]?.due <= at)
      .sort(
        (a, b) =>
          history.review[a.id].due - history.review[b.id].due ||
          a.id.localeCompare(b.id),
      );
  }
  function review(history, ids, helped, at = Date.now()) {
    if (!Number.isFinite(at) || at < 0) return;
    for (const id of new Set(ids)) {
      const old = history.review[id];
      if (!old || at < old.last) continue;
      const delayed = at - old.last >= DAY && old.due <= at;
      if (Array.isArray(helped) ? helped.includes(id) : helped) {
        old.step = 0;
        old.due = at + DAY;
        old.helped = true;
      } else if (delayed) {
        old.step = Math.min(2, old.step + 1);
        old.due = at + intervals[old.step] * DAY;
        old.helped = false;
        old.delayed = true;
      }
      old.last = at;
    }
  }
  function expose(history, ids, at = Date.now()) {
    if (!Number.isFinite(at)) return;
    for (const id of ids) {
      const s = history.review[id];
      if (s && at > s.last) {
        s.last = at;
        s.due = Math.max(s.due, at + DAY);
      }
    }
  }
  const next = (data, history) =>
    data.lessons.find((l) => ["ready", "retry"].includes(status(l, history)));
  root.WordPath = {
    DAY,
    fresh,
    validate,
    status,
    restore,
    complete,
    due,
    review,
    expose,
    next,
  };
})(globalThis);
