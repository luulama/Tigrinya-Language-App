(function () {
  "use strict";
  const host = document.querySelector("#wordPath"),
    KEY = "tigrinya.word-path.v1";
  const esc = (value) =>
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
  const ti = (value, cls = "script") =>
    `<span class="${cls}" lang="ti" dir="ltr">${esc(value)}</span>`;
  const image = (w) =>
    `<svg class="word-picture" viewBox="0 0 320 240" role="img" aria-label="${esc(w.concept)}"><use href="#art-${esc(w.art)}"/></svg>`;
  const button = (action, label, id = "", cls = "", disabled = false) =>
    `<button type="button" data-path="${action}" data-id="${esc(id)}" class="${cls}"${disabled ? " disabled" : ""}>${label}</button>`;
  const shuffle = (list) => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const n = Math.floor(Math.random() * (i + 1));
      [a[i], a[n]] = [a[n], a[i]];
    }
    return a;
  };
  let data,
    history,
    run = null,
    view = "map",
    message = "",
    storageMessage = "",
    drawing = null;
  let notebook = globalThis.FidalWriting?.createNotebook();
  const preview = () => globalThis.DeveloperPreview?.enabled === true;
  const readOnly = () => globalThis.DeveloperPreview?.readOnly === true;
  function say(text) {
    message = text;
    const visual = document.querySelector("#taskFeedback");
    if (visual) visual.textContent = text;
    const live = document.querySelector("#pathAnnouncement");
    live.textContent = "";
    requestAnimationFrame(() => {
      live.textContent = text;
    });
  }
  function failed(error) {
    destroyDrawing();
    view = "error";
    host.innerHTML = `<section class="path-panel"><h1>Let’s try opening that again</h1><p role="alert">${esc(error.message || "The path is unavailable.")}</p>${button("reload", "Reload path", "", "primary")} <a href="index.html">Picture library</a></section>`;
  }
  function persist() {
    if (readOnly() || !history.save) return;
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          ...history,
          contentVersion: data.contentVersion,
          materialVersion: data.materialVersion,
        }),
      );
      storageMessage = "Path checks are saved on this device.";
    } catch {
      history.save = false;
      storageMessage =
        "Saving failed. Your current progress still works in this tab; the previous saved copy is unchanged.";
    }
  }
  function warnAboutStorage() {
    const warning = document.querySelector("#pathSaveWarning");
    const text = /failed|could not/i.test(storageMessage) ? storageMessage : "";
    warning.hidden = !text;
    if (warning.textContent !== text) warning.textContent = text;
  }
  function destroyDrawing() {
    drawing?.destroy();
    drawing = null;
  }
  const lessonWords = (l) =>
    l.wordIds.map((id) => data.words.find((w) => w.id === id));
  const completeCount = (n) =>
    data.lessons.filter(
      (l) => l.unit === n && l.available && history.lessons[l.id]?.passed,
    ).length;
  function recommended() {
    if (run && !run.finished)
      return {
        action: "resume",
        label: "Continue lesson",
        detail: run.lesson.title,
      };
    const next = WordPath.next(data, history);
    return next
      ? {
          action: "start",
          id: next.id,
          label:
            WordPath.status(next, history) === "retry"
              ? "Try the check again"
              : "Take the next step",
          detail: next.title,
        }
      : {
          action: "review",
          label: "Revisit your words",
          detail: "You have cleared the available visual practice checks.",
        };
  }
  function drawMap() {
    const next = recommended(),
      activeUnit = run?.lesson.unit || WordPath.next(data, history)?.unit || 3,
      all = data.lessons.filter((l) => l.available),
      done = all.filter((l) => history.lessons[l.id]?.passed).length;
    const remembered = Object.values(history.review).filter(
      (s) => s.delayed,
    ).length;
    const nodes = (unit) =>
      data.lessons
        .filter((l) => l.unit === unit.number)
        .map((l, i) => {
          const s = preview() ? "preview" : WordPath.status(l, history),
            unavailable = !preview() && (s === "locked" || s === "content"),
            meta = preview()
              ? l.available
                ? "Inspection only · no progress recorded"
                : "Inspect outline · teaching material missing"
              : s === "complete"
                ? "Check passed · Replay"
                : s === "retry"
                  ? "Practised · Check again"
                  : s === "locked"
                    ? "Complete the previous check"
                    : s === "content"
                      ? "Native content needed"
                      : "Ready to explore";
          const thumb = lessonWords(l)[0];
          return `<article class="path-node ${s}"><span class="node-marker" aria-hidden="true">${s === "complete" ? "✓" : s === "locked" ? "◇" : String(i + 1).padStart(2, "0")}</span><div><p class="node-chapter">${esc(l.chapter)}</p><h3>${esc(l.title)}</h3><p>${esc(meta)}</p>${button("start", `${l.kind === "checkpoint" ? "↻ " : ""}${s === "complete" ? "Revisit" : s === "retry" ? "Try check" : unavailable ? "Locked" : "Begin"}<span class="sr-only"> ${esc(l.title)}</span>`, l.id, s === "ready" || s === "retry" ? "primary" : "", unavailable)}<details><summary>Learning goal & support</summary><p>${esc(l.goal)}</p><p>${esc(l.prerequisiteKnowledge)}</p><p>${esc(l.reviewPlan)}</p></details></div>${thumb ? `<div class="node-picture">${image(thumb)}</div>` : ""}</article>`;
        })
        .join("");
    host.innerHTML = `<section class="path-intro"><p class="eyebrow">From Fidäl to familiar words</p><h1 tabindex="-1">Your next<br><em>small step.</em></h1><p>Look. Build. Read. Come back and remember.</p><div class="route-summary"><span>Unit 1 · Fidäl</span><span aria-hidden="true">→</span>${activeUnit === 2 ? "<strong>2 · Words</strong>" : "<span>2 · Words</span>"}<span aria-hidden="true">→</span>${activeUnit === 3 ? "<strong>3 · Read & write</strong>" : "<span>3 · Read & write</span>"}</div></section><section class="next-card" aria-labelledby="nextHeading"><span class="next-flower" aria-hidden="true">✺</span><div><p class="eyebrow">YOUR NEXT STEP</p><h2 id="nextHeading">${esc(next.detail)}</h2><p>A few new words, with older ones returning along the way.</p></div>${button(next.action, next.label + " →", next.id || "", "primary")}${run && !run.finished ? button("abandon", "Leave unfinished lesson") : ""}</section>${!history.save ? `<p class="save-nudge">Keep your learning history for another day. ${button("save", "Save on this device")}</p>` : ""}<div class="path-progress"><label for="courseProgress">${done} of ${all.length} visual checks passed</label><progress id="courseProgress" max="${all.length}" value="${done}"></progress><span>${remembered} words matched in a later-day review</span></div><section class="review-strip"><h2>Keep familiar words close</h2><p>${WordPath.due(data, history).length ? "A few words are ready to revisit." : "You can revisit any taught words. Later-day reviews will appear here."}</p>${button("review", "Review taught words", "", "", !Object.keys(history.review).length)}</section>${data.units
      .filter((u) => preview() || !u.contentBlocked)
      .map(
        (u) =>
          `<section class="unit-path" aria-labelledby="unit-${u.number}"><div class="unit-heading"><span class="unit-badge">${u.number}</span><div><p class="eyebrow">${completeCount(u.number)} checks passed</p><h2 id="unit-${u.number}">${esc(u.title)}</h2><p>${esc(u.goal)}</p></div></div><div class="node-trail">${nodes(u)}</div></section>`,
      )
      .join(
        "",
      )}<section class="beyond-card"><h2>Next: voices and messages</h2><p>These steps need native-reviewed content first. Your visual practice stays open.</p><details><summary>See the planned steps and what they need</summary>${data.units
      .filter((u) => u.contentBlocked)
      .map(
        (u) =>
          `<h3>Unit ${u.number} · ${esc(u.title)}</h3>${data.lessons
            .filter((l) => l.unit === u.number)
            .map(
              (l) =>
                `<article><h4>${esc(l.title)}</h4><p>${esc(l.goal)}</p><p>${esc(l.blockedReason)}</p><p><strong>Not assessed.</strong> Visual review is available instead.</p></article>`,
            )
            .join("")}`,
      )
      .join(
        "",
      )}</details></section><section class="path-tools"><details id="pathSettings"><summary>My progress & settings</summary><p>Lesson checks unlock visual practice. Full language mastery is not assessed. A correct same-day retry is not evidence of long-term memory. Detailed recall history records models, mistakes, hints, task type and sessions separately.</p><p>Earlier picture-library practice and Unit 1 history remain untouched. Older words return inside later lessons, with a small review budget. This new path keeps its own lesson checks.</p><p id="storageStatus">${esc(storageMessage || (history.save ? "Path checks are saved on this device." : "Progress is temporary. Reloading or leaving this page resets unsaved checks; choose Save to keep them."))}</p>${button("save", history.save ? "Stop saving this path" : "Save this path on this device")}<p>${PathSRS.summary(history).items} item/skill records · ${PathSRS.summary(history).weak} need support · ${PathSRS.summary(history).independent} delayed session recalls. No proficiency level is assigned.</p><p>Shared-device users share this local history. No names, microphone, uploads or account. Unfinished lessons and drawings are not saved.</p><a href="../games/index.html?unit=2">Word games</a> · <a href="index.html">Original picture practice & full review bank</a></details></section>`;
  }
  function task(kind, word, extra = {}) {
    return {
      kind,
      word,
      ...extra,
      choices: shuffle([
        word,
        ...shuffle([
          ...new Map(
            (
              extra.options || [
                ...run.words,
                ...data.words.filter((w) => history.review[w.id]),
              ]
            )
              .filter((w) => w.id !== word.id)
              .map((w) => [w.id, w]),
          ).values(),
        ]).slice(0, 2),
      ]),
      token: crypto.randomUUID(),
      attempts: 0,
      solved: false,
      placed: [],
      typed: "",
      helped: false,
    };
  }
  function practiceTasks(l) {
    if (l.kind === "checkpoint") return [];
    if (l.kind === "positions")
      return run.words.flatMap((w) => [
        task("position", w, { position: 0, model: true }),
        task("position", w, { position: 1, model: true }),
      ]);
    if (l.kind === "family")
      return run.words.map((w) =>
        task("locate", w, {
          model: true,
          character: w.letters.find((ch) =>
            globalThis.FidalContent?.families
              .find((f) => f.family === "በ")
              ?.forms.some((x) => x.character === ch),
          ),
        }),
      );
    if (l.kind === "copy")
      return run.words.map((w) =>
        task("type", w, { model: true, writing: true }),
      );
    if (l.kind === "read")
      return run.words.map((w) => task("read", w, { model: true }));
    if (l.kind === "write" || l.kind === "mixed")
      return run.words.map((w) => task("type", w, { model: true }));
    return run.words.flatMap((w) => [
      task("look", w),
      task("build", w, { model: true }),
      task("choose", w),
    ]);
  }
  function checkTasks(l) {
    const kind = l.kind;
    return (preview() ? run.words : shuffle(run.words)).flatMap((w) =>
      kind === "positions"
        ? [
            task("position", w, { position: 0 }),
            task("position", w, { position: 1 }),
          ]
        : kind === "family"
          ? [
              task("locate", w, {
                character: w.letters.find((ch) =>
                  FidalContent.families
                    .find((f) => f.family === "በ")
                    .forms.some((x) => x.character === ch),
                ),
              }),
            ]
          : kind === "copy" || kind === "write"
            ? [task("type", w)]
            : kind === "read"
              ? [task("read", w)]
              : kind === "mixed"
                ? [task("read", w), task("type", w)]
                : [task("choose", w)],
    );
  }
  function start(id) {
    const l = data.lessons.find((l) => l.id === id);
    if (
      !l ||
      (!preview() &&
        ["locked", "content"].includes(WordPath.status(l, history)))
    )
      return;
    if (preview()) globalThis.DeveloperPreview.select(id);
    run = {
      lesson: l,
      words: PathSRS.focus(data, l).map((id) =>
        data.words.find((w) => w.id === id),
      ),
      phase: "intro",
      tasks: [],
      index: 0,
      helped: new Set(),
      finished: false,
      isReview: false,
    };
    if (preview() && !l.available) {
      run.phase = "outline";
      view = "lesson";
      message = "";
      render(true);
      return;
    }
    if (!preview() && WordPath.status(l, history) === "retry") {
      run.phase = "check";
      run.tasks = checkTasks(l);
    }
    run.mixed = preview()
      ? []
      : PathSRS.plan(data, history, {
          lesson: l.id,
          exclude: run.words.map((w) => w.id),
        });
    run.revisitAdded = false;
    view = "lesson";
    message = "";
    render(true);
  }
  function startReview() {
    if (run && !run.finished) {
      say("Finish or leave your current lesson before starting review.");
      return;
    }
    const candidates = WordPath.due(data, history),
      taught = preview()
        ? data.words
        : data.words.filter((w) => history.review[w.id]);
    const selected = [
      ...candidates,
      ...taught.filter((w) => !candidates.some((due) => due.id === w.id)),
    ].slice(0, 3);
    if (!selected.length) {
      say("Start the first lesson to meet some words.");
      return;
    }
    run = {
      lesson: {
        id: "review",
        title: "Familiar words, a little later",
        goal: "Revisit taught picture-word links.",
        kind: "checkpoint",
      },
      words: selected,
      phase: "check",
      tasks: [],
      index: 0,
      helped: new Set(),
      finished: false,
      isReview: true,
      reviewed: new Set(),
    };
    const planned = PathSRS.plan(data, history, {
      lesson: "review",
      manual: true,
      limit: 3,
    });
    if (planned.length) run.words = planned.map((p) => p.word);
    run.tasks = planned.length
      ? planned.map((p) =>
          task(p.kind, p.word, {
            srs: true,
            srsId: p.id,
            character: p.character,
            options: [
              ...run.words,
              ...data.words.filter((w) => history.review[w.id]),
            ],
          }),
        )
      : checkTasks(run.lesson);
    view = "lesson";
    message = "";
    render(true);
  }
  function profileFor(character) {
    return FidalContent.families
      .flatMap((f) => f.forms)
      .find((f) => f.character === character);
  }
  function familyModel() {
    const family = FidalContent.families.find((f) => f.family === "በ");
    return `<div class="family-orders">${family.forms.map((f) => `<span><small>${f.order}</small>${ti(f.character)}</span>`).join("")}</div><p class="small">One sourced family, seven vowel-order forms. Sound recordings still need native review.</p>`;
  }
  function models(compact = false) {
    for (const word of run.words)
      PathSRS.teach(
        data,
        history,
        word,
        PathSRS.context(history, run.lesson.id),
      );
    WordPath.expose(
      history,
      run.words.map((w) => w.id),
    );
    persist();
    return `<div class="lesson-models ${compact ? "compact" : ""}" style="--model-count:${run.words.length}">${run.words.map((w) => `<div>${image(w)}${ti(w.word)}<span>${esc(w.concept)}</span><div class="form-order">${w.letters.map((c, i) => `<span>${i + 1}. ${ti(c, "inline-script")}</span>`).join("")}</div></div>`).join("")}</div>`;
  }
  function body() {
    const l = run.lesson;
    if (preview() && run.phase === "outline")
      return `<p class="eyebrow">Content outline · not implemented or assessed</p><h1 tabindex="-1">${esc(l.title)}</h1><p>${esc(l.goal)}</p><p class="notice">${esc(l.blockedReason)}</p><h2>Planned teaching steps</h2><ol>${l.recipe.map((step, i) => `<li${run.outlineStep === i ? ' aria-current="step"' : ""}>${esc(step)}</li>`).join("")}</ol><p>${esc(l.languageScope)}</p>${run.words.length ? models(true) : "<p>No authored sentence content exists for this lesson yet.</p>"}<p>${esc(l.completionRule)}</p>${button("map", "Back to all lessons")}`;
    if (preview() && run.phase === "done")
      return `<h1 tabindex="-1">End screen preview</h1><p>No lesson was marked completed. Progress and achievements are unchanged.</p>${button("map", "Back to all lessons", "", "primary")}${button("replay", "Inspect this lesson again")}`;
    if (run.phase === "intro")
      return `<p class="eyebrow">Look first · ${esc(l.chapter || "Review")}</p><h1 tabindex="-1">${esc(l.title)}</h1><p class="lesson-goal">${esc(l.goal)}</p>${l.kind === "family" ? familyModel() : ""}${l.kind === "checkpoint" ? "<p>These are familiar words. Try without the written model, or choose help.</p>" : models(true)}<div class="actions">${button("begin", l.kind === "checkpoint" ? "Try the check" : "Try it →", "", "primary")}</div><details><summary>Before this lesson</summary><p>${esc(l.prerequisiteKnowledge)}</p><a href="../unit-01-fidel-foundations/index.html">Return to the unchanged Fidäl unit</a></details>`;
    if (run.phase === "recap")
      return `<p class="eyebrow">One more look</p><h1 tabindex="-1">Ready to try?</h1>${models(true)}<p>Next, try without the answer model. Help is always available.</p>${button("check", "Try the visual check →", "", "primary")}`;
    if (run.phase === "done") {
      const passed = run.helped.size === 0,
        old = history.lessons[l.id]?.passed;
      return `<div class="finish-bloom" aria-hidden="true">${passed ? "✺" : "❋"}</div><h1 tabindex="-1">${passed ? "A step forward." : "Good practice. Try once more."}</h1><p>${run.isReview ? "Familiar words revisited." : passed ? "Visual check passed. Your next lesson is ready." : old ? "Your earlier passed check is kept. Revisit this material whenever you like." : "You finished with model help. Try a fresh check to open the next step."}</p><p class="small">${run.isReview ? "Later-day evidence is recorded only when a day has elapsed since the last practice; same-day retries do not increase spacing." : "This is a visual practice check, not a language-mastery assessment."}</p><div class="actions">${!passed ? button("retry", "Try a fresh check", "", "primary") : ""}${button("map", "Back to my path", "", passed ? "primary" : "")}${button("replay", "Practise this lesson again")}</div>`;
    }
    const t = run.tasks[run.index],
      w = t.word,
      k = t.kind,
      check = run.phase === "check",
      canSee = t.model || t.helped;
    const pool = shuffle([
      ...new Set([...w.letters, ...run.words.flatMap((w) => w.letters)]),
    ]);
    if ((k === "position" || k === "locate") && t.model)
      PathSRS.form(
        history,
        w,
        t.character || w.letters[t.position],
        PathSRS.context(history, run.lesson.id),
        true,
      );
    let prompt =
      k === "look"
        ? "Meet this word"
        : k === "build"
          ? "Build it from left to right"
          : k === "choose"
            ? "Find its word"
            : k === "read"
              ? "Read, then find the picture"
              : k === "position"
                ? `Find the ${t.position === 0 ? "first" : "last"} form`
                : k === "locate"
                  ? `Find this form: ${t.character}`
                  : check
                    ? "Remember and write"
                    : "Copy the word";
    let html = `<p class="eyebrow">${t.srs ? (t.corrective ? "A familiar word · supported revisit" : "Remember this? · from an earlier lesson") : check ? "Visual check · answer model hidden" : "Practise with support"} · ${run.index + 1} of ${run.tasks.length}</p><progress aria-label="Lesson steps" value="${run.index}" max="${run.tasks.length}"></progress><h1 tabindex="-1">${esc(prompt)}</h1><p class="small">${esc(l.goal)}</p><div class="lesson-task" data-kind="${k}">`;
    if (k === "read") {
      if (canSee)
        PathSRS.teach(
          data,
          history,
          w,
          PathSRS.context(history, run.lesson.id),
        );
      WordPath.expose(history, [w.id]);
      persist();
    }
    if (k === "read")
      html += `<div class="prompt-word">${ti(w.word, "focal-script")}</div>${canSee ? image(w) : ""}<div class="picture-choices">${t.choices.map((x) => button("answer-picture", image(x) + `<span class="sr-only">${esc(x.concept)}</span>`, x.id, "picture-choice", t.solved)).join("")}</div>`;
    else if (k === "position" || k === "locate")
      html += `${image(w)}${k === "locate" ? `<div class="find-form">${ti(t.character)}</div>` : ""}<div class="prompt-word">${ti(w.word)}</div><div class="character-choices">${w.letters.map((ch, i) => button("position", ti(ch), i, "form-key", t.solved)).join("")}</div>`;
    else {
      html += image(w);
      if (k === "look" || canSee) {
        PathSRS.teach(
          data,
          history,
          w,
          PathSRS.context(history, run.lesson.id),
          k === "type" ? ["entry"] : k === "build" ? ["construction"] : [],
        );
        WordPath.expose(history, [w.id]);
        persist();
      }
      if (k === "look" || canSee)
        html += `<div class="answer-model">${ti(w.word, "focal-script")}<p>${esc(w.concept)}</p></div>`;
      if (k === "look")
        html += `<div class="form-order">${w.letters.map((ch, i) => `<span>${i + 1}. ${ti(ch)}</span>`).join("")}</div>`;
      if (k === "choose")
        html += `<div class="word-choices">${t.choices.map((x) => button("answer-word", ti(x.word), x.id, "word-choice", t.solved)).join("")}</div>`;
      if (k === "build")
        html += `<div class="word-slots">${[0, 1].map((i) => `<span>${ti(t.placed[i] || "·")}</span>`).join("")}</div><div class="character-choices">${pool.map((c) => button("place", ti(c), c, "form-key", t.solved)).join("")}</div>`;
      if (k === "type")
        html += `<label class="input-label" for="pathWordEntry">Your Fidäl word<input id="pathWordEntry" lang="ti" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(t.typed)}"${t.solved ? " disabled" : ""}></label><div class="character-choices">${pool.map((c) => button("insert", ti(c), c, "form-key", t.solved)).join("")}${button("delete", '⌫<span class="sr-only">Delete last form</span>', "", "", t.solved)}</div>${button("compare", "Check my word", "", "primary", t.solved)}${t.writing ? `<details id="writingOptional"><summary>Try writing a form · optional</summary><div id="pathWriting"></div></details>` : ""}`;
    }
    html +=
      '</div><p id="taskFeedback" class="task-feedback"></p><div class="actions">';
    if (t.solved || k === "look")
      html += button("advance", "Continue →", "", "primary");
    if (k !== "look" && !t.solved) html += button("help", "Show the model");
    if (t.srs && !t.solved && !run.isReview)
      html += button("skip-mixed", "Keep going · revisit later");
    return (
      html +
      '</div><p class="small">No native audio available. Visual practice remains usable.</p>'
    );
  }
  function mountWriting() {
    const target = document.querySelector("#pathWriting");
    if (!target) return;
    const ch = run.tasks[run.index].word.letters[0],
      profile = profileFor(ch);
    if (!profile || !globalThis.FidalWriting) {
      target.innerHTML =
        "<p>Writing tools are unavailable. The Fidäl text keys above still work.</p>";
      return;
    }
    const family = FidalContent.families.find((f) =>
      f.forms.some((p) => p.character === ch),
    );
    drawing = FidalWriting.mount(target, {
      profile,
      family: family.forms.map((f) => f.character),
      notebook,
    });
    for (const audio of target.querySelectorAll("audio")) {
      const raw = audio.getAttribute("src");
      if (raw?.startsWith("shared/")) audio.src = "../" + raw;
      audio.addEventListener("error", () => {
        audio.hidden = true;
        target.querySelector("#writingFeedback").textContent =
          "This recording could not play. Use the printed model and text keys; sound is not assessed.";
      });
    }
  }
  function render(focus = false) {
    try {
      destroyDrawing();
      if (view === "map") drawMap();
      else
        host.innerHTML = `<div class="lesson-top">${button("leave", "← My path")}<span>${run.isReview ? "Review" : `Unit ${run.lesson.unit}`} · ${esc(run.lesson.title)}</span></div><section class="lesson-panel">${body()}</section>`;
      if (view === "lesson") mountWriting();
      if (preview())
        host
          .querySelectorAll('[data-path="save"]')
          .forEach((b) => (b.disabled = true));
      warnAboutStorage();
      if (focus) {
        window.scrollTo({ top: 0, behavior: "instant" });
        host.querySelector("h1")?.focus({ preventScroll: true });
      }
      if (message) say(message);
    } catch (error) {
      failed(error);
    }
  }
  function recordRecall(t, outcome) {
    if (readOnly()) return;
    const ctx = PathSRS.context(history, run.lesson.id),
      id =
        t.srsId ||
        PathSRS.itemFor(
          history,
          t.word,
          t.kind,
          ctx,
          t.character || t.word.letters[t.position],
        );
    if (!id) return;
    t.srsId = id;
    const eventId =
      outcome === "correct"
        ? t.token + ":correct"
        : t.token + ":" + outcome + ":" + ++t.attempts;
    PathSRS.answer(history, id, {
      ...ctx,
      id: eventId,
      outcome,
      wordId: t.word.id,
      characters: t.word.letters,
      kind: t.kind,
      supported:
        t.helped ||
        t.model ||
        t.corrective ||
        (run.phase === "practice" && !t.srs) ||
        (["choose", "read"].includes(t.kind) && t.choices.length < 2),
    });
    const item = history.srs.items[id];
    if (
      item.kind === "word" &&
      item.sessions.length &&
      history.review[t.word.id]
    ) {
      const legacy = history.review[t.word.id];
      legacy.delayed = true;
      legacy.step = Math.min(2, item.step);
      legacy.due = item.dueAt;
      legacy.last = ctx.at;
      legacy.helped = item.weak;
    }
  }
  function mixedTasks(tasks) {
    const additions = (run.mixed || []).map((p) =>
      task(p.kind, p.word, {
        srs: true,
        srsId: p.id,
        character: p.character,
        options: [
          ...run.words,
          ...data.words.filter((w) => history.review[w.id]),
        ],
      }),
    );
    for (let i = 0; i < additions.length; i++)
      tasks.splice(Math.min(tasks.length, 3 + i * 4), 0, additions[i]);
    return tasks;
  }
  function help(text, reason = "incorrect") {
    const t = run.tasks[run.index];
    t.helped = true;
    recordRecall(t, reason);
    persist();
    if (
      t.srs &&
      !run.isReview &&
      !run.revisitAdded &&
      run.index + 3 < run.tasks.length
    ) {
      run.revisitAdded = true;
      run.tasks.splice(
        run.index + 3,
        0,
        task(t.kind === "read" ? "choose" : "read", t.word, {
          srs: true,
          corrective: true,
          options: [
            ...run.words,
            ...data.words.filter((w) => history.review[w.id]),
          ],
        }),
      );
    }
    if (run.phase === "check") run.helped.add(t.word.id);
    render();
    say(text || `Compare with ${t.word.word} (${t.word.concept}). Try again.`);
  }
  function correct(text) {
    const current = run.tasks[run.index];
    current.solved = true;
    if (run.isReview) {
      if (["position", "locate"].includes(current.kind))
        WordPath.expose(history, [current.word.id]);
      else
        WordPath.review(
          history,
          [current.word.id],
          run.helped.has(current.word.id) ? [current.word.id] : [],
        );
      run.reviewed.add(current.word.id);
    } else WordPath.expose(history, [current.word.id]);
    recordRecall(current, "correct");
    persist();
    render();
    say(text);
    document
      .querySelector('[data-path="advance"]')
      ?.focus({ preventScroll: true });
  }
  function finish() {
    if (run.finished) return;
    run.finished = true;
    run.phase = "done";
    if (run.isReview)
      WordPath.review(
        history,
        run.words.filter((w) => !run.reviewed.has(w.id)).map((w) => w.id),
        [...run.helped],
      );
    else WordPath.complete(data, history, run.lesson.id, run.helped.size > 0);
    persist();
    message = "";
    render(true);
    say(
      preview()
        ? "Preview ended. Learner progress is unchanged."
        : run.helped.size
          ? "Practice completed with help."
          : "Visual check completed.",
    );
  }
  function action(name, id) {
    if (name === "reload") {
      location.reload();
      return;
    }
    if (name === "start") {
      if (!preview() && run && !run.finished) {
        say(
          "Continue your current lesson, or leave it before starting another.",
        );
        return;
      }
      start(id);
      return;
    }
    if (name === "map") {
      view = "map";
      run = null;
      message = "";
      render(true);
      return;
    }
    if (name === "leave") {
      view = "map";
      message =
        "Your unfinished lesson is kept in this tab. Use Continue lesson to return.";
      render(true);
      return;
    }
    if (name === "abandon") {
      run = null;
      view = "map";
      message = "Completed checks are kept. Choose a lesson or review.";
      render(true);
      return;
    }
    if (name === "resume") {
      if (run) {
        view = "lesson";
        message = "";
        render(true);
      }
      return;
    }
    if (name === "review") {
      startReview();
      return;
    }
    if (name === "save") {
      if (readOnly()) {
        say("Saving is disabled in Developer Preview Mode.");
        return;
      }
      if (history.save) {
        try {
          localStorage.removeItem(KEY);
          history.save = false;
          storageMessage =
            "Saving stopped for this path. Other app history is untouched.";
        } catch {
          storageMessage =
            "Could not change saving. Your progress is still available here.";
        }
      } else {
        history.save = true;
        persist();
      }
      render();
      document.querySelector("#pathSettings").open = true;
      say(storageMessage);
      return;
    }
    if (!run) return;
    if (name === "begin") {
      run.tasks = mixedTasks(practiceTasks(run.lesson));
      run.phase = run.tasks.length ? "practice" : "check";
      if (!run.tasks.length) run.tasks = checkTasks(run.lesson);
      run.index = 0;
      message = "";
      render(true);
      return;
    }
    if (name === "check" || name === "retry") {
      run.phase = "check";
      run.helped = new Set();
      run.tasks = checkTasks(run.lesson);
      run.index = 0;
      run.finished = false;
      message = "";
      render(true);
      return;
    }
    if (name === "replay") {
      if (run.isReview) {
        run = null;
        startReview();
      } else {
        const id = run.lesson.id;
        run = null;
        start(id);
      }
      return;
    }
    const t = run.tasks[run.index];
    if (!t) return;
    if (name === "advance") {
      if (t.kind !== "look" && !t.solved) return;
      PathSRS.advance(history);
      persist();
      run.index++;
      message = "";
      if (run.index === run.tasks.length) {
        if (run.phase === "practice") {
          run.phase = "recap";
          render(true);
        } else finish();
      } else render(true);
      return;
    }
    if (t.solved) return;
    if (name === "help") {
      help(undefined, "hint");
      return;
    }
    if (name === "skip-mixed" && t.srs) {
      PathSRS.defer(history, t.srsId, PathSRS.context(history, run.lesson.id));
      t.solved = true;
      t.skipped = true;
      action("advance", "");
      return;
    }
    if (name === "answer-word" || name === "answer-picture") {
      if (id === t.word.id)
        correct(`${t.word.word} — ${t.word.concept}. Matched.`);
      else help();
      return;
    }
    if (name === "position") {
      const ok =
        t.kind === "locate"
          ? t.word.letters[Number(id)] === t.character
          : Number(id) === t.position;
      if (ok) correct(`${t.word.letters[Number(id)]} found in ${t.word.word}.`);
      else
        help(
          `Look ${t.kind === "locate" ? `for ${t.character}` : t.position === 0 ? "at the first form on the left" : "at the last form on the right"}. Try again.`,
        );
      return;
    }
    if (name === "place") {
      if (id !== t.word.letters[t.placed.length]) {
        help(
          `Next is ${t.word.letters[t.placed.length]}. Follow the model from left to right.`,
        );
        return;
      }
      t.placed.push(id);
      if (t.placed.length === 2)
        correct(`${t.word.word} built. Both forms are in order.`);
      else {
        message = "First form placed. Add the last.";
        render();
      }
      return;
    }
    if (name === "insert" || name === "delete") {
      t.typed =
        name === "insert"
          ? t.typed + id
          : FidalText.graphemes(t.typed).slice(0, -1).join("");
      const input = document.querySelector("#pathWordEntry");
      input.value = t.typed;
      input.focus();
      return;
    }
    if (name === "compare") {
      if (t.composing) {
        say("Finish entering the form, then check the word.");
        return;
      }
      if (
        FidalText.normalize(t.typed).trim() === FidalText.normalize(t.word.word)
      )
        correct(
          `${t.word.word} entered in Fidäl. Text matched; handwriting and pronunciation are not assessed.`,
        );
      else
        help(
          `Compare with ${t.word.word}. Keep both forms in order, then try again.`,
        );
    }
  }
  host.addEventListener("click", (event) => {
    const b = event.target.closest("button[data-path]");
    if (b && !b.disabled)
      try {
        action(b.dataset.path, b.dataset.id);
      } catch (error) {
        failed(error);
      }
  });
  host.addEventListener("input", (event) => {
    if (event.target.id === "pathWordEntry" && run?.tasks[run.index])
      run.tasks[run.index].typed = event.target.value;
  });
  host.addEventListener("compositionstart", (event) => {
    if (event.target.id === "pathWordEntry")
      run.tasks[run.index].composing = true;
  });
  host.addEventListener("compositionend", (event) => {
    if (event.target.id === "pathWordEntry") {
      run.tasks[run.index].composing = false;
      run.tasks[run.index].typed = event.target.value;
    }
  });
  host.addEventListener("keydown", (event) => {
    if (
      event.target.id === "pathWordEntry" &&
      event.key === "Enter" &&
      !event.isComposing &&
      !run.tasks[run.index].composing
    ) {
      event.preventDefault();
      action("compare", "");
    }
  });
  try {
    if (
      !globalThis.WordPath ||
      !globalThis.PathSRS ||
      !globalThis.WordPathContent ||
      !globalThis.FidalText ||
      !globalThis.FidalContent
    )
      throw Error(
        "Some local source files did not load. Reload, or use the picture library.",
      );
    data = WordPath.validate(WordPathContent);
    history = WordPath.fresh();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        history = WordPath.restore(JSON.parse(raw), data);
        if (!history.save)
          storageMessage =
            "The saved path could not be used. It has been left untouched; this visit starts fresh.";
      }
    } catch {
      storageMessage =
        "Saved progress could not be read. Practice still works in this tab.";
    }
    PathSRS.open(data, history);
    persist();
    render();
    let learnerView = null;
    function inspect(id, step) {
      const lesson = data.lessons.find((l) => l.id === id);
      if (!preview() || !lesson) return;
      run = null;
      start(id);
      const [phase, number] = step.split(":");
      if (!lesson.available) {
        run.phase = "outline";
        run.outlineStep = Number.isInteger(Number(number))
          ? Number(number)
          : -1;
      } else if (["practice", "check"].includes(phase)) {
        run.tasks =
          phase === "practice" ? practiceTasks(lesson) : checkTasks(lesson);
        if (!run.tasks.length) return;
        run.phase = phase;
        run.index = Math.min(
          run.tasks.length - 1,
          Number.isInteger(Number(number)) ? Math.max(0, Number(number)) : 0,
        );
      } else if (["intro", "recap", "done"].includes(phase)) run.phase = phase;
      render(true);
      globalThis.DeveloperPreview.select(id, step);
    }
    globalThis.DeveloperPreview?.register({
      lessons: () =>
        data.lessons.map((l) => ({
          id: l.id,
          label: `Unit ${l.unit} · ${l.title}${l.kind === "checkpoint" ? " · checkpoint" : ""}`,
        })),
      steps(id) {
        const l = data.lessons.find((l) => l.id === id);
        if (!l) return [];
        if (!l.available)
          return [
            { id: "outline", label: "Content outline and missing material" },
            ...l.recipe.map((s, i) => ({
              id: `outline:${i}`,
              label: `Planned step ${i + 1} · ${s}`,
            })),
          ];
        const previous = run;
        try {
          run = {
            lesson: l,
            words: PathSRS.focus(data, l).map((id) =>
              data.words.find((w) => w.id === id),
            ),
          };
          return [
            { id: "intro", label: "Introduction" },
            ...practiceTasks(l).map((t, i) => ({
              id: `practice:${i}`,
              label: `Practice ${i + 1} · ${t.kind} · ${t.word.word}`,
            })),
            { id: "recap", label: "Recap" },
            ...checkTasks(l).map((t, i) => ({
              id: `check:${i}`,
              label: `Check ${i + 1} · ${t.kind} · ${t.word.word}`,
            })),
            { id: "done", label: "End screen · no completion" },
          ];
        } finally {
          run = previous;
        }
      },
      navigate: inspect,
      onChange(active) {
        destroyDrawing();
        if (active) {
          learnerView = {
            history,
            run,
            view,
            message,
            storageMessage,
            notebook,
          };
          history = JSON.parse(JSON.stringify(history));
          run = null;
          view = "map";
          message = "";
          notebook = globalThis.FidalWriting?.createNotebook();
        } else if (learnerView) {
          ({ history, run, view, message, storageMessage, notebook } =
            learnerView);
          learnerView = null;
        }
        render();
      },
    });
  } catch (error) {
    failed(error);
  }
})();
