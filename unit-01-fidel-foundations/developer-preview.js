/* A view-only adapter. The normal Unit 1 sequence and source content stay intact. */
(function () {
  "use strict";
  let saved = null;
  function inspect(id, step) {
    if (!globalThis.DeveloperPreview?.enabled) return;
    if (id === "review") {
      show("home");
      qsa(".tab")
        .find((t) => t.dataset.view === "review")
        .click();
      updateProgress();
      globalThis.DeveloperPreview.select(id, step);
      return;
    }
    if (!lessons[id]) return;
    openFamily(id);
    const [phase, n] = step.split(":");
    index = Math.min(
      active.forms.length - 1,
      Number.isInteger(Number(n)) ? Math.max(0, Number(n)) : 0,
    );
    renderLesson();
    if (phase === "match") startShapeMatch();
    else if (phase === "write") toggleWriting();
    else if (phase === "recap") {
      familyJourney.phase = "recap";
      renderFamilyJourney();
    } else if (phase === "check") {
      const forms = [
        active.forms[index],
        ...active.forms.filter((_, i) => i !== index),
      ];
      familyJourney.check = UnitJourney.createCheck(
        forms.map((script, i) => ({ id: `${id}-${i}`, script })),
        UnitJourney.shapeQuestion,
      );
      familyJourney.phase = "check";
      renderFamilyJourney();
    } else if (phase === "done") {
      familyJourney.phase = "result";
      renderFamilyJourney();
    }
    show(
      ["recap", "check", "done"].includes(phase) ? "journeyScreen" : "lesson",
    );
    globalThis.DeveloperPreview.select(id, step);
  }
  globalThis.DeveloperPreview?.register({
    lessons: () => [
      ...Object.entries(lessons).map(([id, l]) => ({
        id,
        label: `Unit 1 · ${l.label} · ${id}`,
      })),
      { id: "review", label: "Unit 1 · Gentle review" },
    ],
    steps(id) {
      const l = lessons[id];
      if (!l) return [{ id: "review", label: "All review activities" }];
      return [
        ...l.forms.flatMap((form, i) => [
          { id: `meet:${i}`, label: `Meet · ${form}` },
          { id: `write:${i}`, label: `Write · ${form}` },
          { id: `match:${i}`, label: `Match · ${form}` },
          { id: `check:${i}`, label: `Checkpoint · ${form}` },
        ]),
        { id: "recap", label: "Family recap" },
        { id: "done", label: "End screen · no completion" },
      ];
    },
    navigate: inspect,
    onChange(enabled) {
      writingController?.destroy();
      writingController = null;
      if (enabled) {
        saved = {
          explored,
          active,
          activeLetter,
          index,
          learnerMode,
          breakOn,
          checking,
          shapeMatched,
          practisedForms,
          checkedFamilies,
          familyJourney,
          writingNotebook,
          screen: qs(".screen.show")?.id || "home",
        };
        explored = new Set(explored);
        practisedForms = new Map(
          [...practisedForms].map(([id, forms]) => [id, new Set(forms)]),
        );
        checkedFamilies = new Map(checkedFamilies);
        familyJourney = { phase: "none", check: null };
        active = null;
        activeLetter = null;
        writingNotebook = FidalWriting.createNotebook();
        show("home");
        qs(".more-families").open = true;
      } else if (saved) {
        const screen = saved.screen;
        ({
          explored,
          active,
          activeLetter,
          index,
          learnerMode,
          breakOn,
          checking,
          shapeMatched,
          practisedForms,
          checkedFamilies,
          familyJourney,
          writingNotebook,
        } = saved);
        saved = null;
        if (active && screen === "lesson") {
          const wasChecking = checking,
            wasMatched = shapeMatched;
          renderLesson();
          if (wasChecking) {
            shapeMatched = wasMatched;
            startShapeMatch();
            if (wasMatched)
              qs("#nextBtn").textContent =
                index === active.forms.length - 1 ? "Recap" : "Next shape";
          }
        } else if (active && screen === "journeyScreen") renderFamilyJourney();
        setMode(learnerMode);
        show(screen);
      }
      updateProgress();
    },
  });
})();
