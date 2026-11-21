/* Self-reported pronunciation practice; never an automatic pronunciation grade. */
(function (root) {
  "use strict";
  const DAY = 86400000,
    intervals = [1, 3, 7, 14, 30, 60];
  const fresh = () => ({
    version: 1,
    turn: 0,
    items: {},
    session: null,
    lastCharacter: null,
  });
  const filled = (s) => typeof s === "string" && s.trim().length > 0;
  const finite = (n) => Number.isFinite(n) && n >= 0;
  function reviewed(r) {
    if (
      !r ||
      r.status !== "approved" ||
      r.language !== "ti" ||
      !filled(r.reviewer) ||
      !filled(r.rights) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(r.reviewedAt || "")
    )
      return false;
    const date = new Date(r.reviewedAt);
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === r.reviewedAt &&
      filled(r.sourceLocator) &&
      /^https:\/\//.test(r.sourceUrl || "")
    );
  }
  function localAudio(p) {
    return (
      typeof p === "string" &&
      /^(?:\.\.\/shared\/)?assets\/[A-Za-z0-9_./-]+\.(mp3|wav|ogg|m4a)$/.test(
        p,
      ) &&
      !p.replace(/^\.\.\/shared\//, "").includes("..")
    );
  }
  function ready(c) {
    const t = c?.target,
      a = c?.audio;
    return !!(
      reviewed(t) &&
      t.character === c.character &&
      filled(t.variety) &&
      ["syllabic-form", "contextual-word"].includes(t.kind) &&
      (t.kind !== "contextual-word" ||
        (filled(t.text) && t.text.includes(c.character))) &&
      (c.order !== 6 || t.kind === "contextual-word") &&
      reviewed(a) &&
      localAudio(a.normal) &&
      localAudio(a.slow)
    );
  }
  function validate(content) {
    if (
      !content ||
      content.schemaVersion !== 1 ||
      content.language !== "ti" ||
      content.direction !== "ltr" ||
      !Array.isArray(content.cards) ||
      !content.cards.length
    )
      throw Error(
        "Fidäl cards are unavailable. Return to Unit 1 and try again.",
      );
    const seen = new Set();
    for (const c of content.cards) {
      if (
        !filled(c.character) ||
        seen.has(c.character) ||
        !filled(c.family) ||
        !Number.isInteger(c.order) ||
        c.order < 1 ||
        c.order > 7
      )
        throw Error(
          "Some card data needs review. Your saved practice is safe.",
        );
      seen.add(c.character);
    }
    return content.cards;
  }
  function restore(raw, cards) {
    const h = fresh(),
      known = new Set(cards.map((c) => c.character));
    if (
      !raw ||
      raw.version !== 1 ||
      !raw.items ||
      typeof raw.items !== "object"
    )
      return h;
    h.turn = Number.isInteger(raw.turn) && raw.turn >= 0 ? raw.turn : 0;
    h.lastCharacter = known.has(raw.lastCharacter) ? raw.lastCharacter : null;
    for (const [char, i] of Object.entries(raw.items)) {
      if (
        !known.has(char) ||
        !i ||
        ![i.last, i.lastModel, i.due].every(finite) ||
        !Number.isInteger(i.step) ||
        i.step < 0 ||
        i.step >= intervals.length ||
        !Number.isInteger(i.nextTurn) ||
        i.nextTurn < 0
      )
        continue;
      const counts = [
        "attempts",
        "got",
        "almost",
        "need",
        "unscored",
        "delayedSelfRatings",
      ];
      if (!counts.every((k) => Number.isInteger(i[k]) && i[k] >= 0)) continue;
      h.items[char] = {
        ...i,
        sessions: Array.isArray(i.sessions)
          ? i.sessions.filter(filled).slice(-24)
          : [],
        events: Array.isArray(i.events)
          ? i.events.filter(filled).slice(-32)
          : [],
        recent: Array.isArray(i.recent)
          ? i.recent
              .filter(
                (e) =>
                  e &&
                  finite(e.at) &&
                  ["got", "almost", "need", "unscored"].includes(e.rating),
              )
              .slice(-12)
          : [],
      };
    }
    if (raw.session && filled(raw.session.id) && finite(raw.session.last))
      h.session = { ...raw.session };
    return h;
  }
  function session(h, time, id) {
    if (!h.session || time < h.session.last || time - h.session.last > 1800000)
      h.session = { id, last: time };
    else h.session.last = time;
    return h.session.id;
  }
  function plan(cards, h, time, family = "all") {
    const pool = cards.filter((c) => family === "all" || c.family === family);
    const due = (c) => {
      const i = h.items[c.character];
      return i && (i.due <= time || i.nextTurn <= h.turn);
    };
    const rank = (c) => (due(c) ? 0 : !h.items[c.character] ? 1 : 2);
    const sorted = pool
      .slice()
      .sort(
        (a, b) =>
          rank(a) - rank(b) ||
          (h.items[a.character]?.due || 0) - (h.items[b.character]?.due || 0),
      );
    // Interleave source families when possible; no unverified confusion pairs.
    const selected = [];
    while (sorted.length && selected.length < 5) {
      const previous = selected.at(-1)?.character || h.lastCharacter;
      let n = sorted.findIndex(
        (c) =>
          c.character !== previous &&
          c.family !== selected.at(-1)?.family &&
          rank(c) <= rank(sorted[0]),
      );
      if (n < 0) n = sorted.findIndex((c) => c.character !== previous);
      if (n < 0) n = 0;
      const [c] = sorted.splice(n, 1);
      selected.push(c);
    }
    return selected.map((c) => ({ character: c.character, supported: false }));
  }
  function model(h, char, time) {
    if (!h.items[char])
      h.items[char] = {
        last: time,
        lastModel: time,
        due: time + DAY,
        nextTurn: h.turn + 8,
        step: 0,
        attempts: 0,
        got: 0,
        almost: 0,
        need: 0,
        unscored: 0,
        delayedSelfRatings: 0,
        sessions: [],
        events: [],
        recent: [],
      };
    const i = h.items[char];
    if (i && time >= i.lastModel) i.lastModel = time;
  }
  function attempt(h, char, time) {
    const i = h.items[char];
    return {
      at: time,
      last: i?.last ?? time,
      lastModel: i?.lastModel ?? time,
      due: i?.due ?? time + DAY,
    };
  }
  function rate(
    h,
    char,
    rating,
    {
      time,
      id,
      sessionId,
      modelHeard = false,
      supported = false,
      ready: usable = false,
      recall = attempt(h, char, time),
    },
  ) {
    if (
      !["got", "almost", "need", "unscored"].includes(rating) ||
      !finite(time) ||
      !filled(id) ||
      !filled(sessionId)
    )
      return null;
    if (rating !== "unscored" && (!modelHeard || !usable)) return null;
    const old = h.items[char];
    if (old && (time < old.last || old.events.includes(id))) return null;
    const i = old || {
      last: time,
      lastModel: 0,
      due: time + DAY,
      nextTurn: h.turn + 8,
      step: 0,
      attempts: 0,
      got: 0,
      almost: 0,
      need: 0,
      unscored: 0,
      delayedSelfRatings: 0,
      sessions: [],
      events: [],
      recent: [],
    };
    const delayed = !!(
      old &&
      rating === "got" &&
      !supported &&
      finite(recall.at) &&
      recall.lastModel > 0 &&
      recall.at <= time &&
      recall.due <= recall.at &&
      recall.at - recall.last >= DAY &&
      recall.at - recall.lastModel >= DAY &&
      !old.sessions.includes(sessionId)
    );
    if (delayed) {
      i.step = Math.min(i.step + 1, intervals.length - 1);
      i.delayedSelfRatings++;
      i.sessions = [...i.sessions, sessionId].slice(-24);
    }
    if (rating === "need" || rating === "almost") i.step = 0;
    if (rating === "got") {
      if (!old || !recall.lastModel || delayed)
        i.due = time + intervals[i.step] * DAY;
      i.nextTurn = h.turn + 12;
    } else if (rating === "almost") {
      i.due = time + DAY / 2;
      i.nextTurn = h.turn + 5;
    } else if (rating === "need") {
      i.due = time + 600000;
      i.nextTurn = h.turn + 3;
    } else {
      i.due = old ? Math.min(i.due, time + DAY) : time + DAY;
      i.nextTurn = h.turn + 8;
    }
    i.attempts++;
    i[rating]++;
    i.last = time;
    if (rating === "got" && !i.sessions.includes(sessionId))
      i.sessions = [...i.sessions, sessionId].slice(-24);
    if (modelHeard) i.lastModel = time;
    i.events = [...i.events, id].slice(-32);
    i.recent = [
      ...i.recent,
      { rating, at: time, supported, reference: modelHeard, delayed },
    ].slice(-12);
    h.items[char] = i;
    if (h.session) h.session.last = time;
    return { delayed, due: i.due, step: i.step };
  }
  function advance(h, char) {
    h.turn++;
    h.lastCharacter = char;
  }
  function revisit(queue, index, rating, count) {
    if (
      count >= 2 ||
      !["need", "almost"].includes(rating) ||
      queue[index].supported
    )
      return false;
    const gap = rating === "need" ? 2 : 3;
    if (queue.length - index - 1 < gap) return false;
    queue.splice(index + gap + 1, 0, {
      character: queue[index].character,
      supported: true,
    });
    return true;
  }
  root.PronunciationCards = {
    DAY,
    intervals,
    fresh,
    validate,
    restore,
    ready,
    session,
    plan,
    model,
    attempt,
    rate,
    advance,
    revisit,
  };
})(globalThis);
