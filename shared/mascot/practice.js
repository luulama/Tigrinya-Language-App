/* Optional enhancement of the existing card activity. No scoring, storage or capture. */
(function (root) {
  "use strict";
  const doc = root.document,
    motion = root.matchMedia("(prefers-reduced-motion: reduce)");
  let widget = null,
    companion = null,
    audioDriver = null,
    quiet = false,
    still = false;
  const esc = (s) =>
    String(s).replace(
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
  const frame = () => root.requestAnimationFrame.bind(root);
  function stopAudio() {
    audioDriver?.stop();
    audioDriver = null;
  }
  function message(context) {
    if (context.phase === "paused")
      return ["resting", "A quiet pause. Your place is waiting."];
    if (context.phase === "complete")
      return ["celebrating", "A small practice, well spent."];
    if (context.phase === "home")
      return ["idle", "I’m Neri. One small step at a time."];
    if (["recording", "requesting"].includes(context.voiceStatus))
      return ["listening", "Take your time. Your private try isn’t graded."];
    if (context.audioError)
      return ["kind", "The recording didn’t play. You can try again."];
    if (context.voiceStatus === "error")
      return ["kind", "The microphone is optional. You can keep practising."];
    if (context.playback === "loading")
      return ["thinking", "Getting the model ready."];
    if (context.playback === "playing")
      return ["listening", "Listen to the reviewed model."];
    if (context.phase === "attempt")
      return ["resting", "Your turn. I’ll stay quiet."];
    if (context.phase === "feedback")
      return context.rating === "got"
        ? ["celebrating", "You made a careful comparison."]
        : context.rating === "need"
          ? ["kind", "Another visit can help."]
          : ["encouraging", "There is room to try again."];
    return ["encouraging", "Have a look. Then try when you’re ready."];
  }
  function guide(host, card, p, context, reopen) {
    const C = root.MascotArticulation;
    const el = doc.createElement("details");
    el.className = "neri-guide";
    el.dataset.profile = p.id;
    el.open = !!reopen;
    el.innerHTML = `<summary>Watch the lips with Neri</summary><p class="neri-eyebrow">Consonant movement · not the whole form</p><p class="neri-diagram-label">Schematic human lips · Neri is your guide.</p><p>${esc(p.title)}</p><div class="neri-focus"><div id="neriCloseup"></div></div><p id="neriCue" class="neri-cue" role="status"></p><div class="neri-steps" role="group" aria-label="Lip movement steps">${p.steps.map((s, i) => `<button type="button" data-neri-step="${i}" aria-pressed="${i === 0}"><span class="neri-mini" aria-hidden="true">${root.Neri.svg("demonstrating", true, s.pose)}</span>${i + 1} · ${esc(s.label)}</button>`).join("")}</div><div class="neri-controls"><button type="button" data-neri="play">Play lip movement</button><button type="button" data-neri="stop" hidden>Stop movement</button><label><input type="checkbox" id="neriSlow"> Slow</label></div><label class="neri-still"><input type="checkbox" id="neriStill"> Still steps</label><p class="neri-status" id="neriStatus" role="status">Silent visual guide. A reviewed recording and lip timing are still needed.</p><p class="neri-limit">This shows only the consonant part of <span lang="ti" dir="ltr">${esc(card.character)}</span>. Its vowel and whole reading need a reviewed Tigrinya model. The drawing and guidance await fluent-speaker and phonetics review.</p><details><summary>For grown-ups &amp; reviewers</summary><p>${esc(p.limits)}</p><p>Tutorial speed is for watching, not the sound’s real duration. No pronunciation grade is awarded.</p><p><a href="../MASCOT.md">Design, sources and review requirements</a></p></details>`;
    host.querySelector(".say-reveal").after(el);
    const face = root.Neri.create(el.querySelector("#neriCloseup"), {
      state: "demonstrating",
      closeup: true,
    });
    let raf = null,
      active = false,
      step = 0,
      disposed = false;
    const status = el.querySelector("#neriStatus"),
      cue = el.querySelector("#neriCue"),
      play = el.querySelector('[data-neri="play"]'),
      stop = el.querySelector('[data-neri="stop"]'),
      stillInput = el.querySelector("#neriStill");
    const isStatic = () => still || motion.matches;
    function flags() {
      const busy =
        context.playback === "loading" ||
        context.playback === "playing" ||
        ["recording", "requesting"].includes(context.voiceStatus);
      el.dataset.neriStatic = String(isStatic());
      doc.documentElement.dataset.neriStatic = String(isStatic());
      stillInput.checked = isStatic();
      stillInput.disabled = motion.matches;
      play.hidden = isStatic() || active;
      play.disabled = busy;
      stop.hidden = !active;
      el.querySelector("#neriSlow").disabled = busy || active;
      el.querySelectorAll("[data-neri-step]").forEach(
        (b) => (b.disabled = busy),
      );
    }
    function apply(value, automatic = false) {
      if (disposed || !value) {
        if (!disposed) face.pose({ open: 0.1, contact: 0, nasal: 0 });
        return;
      }
      face.pose(value.pose);
      if (
        el.open &&
        doc.querySelector('.neri-companion [data-neri-state="demonstrating"]')
      )
        companion?.pose(value.pose);
      if (step !== value.stage || !cue.textContent) {
        step = value.stage;
        cue.textContent = p.steps[step].cue;
        el.querySelectorAll("[data-neri-step]").forEach((b) =>
          b.setAttribute(
            "aria-pressed",
            String(Number(b.dataset.neriStep) === step),
          ),
        );
      }
      if (automatic) cue.setAttribute("aria-live", "off");
      else cue.setAttribute("aria-live", "polite");
    }
    function halt(note) {
      if (raf !== null) root.cancelAnimationFrame(raf);
      raf = null;
      active = false;
      if (note) status.textContent = note;
      flags();
      const [state, caption] = message(context);
      companion?.update({ state, caption });
    }
    function showStep(n, chosen = false) {
      halt();
      if (chosen)
        companion?.update({
          state: "demonstrating",
          caption: "Watch the lip position.",
        });
      apply({ pose: p.steps[n].pose, stage: n });
      status.textContent = isStatic()
        ? "Still steps. Choose each picture at your own pace."
        : "Silent visual guide. Native audio and reviewed lip timing are still needed.";
    }
    function playVisual() {
      if (disposed || play.disabled || isStatic()) return;
      halt();
      active = true;
      flags();
      stop.focus({ preventScroll: true });
      const duration = el.querySelector("#neriSlow").checked ? 4800 : 2400,
        frames = C.frames(p, duration),
        started = root.performance.now();
      status.textContent =
        "Silent lip movement. This is not synchronized speech.";
      const draw = (time) => {
        if (disposed || !active) return;
        const elapsed = Math.min(duration, Math.max(0, time - started));
        apply(C.at(frames, elapsed), true);
        if (elapsed < duration) raf = frame()(draw);
        else {
          const keepFocus = doc.activeElement === stop;
          halt("Movement finished. Your turn, or choose a still step.");
          if (keepFocus) play.focus({ preventScroll: true });
          companion?.update({
            state: "encouraging",
            caption: "Try when you’re ready.",
          });
        }
      };
      companion?.update({
        state: "demonstrating",
        caption: "Watch the lip movement.",
      });
      raf = frame()(draw);
    }
    const click = (e) => {
      const b = e.target.closest("[data-neri-step], [data-neri]");
      if (!b || b.disabled) return;
      if (b.dataset.neriStep !== undefined)
        showStep(Number(b.dataset.neriStep), true);
      else if (b.dataset.neri === "play") playVisual();
      else {
        halt("Movement stopped. Choose a still step or replay.");
        play.focus();
      }
    };
    const change = (e) => {
      if (e.target === stillInput) {
        still = stillInput.checked;
        halt();
        showStep(step);
      }
    };
    const toggle = () => {
      if (!el.open) halt();
    };
    const reduce = () => {
      halt();
      flags();
      if (isStatic()) showStep(step);
    };
    el.addEventListener("click", click);
    el.addEventListener("change", change);
    el.addEventListener("toggle", toggle);
    motion.addEventListener("change", reduce);
    showStep(0);
    return {
      element: el,
      card,
      profile: p,
      apply,
      status,
      isStatic,
      stop: halt,
      destroy() {
        halt();
        disposed = true;
        face.destroy();
        el.removeEventListener("click", click);
        el.removeEventListener("change", change);
        el.removeEventListener("toggle", toggle);
        motion.removeEventListener("change", reduce);
      },
    };
  }
  function render(
    host,
    phase,
    card,
    rating,
    playback,
    voiceStatus,
    audioError,
  ) {
    const context = { phase, card, rating, playback, voiceStatus, audioError };
    const oldOpen =
      widget?.element.open && widget.card.character === context.card?.character;
    widget?.destroy();
    widget = null;
    companion?.destroy();
    companion = null;
    host
      .querySelectorAll(".neri-companion,.neri-guide,.neri-unavailable")
      .forEach((e) => e.remove());
    if (!root.Neri || !host.querySelector(".say-panel h1")) return;
    const panel = host.querySelector(".say-panel"),
      hero = panel.querySelector(".say-hero-art"),
      banner = doc.createElement("div");
    panel.classList.toggle("neri-home", context.phase === "home");
    if (hero) hero.hidden = true;
    banner.className = "neri-companion";
    banner.dataset.quiet = String(quiet);
    banner.innerHTML =
      '<div data-neri-host></div><button type="button" data-neri-quiet></button>';
    panel.querySelector("h1").after(banner);
    const [state, caption] = message(context);
    companion = root.Neri.create(banner.querySelector("[data-neri-host]"), {
      state,
      caption,
    });
    const toggle = banner.querySelector("button");
    function updateQuiet() {
      banner.dataset.quiet = String(quiet);
      toggle.textContent = quiet ? "Show Neri" : "Quiet view";
      toggle.setAttribute("aria-pressed", String(quiet));
    }
    toggle.addEventListener("click", () => {
      quiet = !quiet;
      updateQuiet();
      if (quiet) widget?.stop();
    });
    updateQuiet();
    if (context.phase !== "reveal") return;
    const p = root.MascotArticulation?.profile(
      root.MascotArticulationData,
      context.card,
    );
    if (p) widget = guide(panel, context.card, p, context, oldOpen);
    else {
      const note = doc.createElement("p");
      note.className = "neri-unavailable";
      note.textContent = root.MascotArticulationData
        ? "A reviewed mouth guide is still needed for this form. Keep using the cards or practise with a fluent speaker."
        : "The visual guide could not load. Your cards still work.";
      panel.querySelector(".say-reveal").after(note);
    }
  }
  function audioPlaying(audio, card, slow) {
    stopAudio();
    widget?.stop();
    if (!widget || widget.card.character !== card.character) return;
    const C = root.MascotArticulation,
      a = C.alignment(
        root.MascotArticulationData,
        card,
        slow,
        root.PronunciationCards.ready(card),
      );
    if (!a) {
      widget.apply(null);
      widget.status.textContent =
        "Recording plays without lip sync. Reviewed timing data is not available.";
      return;
    }
    let lastState = "";
    audioDriver = C.follow(audio, a, {
      staticMode: widget.isStatic(),
      onPose: (value) => widget?.apply(value, true),
      onState: (state) => {
        if (!widget) return;
        if (lastState !== state) {
          companion?.update({
            state: state === "synced" ? "demonstrating" : "listening",
            caption:
              state === "synced"
                ? "Watch the reviewed consonant movement."
                : "Listen to the reviewed model.",
          });
          lastState = state;
        }
        widget.status.textContent = {
          synced:
            "Lip movement follows the reviewed consonant segment. The vowel is not animated.",
          listening:
            "Listen to the recording. The lip guide covers its consonant segment only.",
          static:
            "Audio plays with still steps. Choose a picture after the recording.",
          paused: "Lip movement paused with the recording.",
          unavailable:
            "The recording timing does not match this guide. Listen without lip sync.",
        }[state];
      },
    });
  }
  function stop() {
    stopAudio();
    widget?.stop();
  }
  motion.addEventListener("change", () => {
    if (motion.matches) {
      stopAudio();
      widget?.stop();
    }
  });
  doc.addEventListener("visibilitychange", () => {
    if (doc.hidden) stop();
  });
  root.addEventListener("pagehide", stop);
  root.MascotPractice = { render, audioPlaying, stopAudio, stop };
})(globalThis);
