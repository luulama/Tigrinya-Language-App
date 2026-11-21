/* Reading choices only. This collection never writes to course or review evidence. */
(function (root) {
  "use strict";
  const KEY = "tigrinya.stories.v1";
  const fresh = () => ({
    version: 1,
    save: false,
    size: 24,
    evening: false,
    stories: {},
  });
  function validate(data) {
    if (
      !data ||
      data.schemaVersion !== 1 ||
      data.language !== "ti" ||
      data.direction !== "ltr" ||
      !Array.isArray(data.stories) ||
      data.stories.length !== 20
    )
      throw Error(
        "The story collection could not load. Your saved reading choices are safe.",
      );
    const seen = new Set();
    for (const s of data.stories) {
      if (
        !/^[a-z]+(?:-[a-z]+)*$/.test(s.id) ||
        seen.has(s.id) ||
        !s.title ||
        !s.revision ||
        !Array.isArray(s.paragraphs) ||
        s.paragraphs.length < 8 ||
        !s.illustrations?.length
      )
        throw Error(
          "A story needs repair. Return to the library and try again.",
        );
      seen.add(s.id);
      if (
        s.paragraphs.some(
          (p, n) =>
            p.id !== `p${n + 1}` ||
            typeof p.text !== "string" ||
            p.text.length < 30,
        )
      )
        throw Error(
          "Some story text is unavailable. Your saved choices are safe.",
        );
      if (
        s.illustrations.some(
          (i) => !/^assets\/[a-z-]+\.svg$/.test(i.src) || !i.alt,
        )
      )
        throw Error("Some illustration data needs repair.");
    }
    return data.stories;
  }
  function restore(raw, collection) {
    const state = fresh();
    if (
      !raw ||
      raw.version !== 1 ||
      raw.save !== true ||
      !raw.stories ||
      typeof raw.stories !== "object" ||
      Array.isArray(raw.stories)
    )
      return state;
    state.save = true;
    if ([20, 24, 28, 32].includes(raw.size)) state.size = raw.size;
    state.evening = raw.evening === true;
    for (const s of collection) {
      const record = raw.stories[s.id];
      if (
        !record ||
        typeof record.bookmark !== "boolean" ||
        typeof record.finished !== "boolean" ||
        !Number.isInteger(record.position) ||
        record.position < 0
      )
        continue;
      const compatible = record.revision === s.revision;
      state.stories[s.id] = {
        revision: s.revision,
        bookmark: record.bookmark,
        finished: compatible && record.finished,
        position: compatible
          ? Math.min(record.position, s.paragraphs.length - 1)
          : 0,
      };
    }
    return state;
  }
  function item(state, story) {
    return (state.stories[story.id] ??= {
      revision: story.revision,
      bookmark: false,
      finished: false,
      position: 0,
    });
  }
  function find(collection, id) {
    return collection.find((s) => s.id === id) || null;
  }
  function filter(collection, state, mode, query = "") {
    const text = query
      .normalize("NFC")
      .toLocaleLowerCase()
      .trim()
      .slice(0, 100);
    return collection.filter(
      (s) =>
        (mode !== "saved" || state.stories[s.id]?.bookmark) &&
        (mode !== "finished" || state.stories[s.id]?.finished) &&
        (!text ||
          `${s.title} ${s.editorialTitle}`
            .normalize("NFC")
            .toLocaleLowerCase()
            .includes(text)),
    );
  }
  function store(storage, collection) {
    let state = fresh(),
      error = "",
      blocked = false;
    try {
      const raw = storage.getItem(KEY);
      if (raw) {
        state = restore(JSON.parse(raw), collection);
        if (!state.save) {
          blocked = true;
          error =
            "Saved reading data needs a newer or repaired version. It has been kept unchanged; reading still works in this tab.";
        }
      }
    } catch (e) {
      blocked = true;
      error =
        "Saved reading choices could not be opened. They have been kept unchanged; reading still works in this tab.";
    }
    function persist() {
      if (!state.save || blocked) return;
      try {
        storage.setItem(KEY, JSON.stringify(state));
        error = "";
      } catch (e) {
        error =
          "Saving is unavailable. Your reading choices still work in this tab; the previous saved copy is unchanged.";
      }
    }
    return {
      get state() {
        return state;
      },
      get error() {
        return error;
      },
      get blocked() {
        return blocked;
      },
      persist,
      enable() {
        if (blocked) return false;
        state.save = true;
        persist();
        return !error;
      },
      disable() {
        try {
          storage.removeItem(KEY);
          state.save = false;
          error = "";
          blocked = false;
          return true;
        } catch (e) {
          error =
            "Device saving could not be stopped. Your current reading still works.";
          return false;
        }
      },
      bookmark(story) {
        const r = item(state, story);
        r.bookmark = !r.bookmark;
        persist();
        return r.bookmark;
      },
      position(story, n) {
        if (!Number.isInteger(n) || n < 0 || n >= story.paragraphs.length)
          return false;
        item(state, story).position = n;
        persist();
        return true;
      },
      finish(story) {
        const r = item(state, story);
        r.finished = true;
        r.position = story.paragraphs.length - 1;
        persist();
      },
      size(n) {
        if ([20, 24, 28, 32].includes(n)) {
          state.size = n;
          persist();
        }
      },
      evening(value) {
        state.evening = !!value;
        persist();
      },
    };
  }
  root.StoryLibrary = {
    KEY,
    fresh,
    validate,
    restore,
    item,
    find,
    filter,
    store,
  };
})(globalThis);
