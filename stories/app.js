(function (root) {
  "use strict";
  const doc = root.document,
    app = doc.querySelector("#storyApp"),
    panel = doc.querySelector("#storySettings");
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const bookmarkIcon =
    '<svg viewBox="0 0 18 23" aria-hidden="true"><path d="M2 2h14v19l-7-5-7 5Z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  let C,
    collection,
    store,
    current = null,
    mode = "all",
    query = "",
    libraryScroll = 0,
    lastOpened = null,
    frame = 0,
    ready = false;
  function announce(text) {
    doc.querySelector("#storyLive").textContent = text;
  }
  function applySettings() {
    doc.body.dataset.storyEvening = String(store.state.evening);
    doc.documentElement.style.setProperty(
      "--reading-size",
      store.state.size + "px",
    );
  }
  function storageNotice() {
    const el = doc.querySelector("#storySaveNote"),
      text =
        store.error ||
        (store.state.save
          ? "Reading choices are saved on this device."
          : "Reading choices stay in this tab. Save in Reading settings to keep them.");
    if (el.textContent !== text) el.textContent = text;
  }
  function settings() {
    if (!store) return;
    storageNotice();
    panel.innerHTML = `<h2>Make yourself comfortable</h2><label for="storyTextSize">Text size</label><select id="storyTextSize">${[
      [20, "Small"],
      [24, "Comfortable"],
      [28, "Large"],
      [32, "Extra large"],
    ]
      .map(
        ([n, label]) =>
          `<option value="${n}" ${n === store.state.size ? "selected" : ""}>${label}</option>`,
      )
      .join(
        "",
      )}</select><label><input id="storyEvening" type="checkbox" ${store.state.evening ? "checked" : ""}>Evening view</label><label><input id="storySaving" type="checkbox" ${store.state.save ? "checked" : ""} ${store.blocked ? "disabled" : ""}>Save reading choices on this device</label><p>Bookmarks, your place and marked-read stories stay in this tab by default. Saving is optional. No accounts, tracking or uploads.</p><p id="storyStorageStatus" role="status">${escape(store.error || (store.state.save ? "Reading choices are saved on this device." : "Reading choices are kept only in this tab."))}</p><p>Stopping saving removes only this Stories profile. Course progress and other browser data are untouched. Shared-device users share this reading profile.</p><button type="button" data-story="close-settings">Close settings</button>`;
  }
  function picture(image, classes = "", lazy = false) {
    return `<figure class="${classes}"><img src="${escape(image.src)}" alt="${escape(image.alt)}" width="960" height="640" ${lazy ? 'loading="lazy"' : ""} decoding="async"><span class="story-image-error" role="status" hidden>Illustration unavailable. The complete story is still here to read.</span></figure>`;
  }
  function card(s) {
    const state = store.state.stories[s.id],
      saved = state?.bookmark,
      finished = state?.finished,
      continuing = state?.position > 0 && !finished;
    return `<article class="story-card" data-story-id="${s.id}"><a class="story-open" href="#story/${s.id}" data-story="open" data-id="${s.id}">${picture(s.illustrations[0], "story-cover", true)}<div class="story-card-body"><span class="story-card-number">STORY ${String(s.order).padStart(2, "0")}</span><h2 class="story-title" lang="ti" dir="ltr">${escape(s.title)}</h2><p class="story-card-meta">${s.paragraphs.length} paragraphs · ${finished ? "Marked as read" : continuing ? "Continue reading" : "Read a story"}</p></div></a><div class="story-card-bottom"><button type="button" data-story="bookmark" data-id="${s.id}" aria-pressed="${!!saved}" aria-label="${saved ? "Remove from" : "Add to"} read later: ${escape(s.title)}">${bookmarkIcon}${saved ? "Saved for later" : "Read later"}</button><span aria-hidden="true">${continuing ? "Continue →" : "Open →"}</span></div></article>`;
  }
  function results() {
    const shown = C.filter(collection, store.state, mode, query);
    doc.querySelector("#storyResults").innerHTML = shown.length
      ? `<div class="story-grid">${shown.map(card).join("")}</div>`
      : `<div class="story-empty"><h2>${query ? "No matching titles." : mode === "saved" ? "A little shelf for later." : "Your reading begins here."}</h2><p>${query ? "Try another title or clear the search." : mode === "saved" ? "Choose Read later on a story you want to keep close." : "Mark a story read when you finish. There is no rush."}</p><button type="button" data-story="reset">Show all 20 stories</button></div>`;
    doc.querySelector("#storyResultCount").textContent =
      `${shown.length} ${shown.length === 1 ? "story" : "stories"}${query ? " matching your search" : ""}`;
    for (const b of doc.querySelectorAll('[data-story="filter"]'))
      b.setAttribute("aria-pressed", String(b.dataset.mode === mode));
  }
  function library(restoreScroll = false) {
    current = null;
    doc.title = "Stories · Tigrinya";
    app.innerHTML = `<section class="story-hero" aria-labelledby="storyLibraryHeading"><div><p class="story-kicker">20 LITTLE ADVENTURES · A QUIET ENDING</p><h1 id="storyLibraryHeading" tabindex="-1">Stories</h1><p>Open a little wonder.<br>Come home to a gentle ending.</p><p class="story-preview-note">Complete original story drafts in Tigrinya. Fluent-speaker review is pending.</p></div><img src="assets/lost-star.svg" alt="A blue bird helps a glowing star return to the night sky." width="960" height="640"></section><div class="story-toolbar"><div class="story-tabs" role="group" aria-label="Story shelves"><button type="button" data-story="filter" data-mode="all" aria-pressed="${mode === "all"}">All stories</button><button type="button" data-story="filter" data-mode="saved" aria-pressed="${mode === "saved"}">Read later</button><button type="button" data-story="filter" data-mode="finished" aria-pressed="${mode === "finished"}">Marked as read</button></div><div class="story-search"><label for="storySearch">Find a title</label><input id="storySearch" type="search" maxlength="100" value="${escape(query)}" autocomplete="off"></div></div><p id="storyResultCount" class="story-count" role="status"></p><section id="storyResults" aria-label="Story collection"></section>`;
    results();
    if (restoreScroll) {
      root.scrollTo({ top: libraryScroll, behavior: "instant" });
      app
        .querySelector(`[data-story="open"][data-id="${lastOpened}"]`)
        ?.focus({ preventScroll: true });
    } else {
      root.scrollTo({ top: 0, behavior: "instant" });
      doc.querySelector("#storyLibraryHeading").focus({ preventScroll: true });
    }
  }
  function progress(n) {
    const p = doc.querySelector("#readingPosition"),
      meter = doc.querySelector("#readingMeter");
    if (!p || !current) return;
    p.textContent = `Paragraph ${n + 1} of ${current.paragraphs.length}`;
    meter.style.width = `${((n + 1) / current.paragraphs.length) * 100}%`;
    meter.parentElement.setAttribute("aria-valuenow", String(n + 1));
  }
  function reader(s, resume = true) {
    current = s;
    lastOpened = s.id;
    doc.title = `${s.title} · Stories · Tigrinya`;
    const state = C.item(store.state, s),
      position = state.position;
    const native = (p, n) =>
      `<p id="story-${p.id}" data-paragraph="${n}" tabindex="-1">${escape(p.text)}</p>${s.illustrations
        .filter((i) => i.afterParagraph === n + 1)
        .map((i) => picture(i, "story-illustration"))
        .join("")}`;
    const index = collection.indexOf(s),
      previous = collection[index - 1],
      next = collection[index + 1];
    app.innerHTML = `<article class="story-reader" data-reading-story="${s.id}"><div class="story-reader-bar"><button type="button" data-story="library">← Stories</button><div class="story-reader-progress"><span id="readingPosition">Paragraph 1 of ${s.paragraphs.length}</span><div class="story-meter" role="progressbar" aria-label="Reading position" aria-valuemin="1" aria-valuemax="${s.paragraphs.length}" aria-valuenow="1"><i id="readingMeter"></i></div></div></div><header class="story-reader-intro"><span class="story-kicker">STORY ${s.order} OF 20</span><h1 class="story-title" lang="ti" dir="ltr" tabindex="-1">${escape(s.title)}</h1><p class="story-review-label">${s.reviewStatus === "approved" ? "Fluent-speaker review recorded for this version." : "Original story draft · Fluent Tigrinya review pending."}</p><div class="story-reader-actions"><button type="button" data-story="bookmark" data-id="${s.id}" aria-pressed="${state.bookmark}">${state.bookmark ? "Saved for later" : "Read later"}</button><button type="button" data-story="beginning">Read from the beginning</button></div></header><div class="story-prose" lang="ti" dir="ltr">${s.paragraphs.map(native).join("")}</div><footer class="story-reader-ending"><button type="button" data-story="finish" ${state.finished ? "disabled" : ""}>${state.finished ? "Marked as read" : "Mark as read"}</button><p id="storyFinishStatus" role="status">${state.finished ? "You marked this story read. You can return to it whenever you like." : "A quiet stopping place. Mark it read when you are ready."}</p><nav class="story-reader-links" aria-label="Between stories">${previous ? `<a href="#story/${previous.id}" data-story="open" data-id="${previous.id}">← <span><small>Previous story</small><br><span class="story-title" lang="ti" dir="ltr">${escape(previous.title)}</span></span></a>` : '<button type="button" data-story="library">All Stories</button>'}${next ? `<a href="#story/${next.id}" data-story="open" data-id="${next.id}"><span><small>Next story</small><br><span class="story-title" lang="ti" dir="ltr">${escape(next.title)}</span></span> →</a>` : '<button type="button" data-story="library">Back to all 20 stories →</button>'}</nav></footer></article>`;
    root.scrollTo({ top: 0, behavior: "instant" });
    app.querySelector("h1").focus({ preventScroll: true });
    progress(0);
    if (resume && position > 0 && !state.finished)
      root.requestAnimationFrame(() => {
        if (current?.id !== s.id) return;
        const p = doc.querySelector(`#story-${s.paragraphs[position].id}`);
        p.scrollIntoView({ block: "start", behavior: "instant" });
        p.focus({ preventScroll: true });
        progress(position);
        announce(`Resuming at paragraph ${position + 1}.`);
      });
  }
  function route() {
    if (!ready) return;
    const match = root.location.hash.match(/^#story\/([a-z-]+)$/);
    if (!root.location.hash || root.location.hash === "#library") {
      library(true);
      return;
    }
    const s = match && C.find(collection, match[1]);
    if (s) reader(s);
    else {
      current = null;
      doc.title = "Stories · Tigrinya";
      app.innerHTML =
        '<div class="story-empty"><h1 tabindex="-1">That story could not be found.</h1><p>Your reading choices are safe. Choose a story from the collection.</p><button type="button" data-story="library">Open Stories</button></div>';
      app.querySelector("h1").focus();
    }
  }
  function navigate(id) {
    if (!current) libraryScroll = root.scrollY;
    const hash = id ? "#story/" + id : "#library";
    if (root.location.hash === hash) {
      id ? reader(C.find(collection, id)) : library(true);
    } else root.location.hash = hash;
  }
  function updatePlace() {
    frame = 0;
    if (!current) return;
    const paragraphs = [...doc.querySelectorAll("[data-paragraph]")];
    const target = paragraphs.reduce(
      (best, p) =>
        Math.abs(p.getBoundingClientRect().top - 140) <
        Math.abs(best.getBoundingClientRect().top - 140)
          ? p
          : best,
      paragraphs[0],
    );
    if (!target) return;
    const n = Number(target.dataset.paragraph);
    if (store.state.stories[current.id]?.position !== n) {
      store.position(current, n);
      progress(n);
      storageNotice();
    }
  }
  doc.addEventListener("click", (event) => {
    const b = event.target.closest("[data-story]");
    if (!b || b.disabled || !ready) return;
    const action = b.dataset.story;
    if (action === "open") {
      event.preventDefault();
      navigate(b.dataset.id);
    }
    if (action === "library") {
      event.preventDefault();
      navigate(null);
    }
    if (action === "filter") {
      mode = b.dataset.mode;
      results();
      announce("Story shelf updated.");
    }
    if (action === "reset") {
      query = "";
      mode = "all";
      doc.querySelector("#storySearch").value = "";
      results();
      doc.querySelector("#storySearch").focus();
    }
    if (action === "bookmark") {
      const s = C.find(collection, b.dataset.id);
      if (!s) return;
      const saved = store.bookmark(s);
      b.setAttribute("aria-pressed", String(saved));
      b.innerHTML =
        (current ? "" : bookmarkIcon) +
        (saved ? "Saved for later" : "Read later");
      if (!current) {
        b.setAttribute(
          "aria-label",
          `${saved ? "Remove from" : "Add to"} read later: ${s.title}`,
        );
        if (mode === "saved" && !saved) {
          results();
          doc.querySelector('[data-mode="saved"]').focus();
        }
      }
      settings();
      announce(
        (saved ? "Kept for later." : "Removed from read later.") +
          (store.state.save
            ? ""
            : " Choose device saving to keep it after leaving."),
      );
    }
    if (action === "beginning" && current) {
      store.position(current, 0);
      reader(current, false);
    }
    if (action === "finish" && current) {
      store.finish(current);
      b.textContent = "Marked as read";
      b.disabled = true;
      doc.querySelector("#storyFinishStatus").textContent =
        "You marked this story read. It stays here to revisit.";
      progress(current.paragraphs.length - 1);
      settings();
      announce("Story marked as read. No course progress was changed.");
    }
    if (action === "settings") {
      panel.hidden = !panel.hidden;
      b.setAttribute("aria-expanded", String(!panel.hidden));
      if (!panel.hidden) {
        settings();
        panel.querySelector("select").focus();
      }
    }
    if (action === "close-settings") {
      panel.hidden = true;
      const trigger = doc.querySelector('[data-story="settings"]');
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
    }
  });
  doc.addEventListener("input", (event) => {
    if (event.target.id === "storySearch") {
      query = event.target.value;
      results();
    }
  });
  panel.addEventListener("change", (event) => {
    if (event.target.id === "storyTextSize")
      store.size(Number(event.target.value));
    if (event.target.id === "storyEvening") store.evening(event.target.checked);
    if (event.target.id === "storySaving") {
      if (event.target.checked) store.enable();
      else store.disable();
      settings();
      panel.querySelector("#storySaving").focus();
    }
    applySettings();
    const status = doc.querySelector("#storyStorageStatus");
    if (status)
      status.textContent =
        store.error ||
        (store.state.save
          ? "Reading choices are saved on this device."
          : "Reading choices are kept only in this tab.");
  });
  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      panel.hidden = true;
      const b = doc.querySelector('[data-story="settings"]');
      b.setAttribute("aria-expanded", "false");
      b.focus();
    }
  });
  doc.addEventListener(
    "error",
    (event) => {
      const img = event.target;
      if (img.tagName !== "IMG") return;
      img.hidden = true;
      const fallback = img.parentElement.querySelector(".story-image-error");
      if (fallback) fallback.hidden = false;
    },
    true,
  );
  root.addEventListener(
    "scroll",
    () => {
      if (current && !frame) frame = root.requestAnimationFrame(updatePlace);
    },
    { passive: true },
  );
  root.addEventListener("hashchange", route);
  root.addEventListener("pagehide", () => {
    if (store) store.persist();
  });
  try {
    C = root.StoryLibrary;
    if (!C)
      throw Error(
        "The story reader could not load. Your saved reading choices are safe.",
      );
    collection = C.validate(root.StoryLibraryContent);
    const storage = {
      getItem: (key) => root.localStorage.getItem(key),
      setItem: (key, value) => root.localStorage.setItem(key, value),
      removeItem: (key) => root.localStorage.removeItem(key),
    };
    store = C.store(storage, collection);
    ready = true;
    applySettings();
    settings();
    if (root.location.pathname.includes("/preview/"))
      doc.querySelector("#publishedStoriesLink").innerHTML =
        ' · <a href="/stories/published">Published, reviewed collection</a>';
    if (root.location.hash) route();
    else library();
  } catch (error) {
    app.innerHTML = `<div class="story-empty"><h1>Stories need a moment.</h1><p role="alert">${escape(error.message)}</p><p>Try reloading, or return to your lessons.</p><a href="../index.html">Back to learning</a></div>`;
  }
})(globalThis);
