(function (root) {
  "use strict";
  const doc = root.document,
    host = doc.querySelector("#cardsApp"),
    settings = doc.querySelector("#cardSettings"),
    pauseButton = doc.querySelector("#pauseButton");
  const escape = (s) =>
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
  const uid = () =>
    root.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let S,
    store,
    cards,
    history,
    sessionId,
    queue = [],
    position = 0,
    returns = 0,
    family = "በ",
    phase = "home",
    beforePause = null,
    item = null;
  let heard = false,
    audioError = false,
    playback = "idle",
    reference = null,
    myAudio = null,
    recall = null,
    eventId = null,
    retryUsed = false,
    rating = null;
  let recorder = null,
    stream = null,
    chunks = [],
    voiceUrl = null,
    voiceStatus = "idle",
    voiceMessage = "",
    token = 0,
    timeout = null;
  const now = () => Date.now();
  const current = () =>
    cards.find((c) => c.character === queue[position]?.character);
  function announce(text) {
    doc.querySelector("#sayAnnouncement").textContent = text;
  }
  function persist() {
    store.write(history);
    renderSettings();
  }
  function renderSettings() {
    if (!store) return;
    const entries = Object.values(history.items),
      reported = entries.reduce((n, i) => n + i.delayedSelfRatings, 0);
    settings.innerHTML = `<p>${entries.length} forms practised · ${reported} later-day self-ratings. These are your reflections, not pronunciation grades.</p><p id="cardSaveStatus" role="status">${store.error ? "Saving is unavailable. Practice still works in this tab." : root.LearningPath.saving ? "Practice is saved on this device." : "Practice stays in this tab unless you choose to save."}</p><button type="button" data-say="save">${root.LearningPath.saving ? "Stop saving on this device" : "Save practice on this device"}</button><p>Uses the existing Unit 1 practice profile. Stopping saving removes that saved profile, including its visual checks, while keeping this tab. Voice clips are never included.</p>`;
  }
  function focusHeading() {
    const h = host.querySelector("h1");
    if (h) h.focus({ preventScroll: true });
  }
  const actions = (content) => `<div class="say-actions">${content}</div>`;
  const button = (action, text, primary = false, extra = "") =>
    `<button type="button" data-say="${action}" ${primary ? 'class="primary"' : ""} ${extra}>${text}</button>`;
  function microphoneSupported() {
    return !!(
      root.isSecureContext &&
      root.navigator?.mediaDevices?.getUserMedia &&
      root.MediaRecorder &&
      root.URL?.createObjectURL
    );
  }
  function voicePanel() {
    return `<details class="say-voice" ${voiceStatus !== "idle" || voiceUrl ? "open" : ""}><summary>Listen to my try · optional</summary><p>Only this card. Nothing is uploaded or saved. The clip is deleted when you continue, pause or leave. In a noisy place, simply say it aloud.</p>${!microphoneSupported() ? '<p role="status">Recording is unavailable here. You can speak without a microphone.</p>' : `<div class="say-actions">${voiceStatus === "recording" ? button("stop-record", "Stop recording") : voiceStatus === "requesting" ? button("cancel-record", "Cancel microphone request") : button("record", voiceUrl ? "Record a new try" : "Record my try")}${voiceUrl ? button("my-voice", "Hear my try") + button("discard", "Delete my clip") : ""}</div><p class="${voiceStatus === "recording" ? "say-recording" : ""}" role="status">${escape(voiceMessage || "Your microphone stays off until you choose Record my try. Clips stop after eight seconds.")}</p>`}</details>`;
  }
  function stopReference() {
    // NERI:BEGIN
    root.MascotPractice?.stopAudio();
    // NERI:END
    if (reference) {
      reference.onended = reference.onerror = reference.onplaying = null;
      reference.pause();
      reference.removeAttribute("src");
      reference.load();
      reference = null;
    }
    playback = "idle";
  }
  function clearVoice() {
    token++;
    root.clearTimeout(timeout);
    timeout = null;
    if (recorder) {
      recorder.ondataavailable = recorder.onstop = recorder.onerror = null;
      if (recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {}
      }
      recorder = null;
    }
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    chunks = [];
    if (myAudio) {
      myAudio.pause();
      myAudio.removeAttribute("src");
      myAudio.load();
      myAudio = null;
    }
    if (voiceUrl) {
      root.URL.revokeObjectURL(voiceUrl);
      voiceUrl = null;
    }
    voiceStatus = "idle";
    voiceMessage = "";
  }
  function cleanup() {
    // NERI:BEGIN
    root.MascotPractice?.stop();
    // NERI:END
    stopReference();
    clearVoice();
  }
  function support(c) {
    const siblings = cards.filter((x) => x.family === c.family);
    return `<div class="say-reveal"><p class="say-eyebrow">${escape(c.family)} FAMILY · ORDER ${c.order}</p><div class="say-family" aria-label="Forms in this family">${siblings.map((x) => `<${x.character === c.character ? "b" : "span"} lang="ti" dir="ltr">${escape(x.character)}</${x.character === c.character ? "b" : "span"}>`).join(" ")}</div>${c.order === 6 ? '<p class="say-micro">This order needs a word context for its reading.</p>' : '<p class="say-micro">Say the form, rather than an English-style letter name.</p>'}${S.ready(c) && c.target.kind === "contextual-word" ? `<p>Say the reviewed word <span lang="ti" dir="ltr">${escape(c.target.text)}</span>.</p>` : ""}${S.ready(c) && c.target.guide ? `<p>${escape(c.target.guide)}</p>` : ""}</div>`;
  }
  function render() {
    pauseButton.hidden = !["attempt", "reveal", "feedback"].includes(phase);
    if (phase === "home") {
      const available = cards.filter(S.ready).length;
      const families = [...new Set(cards.map((c) => c.family))];
      host.innerHTML = `<article class="say-panel"><p class="say-eyebrow">A LITTLE SPACE TO REMEMBER</p><h1 tabindex="-1">Say &amp; remember</h1><div class="say-hero-art" aria-hidden="true">${cards
        .slice(0, 3)
        .map(
          (c) =>
            `<span class="say-mini-card" lang="ti" dir="ltr">${escape(c.character)}</span>`,
        )
        .join(
          "",
        )}</div><p>Try the form. Hear its model. Choose what needs another visit.</p><div class="say-sequence" aria-label="Practice sequence"><span>1 · Say</span><span>2 · Compare</span><span>3 · Revisit</span></div>${available ? `<p class="say-micro">${available} forms have reviewed models. Other cards offer unscored practice.</p>` : '<p class="say-notice">Native recordings are needed. Explore the cards now; pronunciation practice is unscored.</p>'}<p class="say-micro">New to a form? Learn its sound with a fluent speaker first. No microphone is needed.</p><div class="say-options"><label for="cardFamily">Choose a small set</label><select id="cardFamily"><option value="all" ${family === "all" ? "selected" : ""}>Mix families · 5 cards</option>${families.map((f) => `<option value="${escape(f)}" ${f === family ? "selected" : ""}>${escape(f)} family · up to 5 cards</option>`).join("")}</select></div>${actions(button("start", "Begin 5 cards →", true))}<p class="say-micro">A short practice, with room to pause.</p></article>`;
    } else if (phase === "paused") {
      host.innerHTML = `<article class="say-panel"><span class="say-check" aria-hidden="true">Ⅱ</span><h1 tabindex="-1">A little pause.</h1><p>Your place is waiting in this tab. The microphone is off and your voice clip has been deleted.</p>${actions(button("resume", "Continue my cards", true) + button("home", "Choose a set"))}</article>`;
    } else if (phase === "complete") {
      host.innerHTML = `<article class="say-panel"><span class="say-check" aria-hidden="true">✦</span><p class="say-eyebrow">A PRACTICE WELL SPENT</p><h1 tabindex="-1">Room to remember.</h1><p>You visited ${new Set(queue.map((q) => q.character)).size} forms. The ones needing support can return after other cards or on another day.</p><p class="say-micro">Your reflections guide practice. They do not prove pronunciation mastery.</p>${actions(button("start", "Play another small set", true) + button("home", "Choose a set"))}<p><a href="index.html">Back to Fidäl families →</a></p></article>`;
    } else {
      const c = current(),
        usable = S.ready(c),
        revealed = phase !== "attempt";
      const hint =
        c.order === 6 && !usable ? "Explore this form." : "Say this aloud.";
      const id = queue[position].supported
        ? "A supported revisit"
        : "Your turn";
      let body = "";
      if (phase === "attempt")
        body = `<p>${c.order === 6 && !usable ? "Its reading needs a reviewed word context." : usable && c.target.kind === "contextual-word" ? "Try its reading in the word, then compare." : "Try from memory, if you know it."}</p>${usable && c.target.kind === "contextual-word" ? `<p class="say-family" lang="ti" dir="ltr">${escape(c.target.text)}</p>` : ""}${actions(button("attempt", "I tried · show support", true))}${voicePanel()}${actions(button("skip", "Skip this card"))}`;
      else if (phase === "reveal") {
        body = support(c);
        if (usable)
          body += `${actions(button("hear", playback === "loading" ? "Loading model…" : playback === "playing" ? "Playing model…" : audioError ? "Retry audio" : heard ? "Hear it again" : "Hear it", true, playback === "loading" || playback === "playing" ? "disabled" : "") + button("slow", "Hear it slowly", false, playback === "loading" || playback === "playing" ? "disabled" : ""))}<p role="status" class="say-micro">${audioError ? "The model could not play. Retry audio, or continue unscored." : heard ? "Compare your try with the model. How did remembering feel?" : playback === "loading" ? "Getting the reviewed recording ready. You can continue unscored if it does not load." : "Listen to the whole model before choosing a rating."}</p>${heard ? `<div class="say-rating" role="group" aria-label="How well did you remember?"><button data-say="rate" data-rating="got"><span aria-hidden="true">✓</span>Got it</button><button data-say="rate" data-rating="almost"><span aria-hidden="true">≈</span>Almost</button><button data-say="rate" data-rating="need"><span aria-hidden="true">↻</span>Need to practise</button></div><p class="say-micro">Your choice, not a microphone score.</p>` : ""}`;
        else
          body += `<p class="say-notice" role="status">A fluent Tigrinya speaker’s recording is still needed. You can explore this form or say it with a fluent speaker. This visit is unscored.</p>`;
        body +=
          actions(
            button("retry", "Try again") +
              button(
                "unscored",
                usable ? "Continue without rating" : "Practised · continue",
                !usable,
              ),
          ) + voicePanel();
      } else {
        const feedback = {
          got: [
            "You made a comparison.",
            "We’ll leave more space when you remember it on later days.",
          ],
          almost: [
            "Nearly there. Keep it gentle.",
            "This form will return sooner, after some space.",
          ],
          need: [
            "Another visit can help.",
            "Listen again next time. Other forms come first.",
          ],
          unscored: [
            "A form revisited.",
            "No pronunciation result was recorded. A reviewed model is still needed for comparison.",
          ],
        }[rating];
        body = `<div class="say-feedback"><strong>${feedback[0]}</strong><p>${feedback[1]}</p></div>${actions(button("next", position + 1 < queue.length ? "Next card →" : "Finish practice →", true))}`;
      }
      host.innerHTML = `<article class="say-panel" data-phase="${phase}" data-character="${escape(c.character)}"><p class="say-eyebrow">${id} · ${position + 1} of ${queue.length}</p><div class="say-progress" role="progressbar" aria-label="Cards visited" aria-valuemin="0" aria-valuemax="${queue.length}" aria-valuenow="${position}"><i style="width:${(position / queue.length) * 100}%"></i></div><h1 tabindex="-1">${phase === "feedback" ? "One small step." : revealed ? "Listen. Compare. Reflect." : hint}</h1><div class="say-glyph" lang="ti" dir="ltr">${escape(c.character)}</div>${body}</article>`;
    }
    renderSettings();
    // NERI:BEGIN
    root.MascotPractice?.render(
      host,
      phase,
      current(),
      rating,
      playback,
      voiceStatus,
      audioError,
    );
    // NERI:END
  }
  function enterCard() {
    cleanup();
    item = queue[position];
    heard = false;
    audioError = false;
    retryUsed = false;
    rating = null;
    recall = null;
    eventId = uid();
    phase = "attempt";
    render();
    focusHeading();
  }
  function start() {
    cleanup();
    sessionId = S.session(history, now(), uid());
    queue = S.plan(cards, history, now(), family);
    position = 0;
    returns = 0;
    if (!queue.length) {
      host.innerHTML =
        '<article class="say-panel"><h1>No cards in this set.</h1><p>Choose another family.</p><button data-say="home">Choose a set</button></article>';
      return;
    }
    persist();
    enterCard();
  }
  function pause() {
    if (!["attempt", "reveal", "feedback"].includes(phase)) return;
    beforePause = phase;
    cleanup();
    phase = "paused";
    render();
    focusHeading();
  }
  async function playModel(slow) {
    if (phase !== "reveal" || !S.ready(current()) || playback !== "idle")
      return;
    if (voiceStatus === "recording" || voiceStatus === "requesting")
      clearVoice();
    if (myAudio) myAudio.pause();
    stopReference();
    audioError = false;
    playback = "loading";
    const c = current(),
      audio = new root.Audio(
        c.audio[slow ? "slow" : "normal"].replace(
          /^assets\//,
          "../shared/assets/",
        ),
      );
    reference = audio;
    audio.preload = "none";
    const failed = () => {
      if (reference !== audio) return;
      stopReference();
      heard = false;
      audioError = true;
      render();
      host.querySelector('[data-say="hear"]')?.focus();
      announce("The model could not play. Continue unscored or try again.");
    };
    audio.onerror = failed;
    audio.onplaying = () => {
      if (reference !== audio) return;
      playback = "playing";
      S.model(history, c.character, now());
      persist();
      render();
      // NERI:BEGIN
      root.MascotPractice?.audioPlaying(audio, c, slow);
      // NERI:END
    };
    audio.onended = () => {
      if (reference !== audio) return;
      stopReference();
      heard = true;
      render();
      host.querySelector(`[data-say="${slow ? "slow" : "hear"}"]`)?.focus();
      announce("Model finished. You can choose your own rating.");
    };
    render();
    try {
      await audio.play();
    } catch {
      failed();
    }
  }
  async function recordVoice() {
    if (!["attempt", "reveal"].includes(phase) || !microphoneSupported())
      return;
    stopReference();
    clearVoice();
    const request = token;
    voiceStatus = "requesting";
    voiceMessage =
      "Waiting for microphone permission. You can cancel and keep practising.";
    render();
    host.querySelector('[data-say="cancel-record"]')?.focus();
    try {
      const received = await root.navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      if (request !== token || !["attempt", "reveal"].includes(phase)) {
        received.getTracks().forEach((t) => t.stop());
        return;
      }
      stream = received;
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ].find((m) => root.MediaRecorder.isTypeSupported?.(m));
      recorder = mimeType
        ? new root.MediaRecorder(stream, { mimeType })
        : new root.MediaRecorder(stream);
      const active = recorder;
      chunks = [];
      active.ondataavailable = (e) => {
        if (request === token && e.data.size) chunks.push(e.data);
      };
      active.onerror = () => {
        if (request !== token) return;
        clearVoice();
        voiceMessage =
          "Recording stopped. You can speak aloud and continue without it.";
        voiceStatus = "error";
        render();
      };
      active.onstop = () => {
        if (request !== token) return;
        root.clearTimeout(timeout);
        stream?.getTracks().forEach((t) => t.stop());
        stream = null;
        recorder = null;
        const blob = new root.Blob(chunks, {
          type: active.mimeType || "audio/webm",
        });
        chunks = [];
        if (blob.size) {
          voiceUrl = root.URL.createObjectURL(blob);
          voiceMessage =
            "Your private clip is ready. It is not graded or saved.";
          voiceStatus = "ready";
        } else {
          voiceMessage =
            "No usable clip was captured. Speak aloud, or try recording again.";
          voiceStatus = "error";
        }
        render();
        host
          .querySelector('[data-say="my-voice"], [data-say="record"]')
          ?.focus();
      };
      active.start();
      voiceStatus = "recording";
      voiceMessage = "Recording your try. Stop when you’re ready.";
      timeout = root.setTimeout(() => {
        if (active.state === "recording") active.stop();
      }, 8000);
      render();
      host.querySelector('[data-say="stop-record"]')?.focus();
    } catch (e) {
      if (request !== token) return;
      clearVoice();
      voiceStatus = "error";
      voiceMessage = ["NotAllowedError", "SecurityError"].includes(e.name)
        ? "Microphone access was not allowed. Nothing was recorded. Speak aloud and continue; your practice is unaffected."
        : e.name === "NotFoundError"
          ? "No microphone was found. Speak aloud and continue."
          : "The microphone is busy or unavailable. Speak aloud and continue.";
      render();
      announce(voiceMessage);
    }
  }
  function finishRating(value) {
    if (phase !== "reveal") return;
    const c = current(),
      result = S.rate(history, c.character, value, {
        time: now(),
        id: eventId,
        sessionId,
        modelHeard: heard,
        ready: S.ready(c),
        supported: item.supported || retryUsed,
        recall,
      });
    if (!result && value !== "unscored") {
      announce(
        "This reflection could not be recorded. You can continue without rating.",
      );
      return;
    }
    if (S.revisit(queue, position, value, returns)) returns++;
    cleanup();
    rating = value;
    phase = "feedback";
    persist();
    render();
    focusHeading();
  }
  doc.addEventListener("click", (e) => {
    const b = e.target.closest("[data-say]");
    if (!b || b.disabled) return;
    const action = b.dataset.say;
    if (action === "start") start();
    else if (action === "home") {
      cleanup();
      phase = "home";
      render();
      focusHeading();
    } else if (action === "pause") pause();
    else if (action === "resume" && phase === "paused") {
      phase = beforePause;
      render();
      focusHeading();
    } else if (action === "attempt" && phase === "attempt") {
      clearVoiceIfPending();
      recall = S.attempt(history, current().character, now());
      phase = "reveal";
      render();
      focusHeading();
    } else if (action === "hear") playModel(false);
    else if (action === "slow") playModel(true);
    else if (action === "rate") finishRating(b.dataset.rating);
    else if (action === "unscored") finishRating("unscored");
    else if (action === "retry" && phase === "reveal") {
      cleanup();
      heard = false;
      retryUsed = true;
      phase = "attempt";
      render();
      focusHeading();
    } else if (
      (action === "skip" && phase === "attempt") ||
      (action === "next" && phase === "feedback")
    ) {
      const c = current();
      cleanup();
      S.advance(history, c.character);
      persist();
      position++;
      if (position < queue.length) enterCard();
      else {
        phase = "complete";
        render();
        focusHeading();
      }
    } else if (action === "record") recordVoice();
    else if (action === "stop-record" && recorder?.state === "recording") {
      recorder.stop();
      stream?.getTracks().forEach((t) => t.stop());
    } else if (["discard", "cancel-record"].includes(action)) {
      clearVoice();
      render();
    } else if (action === "my-voice" && voiceUrl) {
      stopReference();
      myAudio?.pause();
      const audio = new root.Audio(voiceUrl);
      myAudio = audio;
      audio.onended = () => {
        if (myAudio !== audio) return;
        voiceMessage =
          "Your try played. Compare it yourself; it is not graded.";
        render();
      };
      voiceMessage = "Playing your private try.";
      render();
      audio.play().catch(() => {
        if (myAudio !== audio) return;
        voiceMessage =
          "The clip could not play. Speak aloud or record another try.";
        render();
      });
    } else if (action === "save") {
      store.setSaving(!root.LearningPath.saving);
      persist();
      renderSettings();
      settings.querySelector("button")?.focus();
    }
  });
  function clearVoiceIfPending() {
    if (["recording", "requesting"].includes(voiceStatus)) clearVoice();
  }
  host.addEventListener("change", (e) => {
    if (e.target.id === "cardFamily") family = e.target.value;
  });
  doc.addEventListener("visibilitychange", () => {
    if (doc.hidden) pause();
  });
  root.addEventListener("pagehide", cleanup);
  doc
    .querySelectorAll("[data-say-exit]")
    .forEach((a) => a.addEventListener("click", cleanup));
  try {
    S = root.PronunciationCards;
    store = root.LearningPath?.cardPractice;
    if (!S || !store)
      throw Error(
        "The card game could not load. Your saved practice is safe. Return to Unit 1 and try again.",
      );
    cards = S.validate(root.PronunciationCardContent);
    history = S.restore(store.read(), cards);
    const reviewed = cards.filter(S.ready).length;
    doc.querySelector(".say-preview").textContent =
      `Native review pending · ${reviewed} of ${cards.length} forms have approved pronunciation models.`;
    render();
  } catch (e) {
    host.innerHTML = `<article class="say-panel"><h1 tabindex="-1">Let’s try again.</h1><p role="alert">${escape(e.message)}</p><a href="index.html">Return to Unit 1</a></article>`;
    pauseButton.hidden = true;
  }
})(globalThis);
