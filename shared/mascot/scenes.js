/* Decorative animal companion for the standalone screens. Never reads or writes learning history. */
(function (root) {
  "use strict";
  const doc = root.document,
    script = doc.currentScript,
    scene = script?.dataset.neriScene;
  if (!scene) return;
  const base = new URL("assets/", script.src),
    slot = doc.querySelector(`[data-neri-scene="${scene}"]:not(script)`);
  const labels = {
    idle: "welcoming you",
    listening: "listening attentively",
    thinking: "thinking",
    encouraging: "encouraging you",
    celebrating: "celebrating practice",
    kind: "offering gentle support",
    resting: "staying quiet",
    sleepy: "curled up for a bedtime story",
  };
  let quiet = false,
    scheduled = false,
    disposed = false;
  const images = new WeakSet();
  function state() {
    if (scene === "stories")
      return doc.querySelector(".story-reader")
        ? ["sleepy", "A quiet story, at your pace.", false]
        : ["idle", "A little adventure. A gentle ending.", false];
    if (scene === "unit1") {
      const active = doc.querySelector(".screen.show");
      return [
        active?.id === "journeyScreen" &&
        active.querySelector(".journey-outcome")
          ? "celebrating"
          : "resting",
        "Take your time. One form at a time.",
        !active || active.id === "home" || active.id === "parent",
      ];
    }
    if (scene === "path")
      return doc.querySelector("#wordPath .finish-bloom")
        ? ["celebrating", "Practice completed. Take a little pause.", false]
        : doc.querySelector("#wordPath .path-intro")
          ? ["idle", "One small step at a time.", false]
          : ["resting", "Look closely. Try at your pace.", false];
    if (scene === "games")
      return doc.querySelector("#gameRoot .completion")
        ? ["celebrating", "A little more familiar.", false]
        : doc.querySelector("#gameRoot .play-card")
          ? ["resting", "Take your time.", false]
          : ["encouraging", "Look first. Then have a go.", false];
    return ["idle", "I’m Neri. Let’s take a small step.", false];
  }
  function setImage(img, s, decorative = false) {
    if (!images.has(img)) {
      images.add(img);
      img.addEventListener("error", () => {
        img.hidden = true;
      });
      img.addEventListener("load", () => {
        img.hidden = false;
      });
    }
    const src = new URL(`neri-${s}.svg`, base).href;
    if (img.src !== src) img.src = src;
    const alt = decorative ? "" : `Neri the bear, ${labels[s] || labels.idle}.`;
    if (img.alt !== alt) img.alt = alt;
    if (img.dataset.neriState !== s) img.dataset.neriState = s;
  }
  function refresh() {
    scheduled = false;
    if (disposed) return;
    const [s, caption, hide] = state();
    if (slot) {
      if (slot.hidden !== hide) slot.hidden = hide;
      slot.dataset.neriState = s;
      setImage(slot.querySelector("[data-neri-image]"), s);
      const text = slot.querySelector("figcaption p");
      if (text.textContent !== caption) text.textContent = caption;
    }
    for (const img of doc.querySelectorAll("img[data-neri-actor]")) {
      let actor = img.dataset.neriActor;
      if (actor === "help")
        actor = doc.querySelector(
          "#gameScreen .hint-target, #pairGrid .hint-target",
        )
          ? "kind"
          : "encouraging";
      setImage(img, actor, img.getAttribute("aria-hidden") === "true");
    }
  }
  if (slot) {
    const button = slot.querySelector("button");
    button.hidden = false;
    button.addEventListener("click", () => {
      quiet = !quiet;
      slot.dataset.quiet = String(quiet);
      button.textContent = quiet ? "Show Neri" : "Quiet view";
      button.setAttribute("aria-pressed", String(quiet));
    });
  }
  const observer = new root.MutationObserver((records) => {
    if (records.every((r) => slot?.contains(r.target))) return;
    if (!scheduled) {
      scheduled = true;
      root.queueMicrotask(refresh);
    }
  });
  observer.observe(doc.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "hidden", "data-result", "disabled"],
  });
  refresh();
  root.addEventListener(
    "pagehide",
    () => {
      disposed = true;
      observer.disconnect();
    },
    { once: true },
  );
  root.addEventListener("pageshow", () => {
    if (disposed) {
      disposed = false;
      observer.observe(doc.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["class", "hidden", "data-result", "disabled"],
      });
      refresh();
    }
  });
})(globalThis);
