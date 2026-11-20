/* Twenty short, offline visual activities. No learner records are written. */
(function () {
  "use strict";
  const host = document.querySelector("#gameRoot");
  const e = (value) =>
    String(value ?? "").replace(
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
  const native = (text, cls = "glyph") =>
    `<span class="${cls}" lang="ti" dir="ltr">${e(text)}</span>`;
  const pic = (w) =>
    `<svg class="picture" viewBox="0 0 320 240" role="img" aria-label="${e(w.concept)}"><use href="#art-${e(w.art)}"/></svg>`;
  const button = (action, label, value = "", cls = "", disabled = false) =>
    `<button type="button" class="${cls}" data-action="${action}" data-value="${e(value)}"${disabled ? " disabled" : ""}>${label}</button>`;
  const formButton = (action, text, value = text, cls = "", disabled = false) =>
    button(action, native(text), value, `tile ${cls}`, disabled);
  let unit = new URLSearchParams(location.search).get("unit") === "2" ? 2 : 1;
  let data,
    p,
    view = "catalog",
    variation = 0,
    index = 0,
    message = "",
    tone = "",
    locked = false;
  let placed = [],
    selected = null,
    chosen = new Set(),
    matched = new Set(),
    open = [],
    revealed = false,
    ink = [],
    text = "",
    composition = false;
  let dotPadOpen = true;
  let recallQueue = [],
    revisited = new Set(),
    recallDone = 0,
    completed = new Set();
  function unitHref() {
    return unit === 1
      ? "../unit-01-fidel-foundations/index.html"
      : "../unit-02-first-words/index.html";
  }
  function announce() {
    const status = document.querySelector("#gardenStatus");
    if (status) {
      status.textContent = message;
      status.className = `feedback ${tone}`;
    }
    const live = document.querySelector("#gardenAnnouncer");
    if (live) {
      live.textContent = "";
      requestAnimationFrame(() => {
        live.textContent = message;
      });
    }
  }
  function fail(error) {
    view = "error";
    host.innerHTML = `<section class="empty"><span class="garden-mark" aria-hidden="true">⌁</span><h1 tabindex="-1">The garden needs a moment</h1><p role="alert">${e(error.message || "The source material could not be opened.")}</p>${button("reload", "Try loading again")} <a href="${unitHref()}">Back to unit ${unit}</a></section>`;
  }
  function resetRound() {
    placed = [];
    selected = null;
    chosen = new Set();
    revealed = false;
    ink = [];
    text = "";
    composition = false;
    dotPadOpen = true;
    locked = false;
    message = "";
    tone = "";
  }
  function start(id, replay = false) {
    try {
      if (!replay) variation = 0;
      p = GameGarden.build(id, data, variation);
      unit = p.game.unit;
      view = "intro";
      index = 0;
      matched = new Set();
      open = [];
      recallQueue = p.words?.slice(0, 3).map((_, i) => i) || [];
      revisited = new Set();
      recallDone = 0;
      resetRound();
      history.replaceState(null, "", `?unit=${unit}&game=${p.game.id}`);
      render(true);
    } catch (error) {
      fail(error);
    }
  }
  function catalog() {
    const games = GameGarden.catalog.filter((g) => g.unit === unit);
    return `<section class="garden-welcome"><p class="eyebrow">Unit ${unit} · ${unit === 1 ? "Fidäl foundations" : "First words"}</p><h1 tabindex="-1">A little practice.<br>A new way to play.</h1><p>Pick a game. Look first. Take your time.</p><nav class="unit-switch" aria-label="Choose a unit"><a ${unit === 1 ? 'aria-current="page"' : ""} href="?unit=1">Unit 1 · Fidäl</a><a ${unit === 2 ? 'aria-current="page"' : ""} href="?unit=2">Unit 2 · Words</a></nav></section><div class="game-grid">${games.map((g, i) => `<a class="game-card accent-${i % 4}" href="?unit=${unit}&game=${g.id}" data-game="${g.id}"><span class="game-icon" aria-hidden="true">${g.icon}</span><span class="game-number">${String(i + 1).padStart(2, "0")}</span><h2>${e(g.name)}</h2><p>${e(g.objective)}</p><span class="card-go">${completed.has(g.id) ? "Play again" : "Explore"} <span aria-hidden="true">→</span></span></a>`).join("")}</div>`;
  }
  function model() {
    return `<div class="model-list">${p.teaching.map((t) => `<div class="model-card">${t.word ? pic(t.word) : ""}${native(t.text, "model-script")}${t.word ? `<span>${e(t.word.concept)}</span>` : t.caption ? `<span>${e(t.caption)}</span>` : ""}</div>`).join("")}</div>`;
  }
  function count() {
    const id = p.game.id;
    if (id === "twins") return [matched.size / 2, 3];
    if (id === "mosaic") return [placed.length, 4];
    if (id === "stones") return [placed.length, p.path.length];
    if (id === "post") return [matched.size, 3];
    if (id === "domino") return [placed.length, 3];
    if (id === "recall") return [recallDone, 3];
    return [index, p.rounds.length];
  }
  function drawFragment(piece, target) {
    return `<span class="fragment" aria-hidden="true"><span style="left:${-(piece % 2) * 100}%;top:${-Math.floor(piece / 2) * 100}%">${native(target, "fragment-glyph")}</span></span>`;
  }
  function activity() {
    const r = p.rounds[index],
      id = p.game.id;
    switch (id) {
      case "lantern":
        return `<div class="lantern">${native(r.target, "focal")}</div><div class="choice-row">${r.choices.map((x) => formButton("answer", x, x, "", locked)).join("")}</div>`;
      case "baskets":
        return `<div class="floating-form">${native(r.target, "focal")}</div><div class="baskets">${[p.family, p.otherFamily].map((f) => button("answer", `${native(f)}<span>family</span>`, f, "basket", locked)).join("")}</div>`;
      case "bridge":
        return `<p class="small">Left → right · seven forms</p><div class="bridge">${p.forms.map((f, i) => `<div class="bridge-slot ${i === index ? "current" : ""}"><small>${i + 1}</small>${native(i < index || (locked && i === index) ? f : "·")}</div>`).join("")}</div><div class="choice-row">${[
          ...p.forms,
        ]
          .reverse()
          .map((f) =>
            formButton(
              "answer",
              f,
              f,
              "",
              locked || p.forms.indexOf(f) < index,
            ),
          )
          .join("")}</div>`;
      case "twins":
        return `<div class="memory-board">${p.cards.map((f, i) => button("flip", `<span class="sr-only">Card ${i + 1}: </span>` + (open.includes(i) || matched.has(i) ? native(f) : '<span aria-hidden="true">✦</span><span class="sr-only">Hidden form</span>'), i, `memory-card ${matched.has(i) ? "paired" : ""}`, matched.has(i) || locked)).join("")}</div>${open.length === 2 && !locked ? button("turn-back", "Turn these cards back") : ""}`;
      case "mosaic":
        return `<div class="mosaic-layout"><div><p class="small">Printed model</p>${native(p.target, "focal")}</div><div class="mosaic-board">${[0, 1, 2, 3].map((i) => `<div class="mosaic-slot ${placed.length === i ? "current" : ""}" aria-label="${["Top left", "Top right", "Bottom left", "Bottom right"][i]} space">${placed.includes(i) ? drawFragment(i, p.target) : `<span>${i + 1}</span>`}</div>`).join("")}</div></div><p>Piece for space ${Math.min(placed.length + 1, 4)}</p><div class="choice-row">${[2, 0, 3, 1].map((i) => button("piece", drawFragment(i, p.target) + `<span class="sr-only">${["Top left", "Top right", "Bottom left", "Bottom right"][i]} fragment</span>`, i, "piece", placed.includes(i) || locked)).join("")}</div>`;
      case "stones":
        return `<div class="route-model" aria-label="Follow this sequence">${p.route.map((f, i) => `<span>${i + 1}. ${native(f)}</span>`).join("")}</div><div class="stone-grid">${p.grid.map((f, i) => button("stone", `${native(f)}${i === p.path[0] ? '<span class="sr-only">Start flag</span>' : ""}`, i, `stone ${placed.includes(i) ? "visited" : ""} ${i === p.path[0] ? "flag" : ""}`, placed.includes(i) || locked)).join("")}</div><p class="small">Stones touch across an edge, not a corner.</p>`;
      case "loom":
        return `<div class="loom">${[...p.pattern, ...p.rounds.slice(0, index + (locked ? 1 : 0)).map((x) => x.target)].map((f) => native(f, "pattern-tile")).join("")}<span class="pattern-tile current">?</span></div><div class="choice-row">${[p.forms[1], p.forms[0], p.other[0]].map((f) => formButton("answer", f, f, "", locked)).join("")}</div>`;
      case "ink":
        return `<p class="small">Printed model · explore the shape, without a stroke guide</p><div class="ink-layout"><div class="ink-model">${native(r.target, "focal")}</div><svg id="inkPad" class="ink-pad" viewBox="0 0 300 300" role="img" aria-label="Drawing area. Draw with a pointer, or use the dot pad below."><text x="150" y="220" text-anchor="middle" lang="ti" class="ink-ghost">${e(r.target)}</text>${ink.map((line) => `<polyline points="${line.map((a) => a.join(",")).join(" ")}"/>`).join("")}</svg></div><details id="dotOptions"${dotPadOpen ? " open" : ""}><summary>Use a keyboard or tap dots instead</summary><p class="small">Choose dots to explore a line. These are your marks, not a teacher stroke sequence.</p><div class="dot-pad">${Array.from({ length: 9 }, (_, i) => button("dot", `<span aria-hidden="true">●</span><span class="sr-only">Dot ${i + 1}</span>`, i, "", locked)).join("")}</div></details><div class="actions">${button("clear-ink", "Clear drawing", "", "", locked)}${button("compare", "Compare with model", "", "primary", locked || !ink.length)}</div><p class="small">No automatic handwriting assessment.</p>`;
      case "detective":
        return `<p>Most forms belong to ${native(p.family, "inline-script")}. Find the other family.</p><div class="choice-row">${r.choices.map((f) => formButton("answer", f, f, "", locked)).join("")}</div>`;
      case "spotlight":
        return `<div class="target-badge">Find ${native(r.target)}</div><div class="choice-row word-row" lang="ti" dir="ltr">${Array.from(
          r.word,
        )
          .map((f, i) => formButton("spot", f, i, "", locked))
          .join("")}</div><p>${e(r.meaning)}</p>`;
      case "post":
        return `<p class="small">1. Choose a label · 2. Choose its picture</p><div class="choice-row">${[
          ...p.words,
        ]
          .reverse()
          .map((w) =>
            formButton(
              "label",
              w.word,
              w.id,
              selected === w.id ? "selected" : "",
              matched.has(w.id) || locked,
            ),
          )
          .join(
            "",
          )}</div><div class="picture-row">${p.words.map((w) => button("deliver", pic(w) + `<span>${e(w.concept)}</span>`, w.id, `picture-card ${matched.has(w.id) ? "delivered" : ""}`, matched.has(w.id) || locked)).join("")}</div>`;
      case "forge":
        return `${pic(r.word)}<div class="model-word">${native(r.target, "model-script")}</div><div class="word-slots" lang="ti" dir="ltr">${[0, 1].map((i) => `<span>${native(placed[i] || "·")}</span>`).join("")}</div><div class="choice-row">${r.choices.map((f) => formButton("forge", f, f, "", locked)).join("")}</div>${button("undo", "Undo last form", "", "quiet", locked || !placed.length)}`;
      case "market":
        return `<p>Your picture list</p><div class="picture-row shopping-list">${r.list.map((w) => `<div>${pic(w)}<span>${e(w.concept)}</span></div>`).join("")}</div><div class="choice-row">${p.words.map((w) => `<button class="tile ${chosen.has(w.id) ? "selected" : ""}" data-action="shop" data-value="${e(w.id)}" aria-pressed="${chosen.has(w.id)}"${locked ? " disabled" : ""}>${native(w.word)}</button>`).join("")}</div>${button("checkout", "Check basket", "", "primary", locked)}`;
      case "lenses":
        return `${pic(r.word)}<p class="position-prompt">Find the <strong>${r.position === 0 ? "first" : "last"}</strong> form ${r.position === 0 ? "←" : "→"}</p><div class="word-row choice-row" lang="ti" dir="ltr">${r.word.letters.map((f, i) => formButton("position", f, i, "", locked)).join("")}</div>`;
      case "repair": {
        const slot = index % 2,
          wrong = r.choices.find((f) => f !== r.letters[slot]);
        return `${pic(r.word)}<p class="small">Word model</p>${native(r.target, "model-script")}<p class="small">Puzzle pieces · replace the marked piece</p><div class="word-slots">${r.letters.map((f, i) => `<span class="${i === slot ? "current" : ""}">${native(i === slot && !locked ? wrong : f)}</span>`).join("")}</div><div class="choice-row">${r.choices.map((f) => formButton("answer", f, f, "", locked)).join("")}</div>`;
      }
      case "windows": {
        const grid = windowGrid(r);
        return `${pic(r.word)}<div class="target-badge">${native(r.target)}</div><div class="letter-grid">${grid.map((f, i) => formButton("window", f, i, placed.includes(i) ? "selected" : "", locked)).join("")}</div>${button("undo", "Start this word again", "", "quiet", locked)}<p class="small">Other tiles are puzzle forms, not extra words.</p>`;
      }
      case "domino":
        return `<div class="domino-chain">${placed.map((i) => `<div class="domino-card">${native(p.chain[i].word)}</div>`).join("")}${placed.length < 3 ? '<div class="domino-card current">→</div>' : ""}</div><p>${placed.length ? "Match the last form on the right." : "Begin with this word: " + native(p.chain[0].word, "inline-script")}</p><div class="picture-row">${[2, 0, 1].map((i) => button("domino", pic(p.chain[i]) + native(p.chain[i].word), i, "domino-choice", placed.includes(i) || locked)).join("")}</div>`;
      case "notebook":
        return `${pic(r.word)}${native(r.target, "model-script")}<label class="entry-label" for="wordEntry">Copy this word</label><input id="wordEntry" class="word-entry" lang="ti" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false" value="${e(text)}"${locked ? " disabled" : ""}><div class="choice-row keyboard" aria-label="Fidäl keys">${r.choices.map((f) => formButton("key", f, f, "", locked)).join("")}${button("backspace", '⌫<span class="sr-only">Delete last form</span>', "", "", locked)}</div>${button("write-check", "Check word", "", "primary", locked)}`;
      case "shared":
        return `<div class="shared-words">${[r.left, r.right].map((w, row) => `<div>${pic(w)}<div class="word-row choice-row">${w.letters.map((f, i) => formButton("shared", f, `${row}:${i}`, chosen.has(`${row}:${i}`) ? "selected" : "", locked)).join("")}</div>`).join("")}</div><p class="small">The words share a form, not necessarily a meaning.</p>`;
      case "recall": {
        const w = p.words[recallQueue[0] ?? p.words.length - 1];
        return `${pic(w)}${revealed ? `<div class="reveal-word">${native(w.word, "focal")}<p>${e(w.concept)}</p></div><div class="actions">${button("remember", "I remembered", "", "primary", locked)}${button("again", "Practise once more", "", "", locked)}</div><p class="small">Your own check · no reading or speaking score.</p>` : `<p>Can you remember this word?</p>${button("reveal", "Reveal word", "", "primary")}`}`;
      }
      default:
        throw new Error("This activity is unavailable. Return to the garden.");
    }
  }
  function windowGrid(r) {
    const rest = r.choices.filter((f) => !r.letters.includes(f));
    const grid = Array.from({ length: 9 }, (_, i) => rest[i % rest.length]);
    r.positions.forEach((cell, i) => {
      grid[cell] = r.letters[i];
    });
    return grid;
  }
  function render(focus = false) {
    try {
      document.querySelector("#unitLink").href = unitHref();
      document.querySelector("#unitLink").textContent = `← Unit ${unit}`;
      const active = document.activeElement;
      const prior = active?.dataset?.action,
        value = active?.dataset?.value;
      if (view === "catalog") host.innerHTML = catalog();
      else if (view === "intro")
        host.innerHTML = `<div class="play-top">${button("garden", "← All games")}<span>Unit ${unit} · Look first</span></div><section class="introduction"><span class="game-icon" aria-hidden="true">${p.game.icon}</span><h1 tabindex="-1">${e(p.game.name)}</h1><p class="goal">${e(p.game.objective)}</p><p>${e(p.game.instruction)}</p>${model()}${p.game.id === "ink" ? '<p class="small">Draw freely. A printed shape is not a verified handwriting guide.</p>' : ""}${p.game.id === "recall" ? '<p class="small">This is self-reported practice. You can revisit a card without losing anything.</p>' : ""}${button("play", "Let’s play →", "", "primary")}</section>`;
      else if (view === "done")
        host.innerHTML = `<section class="completion"><div class="completion-flower" aria-hidden="true">✺</div><p class="eyebrow">Unit ${unit} · Practice complete</p><h1 tabindex="-1">A little more familiar.</h1><p>You finished ${e(p.game.name)}.</p><p>${e(p.game.objective)}</p><p class="small">Practice completed, not a mastery score.</p><div class="actions">${button("replay", "Play again", "", "primary")}${button("garden", "Choose another game")}</div><a href="${unitHref()}">Back to unit ${unit}</a></section>`;
      else if (view === "play") {
        const [done, total] = count();
        host.innerHTML = `<div class="play-top">${button("garden", "← All games")}<span>Unit ${unit} · ${e(p.game.name)}</span></div><section class="play-card"><div class="progress-label"><span>${done} of ${total}</span><span>At your pace</span></div><progress max="${total}" value="${done}" aria-label="Steps completed"></progress><h1 id="playHeading" tabindex="-1">${e(p.game.name)}</h1><p class="goal">${e(p.game.objective)}</p><p id="instruction">${e(p.game.instruction)}</p><div class="activity" aria-describedby="instruction">${activity()}</div><p id="gardenStatus" class="feedback"></p><div class="actions">${locked ? button("continue", "Continue →", "", "primary") : ""}${button("model", "Show model", "", "quiet")}</div><div id="modelPanel" hidden><h2>Look again</h2>${model()}</div></section>`;
        if (p.game.id === "ink") bindInk();
      }
      announce();
      if (focus) {
        window.scrollTo({ top: 0, behavior: "instant" });
        host.querySelector("h1")?.focus({ preventScroll: true });
      } else if (prior)
        Array.from(host.querySelectorAll("button"))
          .find(
            (b) =>
              !b.disabled &&
              b.dataset.action === prior &&
              b.dataset.value === value,
          )
          ?.focus({ preventScroll: true });
    } catch (error) {
      fail(error);
    }
  }
  function wrong(detail) {
    message = detail;
    tone = "try";
    render();
  }
  function success(detail) {
    message = detail;
    tone = "good";
    locked = true;
    render();
    document
      .querySelector('[data-action="continue"]')
      ?.focus({ preventScroll: true });
  }
  function finish() {
    view = "done";
    message = `You finished ${p.game.name}. Practice complete.`;
    completed.add(p.game.id);
    render(true);
  }
  function act(action, value) {
    if (action === "reload") {
      location.reload();
      return;
    }
    if (action === "garden") {
      view = "catalog";
      message = "";
      history.replaceState(null, "", `?unit=${unit}`);
      render(true);
      return;
    }
    if (action === "play") {
      view = "play";
      render(true);
      return;
    }
    if (action === "replay") {
      variation++;
      start(p.game.id, true);
      return;
    }
    if (action === "model") {
      const panel = document.querySelector("#modelPanel");
      panel.hidden = !panel.hidden;
      return;
    }
    if (view !== "play") return;
    if (action === "continue") {
      if (!locked) return;
      if (
        ["twins", "mosaic", "stones", "post", "domino", "recall"].includes(
          p.game.id,
        )
      ) {
        finish();
        return;
      }
      index++;
      if (index >= p.rounds.length) {
        finish();
        return;
      }
      resetRound();
      render(true);
      return;
    }
    if (locked) return;
    const r = p.rounds[index],
      n = Number(value),
      id = p.game.id;
    if (action === "answer") {
      const expected =
        id === "baskets"
          ? r.answer
          : id === "repair"
            ? r.letters[index % 2]
            : r.target;
      if (value !== expected) {
        wrong(
          `Look for ${expected}${id === "baskets" ? " family" : ""}. Compare the model, then try again.`,
        );
        return;
      }
      success(
        id === "detective"
          ? `${value} belongs to the ${p.otherFamily} family. The others belong to ${p.family}.`
          : `Yes — ${expected}${id === "baskets" ? " family" : ""}. You found the match.`,
      );
      return;
    }
    if (action === "flip") {
      if (open.includes(n) || matched.has(n)) return;
      if (open.length === 2) {
        wrong("Turn these two cards back, then choose another pair.");
        return;
      }
      open.push(n);
      if (open.length === 2) {
        if (p.cards[open[0]] === p.cards[open[1]]) {
          open.forEach((i) => matched.add(i));
          open = [];
          if (matched.size === 6) {
            success("Three pairs found. You remembered where the forms were.");
            return;
          }
          message = "A matching pair. Look for another.";
          tone = "good";
        } else {
          message =
            "Different forms. Look at both, then turn them back and try again.";
          tone = "try";
        }
      }
      render();
      return;
    }
    if (action === "turn-back") {
      open = [];
      message = "Ready for another pair.";
      render();
      return;
    }
    if (action === "piece") {
      if (n !== placed.length) {
        wrong(
          `Look at the printed model. Find the ${["top left", "top right", "bottom left", "bottom right"][placed.length]} piece.`,
        );
        return;
      }
      placed.push(n);
      if (placed.length === 4) {
        success(
          "Four pieces make the printed form. This is shape practice, not stroke order.",
        );
        return;
      }
      message = "That piece fits. Try the next space.";
      tone = "good";
      render();
      return;
    }
    if (action === "stone") {
      const prev = placed.at(-1),
        touch =
          prev === undefined ||
          Math.abs(Math.floor(prev / 3) - Math.floor(n / 3)) +
            Math.abs((prev % 3) - (n % 3)) ===
            1;
      if (n !== p.path[placed.length] || !touch) {
        wrong(
          `Next is ${p.route[placed.length]}. ${prev === undefined ? "Begin at the flag." : "Choose a stone sharing an edge with your last stone."}`,
        );
        return;
      }
      placed.push(n);
      if (placed.length === p.path.length) {
        success("You followed the whole form trail.");
        return;
      }
      message = "One step along the trail.";
      tone = "good";
      render();
      return;
    }
    if (action === "spot") {
      if (Array.from(r.word)[n] !== r.target) {
        wrong(
          `Find ${r.target} inside ${r.word}. Look at each form from left to right.`,
        );
        return;
      }
      success(`${r.target} is part of ${r.word}.`);
      return;
    }
    if (action === "dot") {
      const point = [50 + (n % 3) * 100, 50 + Math.floor(n / 3) * 100];
      if (ink.length) ink.at(-1).push(point);
      else ink.push([point, [point[0] + 0.2, point[1] + 0.2]]);
      message = "Your mark is on the pad. Compare when you are ready.";
      render();
      return;
    }
    if (action === "clear-ink") {
      ink = [];
      message = "A fresh pad. Try any part of the shape.";
      render();
      return;
    }
    if (action === "compare") {
      if (!ink.length) {
        wrong("Make a mark first, or use the dot pad.");
        return;
      }
      success(
        "Look at your marks beside the model. What looks similar? You can try again when you replay. No accuracy score was given.",
      );
      return;
    }
    if (action === "label") {
      selected = value;
      message = "Now choose a picture for this label.";
      render();
      return;
    }
    if (action === "deliver") {
      if (!selected) {
        wrong("Choose a word label first, then its picture.");
        return;
      }
      if (value !== selected) {
        const w = p.words.find((w) => w.id === selected);
        wrong(
          `${w.word} goes with ${w.concept}. Compare the model, then try another picture.`,
        );
        return;
      }
      matched.add(value);
      selected = null;
      if (matched.size === 3) {
        success("Every label has reached its picture.");
        return;
      }
      message = "Delivered. Choose another label.";
      tone = "good";
      render();
      return;
    }
    if (action === "forge") {
      if (value !== r.letters[placed.length]) {
        wrong(
          `The ${placed.length === 0 ? "first" : "last"} form is ${r.letters[placed.length]}. Follow ${r.target} from left to right.`,
        );
        return;
      }
      placed.push(value);
      if (placed.length === 2) {
        success(`${r.target} — ${r.word.concept}. Both forms are in place.`);
        return;
      }
      message = "First form placed. Add the last form.";
      tone = "good";
      render();
      return;
    }
    if (action === "undo") {
      placed = [];
      message = "Try the word again, from the first form.";
      render();
      return;
    }
    if (action === "shop") {
      chosen.has(value) ? chosen.delete(value) : chosen.add(value);
      message = `${chosen.size} word cards in your basket.`;
      render();
      return;
    }
    if (action === "checkout") {
      const ids = r.list.map((w) => w.id);
      if (chosen.size !== ids.length || !ids.every((x) => chosen.has(x))) {
        wrong(
          `Your list is ${r.list.map((w) => `${w.word} (${w.concept})`).join(" and ")}. Add missing labels and remove extras, then check again.`,
        );
        return;
      }
      success("Your basket matches the whole picture list.");
      return;
    }
    if (action === "position") {
      if (n !== r.position) {
        wrong(
          `${r.position === 0 ? "First is on the left" : "Last is on the right"}: ${r.word.letters[r.position]}. Try that position.`,
        );
        return;
      }
      success(
        `${r.word.letters[n]} is the ${n === 0 ? "first" : "last"} form in ${r.word.word}.`,
      );
      return;
    }
    if (action === "window") {
      const grid = windowGrid(r),
        previous = placed[0];
      const adjacent =
        previous === undefined ||
        Math.abs(Math.floor(previous / 3) - Math.floor(n / 3)) +
          Math.abs((previous % 3) - (n % 3)) ===
          1;
      if (
        placed.includes(n) ||
        grid[n] !== r.letters[placed.length] ||
        !adjacent
      ) {
        wrong(
          `Look for ${r.letters[placed.length]}. Choose two different touching tiles in word order.`,
        );
        return;
      }
      placed.push(n);
      if (placed.length === 2) {
        success(`${r.target} found in the window.`);
        return;
      }
      message = "First form found. Find its touching last form.";
      render();
      return;
    }
    if (action === "domino") {
      if (n !== placed.length) {
        wrong(
          `Connect ${p.chain[placed.length].word} next${placed.length ? `; its first form matches ${p.chain[placed.length - 1].letters[1]}` : ""}.`,
        );
        return;
      }
      placed.push(n);
      if (placed.length === 3) {
        success("Three real words connected through identical forms.");
        return;
      }
      message = "The forms touch. Find the next connecting word.";
      tone = "good";
      render();
      return;
    }
    if (action === "key" || action === "backspace") {
      const input = document.querySelector("#wordEntry");
      text =
        action === "key"
          ? text + value
          : Array.from(text).slice(0, -1).join("");
      input.value = text;
      input.focus();
      return;
    }
    if (action === "write-check") {
      if (composition) {
        message = "Finish entering the form, then check the word.";
        announce();
        return;
      }
      if (GameGarden.normalize(text) !== GameGarden.normalize(r.target)) {
        wrong(
          `Compare with ${r.target}. Keep both Fidäl forms in order, then try again.`,
        );
        return;
      }
      success(`${r.target} copied. Your Fidäl text matches the model.`);
      return;
    }
    if (action === "shared") {
      const [row, pos] = value.split(":").map(Number),
        word = row === 0 ? r.left : r.right;
      if (word.letters[pos] !== r.target) {
        wrong(`The shared form is ${r.target}. Find it in each word.`);
        return;
      }
      for (const old of chosen)
        if (old.startsWith(`${row}:`)) chosen.delete(old);
      chosen.add(value);
      if (chosen.size === 2) {
        success(
          `Both words contain ${r.target}. Their meanings can still be different.`,
        );
        return;
      }
      message = "One found. Find the same form in the other word.";
      tone = "good";
      render();
      return;
    }
    if (action === "reveal") {
      revealed = true;
      message = "Compare with the word you remembered.";
      render();
      return;
    }
    if (action === "remember" || action === "again") {
      if (!revealed) return;
      const card = recallQueue.shift();
      if (action === "again" && !revisited.has(card)) {
        recallQueue.push(card);
        revisited.add(card);
        message = "This picture will return once more.";
      } else {
        recallDone++;
        message =
          action === "again"
            ? "A supported revisit is complete. You can replay any time."
            : "Your own check is noted for this visit.";
      }
      revealed = false;
      if (!recallQueue.length) {
        success(
          "You revisited all three pictures. This was your own recall check.",
        );
        return;
      }
      render();
      return;
    }
  }
  function bindInk() {
    const pad = document.querySelector("#inkPad");
    let drawing = false;
    function point(event) {
      const rect = pad.getBoundingClientRect();
      return [
        Math.max(
          0,
          Math.min(300, ((event.clientX - rect.left) / rect.width) * 300),
        ),
        Math.max(
          0,
          Math.min(300, ((event.clientY - rect.top) / rect.height) * 300),
        ),
      ];
    }
    function paint() {
      pad.querySelectorAll("polyline").forEach((x) => x.remove());
      ink.forEach((line) => {
        const el = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "polyline",
        );
        el.setAttribute("points", line.map((x) => x.join(",")).join(" "));
        pad.append(el);
      });
    }
    pad.addEventListener("pointerdown", (event) => {
      if (locked) return;
      drawing = true;
      const pt = point(event);
      ink.push([pt, [pt[0] + 0.2, pt[1] + 0.2]]);
      pad.setPointerCapture?.(event.pointerId);
      paint();
      document.querySelector('[data-action="compare"]').disabled = false;
    });
    pad.addEventListener("pointermove", (event) => {
      if (!drawing || locked) return;
      ink.at(-1).push(point(event));
      paint();
    });
    const stop = () => {
      drawing = false;
    };
    pad.addEventListener("pointerup", stop);
    pad.addEventListener("pointercancel", stop);
    pad.addEventListener("lostpointercapture", stop);
  }
  host.addEventListener("click", (event) => {
    const game = event.target.closest("[data-game]");
    if (game) {
      event.preventDefault();
      start(game.dataset.game);
      return;
    }
    const b = event.target.closest("button[data-action]");
    if (!b || b.disabled) return;
    try {
      act(b.dataset.action, b.dataset.value);
    } catch (error) {
      fail(error);
    }
  });
  host.addEventListener("input", (event) => {
    if (event.target.id === "wordEntry") text = event.target.value;
  });
  host.addEventListener(
    "toggle",
    (event) => {
      if (event.target.id === "dotOptions") dotPadOpen = event.target.open;
    },
    true,
  );
  host.addEventListener("compositionstart", () => {
    composition = true;
  });
  host.addEventListener("compositionend", (event) => {
    composition = false;
    if (event.target.id === "wordEntry") text = event.target.value;
  });
  host.addEventListener("keydown", (event) => {
    if (
      event.target.id === "wordEntry" &&
      event.key === "Enter" &&
      !event.isComposing &&
      !composition
    ) {
      event.preventDefault();
      act("write-check", "");
    }
  });
  try {
    if (
      !globalThis.GameGarden ||
      !globalThis.FidalContent ||
      !globalThis.GardenWords
    )
      throw new Error(
        "Some local source files did not load. Retry, or return to your unit.",
      );
    data = GameGarden.content(FidalContent, GardenWords);
    const id = new URLSearchParams(location.search).get("game");
    if (id) start(id);
    else render();
  } catch (error) {
    fail(error);
  }
})();
