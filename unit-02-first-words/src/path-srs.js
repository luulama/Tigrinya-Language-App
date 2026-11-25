/* Local, skill-specific spaced practice for Unit 2 onward. No mastery prediction. */
(function (root) {
  "use strict";
  const DAY = 86400000,
    intervals = [1, 3, 7, 14, 30, 60],
    gaps = [2, 4, 7, 11];
  const validTime = (n) => Number.isFinite(n) && n >= 0;
  const key = (id, skill) => `word:${id}:${skill}`;
  const serial = (history) =>
    Object.values(history.lessons).filter((s) => s.passed).length;
  const skills = new Set([
    "recognition",
    "reading",
    "entry",
    "construction",
    "locating",
  ]);
  const uid = () =>
    root.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  function state(history) {
    return (history.srs ??= {
      version: 1,
      prompt: 0,
      items: {},
      session: null,
    });
  }
  function restore(value, data) {
    const result = { version: 1, prompt: 0, items: {}, session: null };
    if (value?.version !== 1 || !value.items || typeof value.items !== "object")
      return result;
    result.prompt =
      Number.isSafeInteger(value.prompt) && value.prompt >= 0
        ? value.prompt
        : 0;
    if (
      value.session &&
      typeof value.session.id === "string" &&
      validTime(value.session.lastSeen)
    )
      result.session = {
        id: value.session.id.slice(0, 100),
        lastSeen: value.session.lastSeen,
      };
    for (const [id, item] of Object.entries(value.items)) {
      const word = data.words.find((w) => w.id === item?.wordId);
      if (
        !word ||
        !skills.has(item.skill) ||
        !["word", "form"].includes(item.kind)
      )
        continue;
      if (item.kind === "word" && id !== key(word.id, item.skill)) continue;
      if (
        item.kind === "form" &&
        (!word.letters.includes(item.character) ||
          id !== `form:${item.character}:locating`)
      )
        continue;
      if (
        !["introducedAt", "lastExposureAt", "lastReviewedAt", "dueAt"].every(
          (n) => validTime(item[n]),
        )
      )
        continue;
      if (
        ![
          "step",
          "pathStep",
          "introducedLesson",
          "lastLesson",
          "dueLesson",
          "lastPrompt",
          "correct",
          "incorrect",
          "hints",
        ].every((n) => Number.isSafeInteger(item[n]) && item[n] >= 0) ||
        item.step >= intervals.length ||
        item.pathStep >= gaps.length
      )
        continue;
      result.items[id] = {
        ...item,
        sessions: Array.isArray(item.sessions)
          ? item.sessions.filter((x) => typeof x === "string").slice(-24)
          : [],
        contexts: Array.isArray(item.contexts)
          ? item.contexts.filter((x) => typeof x === "string").slice(-24)
          : [],
        recent: Array.isArray(item.recent)
          ? item.recent
              .filter(
                (e) =>
                  e &&
                  validTime(e.at) &&
                  ["correct", "incorrect", "hint"].includes(e.outcome) &&
                  typeof e.session === "string" &&
                  typeof e.lesson === "string",
              )
              .slice(-12)
          : [],
        events: Array.isArray(item.events)
          ? item.events.filter((x) => typeof x === "string").slice(-32)
          : [],
        weak: item.weak === true,
      };
    }
    return result;
  }
  function context(history, lesson, at = Date.now()) {
    if (root.DeveloperPreview?.readOnly)
      return {
        at,
        lesson,
        serial: serial(history),
        session: "developer-preview",
        prompt: history.srs?.prompt || 0,
      };
    const s = state(history),
      old = s.session;
    if (!old || at - old.lastSeen > 30 * 60000)
      s.session = { id: uid(), lastSeen: at };
    else if (at >= old.lastSeen) old.lastSeen = at;
    return {
      at,
      lesson,
      serial: serial(history),
      session: s.session.id,
      prompt: s.prompt,
    };
  }
  function make(word, skill, ctx, kind = "word", character = null) {
    return {
      wordId: word.id,
      kind,
      character,
      skill,
      introducedAt: ctx.at,
      lastExposureAt: ctx.at,
      lastReviewedAt: 0,
      introducedLesson: ctx.serial,
      lastLesson: ctx.serial,
      dueLesson: ctx.serial + 2,
      dueAt: ctx.at + DAY,
      lastPrompt: ctx.prompt,
      step: 0,
      pathStep: 0,
      correct: 0,
      incorrect: 0,
      hints: 0,
      weak: false,
      sessions: [],
      contexts: [],
      recent: [],
      events: [],
    };
  }
  function open(data, history, at = Date.now()) {
    state(history);
    context(history, "open", at);
    // Migrate the old local word schedule without inventing success counts or sessions.
    for (const word of data.words) {
      const old = history.review[word.id];
      if (!old) continue;
      for (const skill of ["recognition", "reading"]) {
        const id = key(word.id, skill);
        if (history.srs.items[id]) continue;
        const item = make(word, skill, {
          at: old.last,
          serial: serial(history),
          prompt: 0,
        });
        item.dueAt = old.due;
        item.legacyImported = true;
        item.step = Math.min(2, old.step);
        item.weak = old.helped === true;
        history.srs.items[id] = item;
      }
    }
  }
  function teach(data, history, word, ctx, extra = []) {
    for (const skill of new Set(["recognition", "reading", ...extra])) {
      const id = key(word.id, skill),
        s = state(history).items;
      if (!s[id]) s[id] = make(word, skill, ctx);
      const item = s[id];
      if (ctx.at < item.lastExposureAt) continue;
      item.lastExposureAt = ctx.at;
      item.lastLesson = ctx.serial;
      item.lastPrompt = ctx.prompt;
      item.dueLesson = Math.max(item.dueLesson, ctx.serial + 2);
    }
    for (const item of Object.values(state(history).items))
      if (
        (item.wordId === word.id ||
          (item.kind === "form" && word.letters.includes(item.character))) &&
        ctx.at >= item.lastExposureAt
      ) {
        item.lastExposureAt = ctx.at;
        item.lastLesson = ctx.serial;
        item.lastPrompt = ctx.prompt;
        item.dueLesson = Math.max(item.dueLesson, ctx.serial + 2);
      }
  }
  function form(history, word, character, ctx, modeled) {
    if (!word.letters.includes(character)) return null;
    const id = `form:${character}:locating`,
      s = state(history).items;
    if (!s[id]) s[id] = make(word, "locating", ctx, "form", character);
    if (modeled && ctx.at >= s[id].lastExposureAt) {
      s[id].lastExposureAt = ctx.at;
      s[id].lastLesson = ctx.serial;
      s[id].lastPrompt = ctx.prompt;
    }
    return id;
  }
  function itemFor(history, word, kind, ctx, character) {
    if (kind === "position" || kind === "locate")
      return form(history, word, character, ctx, false);
    const skill = {
      choose: "recognition",
      read: "reading",
      type: "entry",
      build: "construction",
    }[kind];
    if (!skill) return null;
    const id = key(word.id, skill),
      s = state(history).items;
    if (!s[id]) s[id] = make(word, skill, ctx);
    return id;
  }
  function answer(history, id, event) {
    const s = state(history),
      item = s.items[id];
    if (
      !item ||
      typeof event.id !== "string" ||
      !event.id ||
      typeof event.session !== "string" ||
      typeof event.lesson !== "string" ||
      !Number.isSafeInteger(event.serial) ||
      event.serial < 0 ||
      !Number.isSafeInteger(event.prompt) ||
      event.prompt < 0 ||
      !validTime(event.at) ||
      event.at < Math.max(item.lastReviewedAt, item.lastExposureAt) ||
      !["correct", "incorrect", "hint"].includes(event.outcome) ||
      item.events.includes(event.id)
    )
      return false;
    const outcome = event.outcome,
      supported = event.supported === true;
    const delayed =
      outcome === "correct" &&
      !supported &&
      event.at - item.lastExposureAt >= DAY &&
      item.dueAt <= event.at &&
      !item.sessions.includes(event.session);
    item.events.push(event.id);
    item.events = item.events.slice(-32);
    item.recent.push({
      at: event.at,
      outcome,
      supported,
      session: event.session,
      lesson: event.lesson,
      kind: event.kind,
    });
    item.recent = item.recent.slice(-12);
    item.lastReviewedAt = event.at;
    item.lastLesson = event.serial;
    item.lastPrompt = event.prompt;
    if (outcome !== "correct") {
      item[outcome === "hint" ? "hints" : "incorrect"]++;
      item.weak = true;
      item.step = 0;
      item.pathStep = 0;
      item.dueAt = Math.min(item.dueAt, event.at + 10 * 60000);
      item.dueLesson = event.serial + 2;
      item.lastExposureAt = event.at;
    } else {
      item.correct++;
      if (delayed) {
        item.step = Math.min(intervals.length - 1, item.step + 1);
        item.sessions.push(event.session);
        item.sessions = item.sessions.slice(-24);
        item.dueAt = event.at + intervals[item.step] * DAY;
      }
      if (
        !supported &&
        event.serial - item.introducedLesson >= 2 &&
        event.serial >= item.dueLesson
      )
        item.pathStep = Math.min(gaps.length - 1, item.pathStep + 1);
      item.dueLesson = event.serial + gaps[item.pathStep];
      if (!delayed && item.dueAt <= event.at) item.dueAt = event.at + DAY;
      item.weak = supported && item.weak;
      if (!item.contexts.includes(event.lesson))
        item.contexts.push(event.lesson);
      item.contexts = item.contexts.slice(-24);
      item.lastExposureAt = event.at; // Feedback now reveals the model; later recall needs a new gap.
    }
    for (const other of Object.values(s.items))
      if (
        (other.wordId === (event.wordId || item.wordId) ||
          (other.kind === "form" &&
            event.characters?.includes(other.character))) &&
        event.at >= other.lastExposureAt
      ) {
        other.lastExposureAt = event.at;
        other.lastLesson = event.serial;
        other.lastPrompt = event.prompt;
      }
    return true;
  }
  function plan(
    data,
    history,
    { lesson, exclude = [], at = Date.now(), limit = 2, manual = false } = {},
  ) {
    const s = state(history),
      n = serial(history),
      excluded = new Set(exclude),
      candidates = [];
    for (const [id, item] of Object.entries(s.items)) {
      if (!history.review[item.wordId] || excluded.has(item.wordId)) continue;
      const elapsed =
        at >= item.lastExposureAt &&
        at - item.lastExposureAt >= (item.weak ? 10 * 60000 : DAY) &&
        item.dueAt <= at;
      const gap =
        n >= item.dueLesson &&
        n - item.lastLesson >= 2 &&
        s.prompt - item.lastPrompt >= 3;
      if (!manual && !elapsed && !gap) continue;
      if (
        !manual &&
        !elapsed &&
        (n - item.lastLesson < 2 ||
          s.prompt - item.lastPrompt < 3 ||
          item.contexts.at(-1) === lesson)
      )
        continue;
      const word =
        item.kind === "form"
          ? data.words.find(
              (w) =>
                history.review[w.id] &&
                !excluded.has(w.id) &&
                w.id !== item.wordId &&
                w.letters.includes(item.character),
            ) || data.words.find((w) => w.id === item.wordId)
          : data.words.find((w) => w.id === item.wordId);
      if (!word || excluded.has(word.id)) continue;
      candidates.push({
        id,
        word,
        character: item.character,
        kind:
          item.kind === "form"
            ? "locate"
            : {
                recognition: "choose",
                reading: "read",
                entry: "type",
                construction: "build",
              }[item.skill],
        reason: elapsed ? "time" : gap ? "lessons" : "practice",
        priority: item.weak ? 0 : elapsed ? 1 : gap ? 2 : 3,
        item,
      });
    }
    candidates.sort(
      (a, b) =>
        a.priority - b.priority ||
        a.item.lastReviewedAt - b.item.lastReviewedAt ||
        a.item.dueAt - b.item.dueAt ||
        a.id.localeCompare(b.id),
    );
    const used = new Set(),
      result = [];
    for (const c of candidates) {
      if (!c.kind || used.has(c.word.id)) continue;
      used.add(c.word.id);
      result.push({
        id: c.id,
        word: c.word,
        kind: c.kind,
        character: c.character,
        reason: c.reason,
      });
      if (result.length >= limit) break;
    }
    return result;
  }
  function focus(data, lesson) {
    if (lesson.kind !== "introduce") return lesson.wordIds;
    return lesson.wordIds.filter(
      (id) =>
        data.lessons.find(
          (l) =>
            l.available && l.kind === "introduce" && l.wordIds.includes(id),
        )?.id === lesson.id,
    );
  }
  function summary(history) {
    const items = Object.values(state(history).items);
    return {
      items: items.length,
      weak: items.filter((i) => i.weak).length,
      attempts: items.reduce(
        (n, i) => n + i.correct + i.incorrect + i.hints,
        0,
      ),
      independent: items.reduce((n, i) => n + i.sessions.length, 0),
    };
  }
  root.PathSRS = {
    DAY,
    intervals,
    gaps,
    key,
    restore,
    open,
    context,
    teach,
    form,
    itemFor,
    answer,
    plan,
    focus,
    summary,
    advance: (history) => ++state(history).prompt,
    defer(history, id, ctx) {
      const item = state(history).items[id];
      if (item) {
        item.lastLesson = ctx.serial;
        item.lastPrompt = ctx.prompt;
      }
    },
  };
  for (const name of [
    "open",
    "teach",
    "form",
    "itemFor",
    "answer",
    "advance",
    "defer",
  ]) {
    const write = root.PathSRS[name];
    root.PathSRS[name] = (...args) =>
      root.DeveloperPreview?.readOnly ? false : write(...args);
  }
})(globalThis);
