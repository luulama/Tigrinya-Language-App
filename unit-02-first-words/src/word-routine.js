/* Model fading for existing Unit 2 source candidates. No new language content. */
(function (root) {
  "use strict";
  const stages = Object.freeze({
    notice: Object.freeze({
      label: "Look",
      objective:
        "Connect the existing picture and written word; notice its two Fidäl forms.",
      instruction: "Look at the word and its two forms.",
      prerequisite:
        "Relevant Fidäl forms from Unit 1; the model stays visible.",
    }),
    build: Object.freeze({
      label: "Build",
      objective:
        "Construct the taught word from its two forms, from left to right.",
      instruction: "Follow the model. Choose each form in order.",
      prerequisite: "The picture-word model has been shown in this run.",
    }),
    read: Object.freeze({
      label: "Read",
      objective:
        "Connect a taught written word to its picture without the meaning model.",
      instruction: "Read the word. Choose its picture.",
      prerequisite:
        "The word and its picture have been shown and built with support.",
    }),
    recall: Object.freeze({
      label: "Recall",
      objective:
        "Try entering the taught word from its picture, rather than selecting a displayed word.",
      instruction:
        "Write the picture word. Use your keyboard or the Fidäl keys. Help is here.",
      prerequisite:
        "The written model and ordered forms have been demonstrated in this run.",
    }),
  });
  function plan(lesson, words, catalog) {
    const blocked = (reason) => ({ status: "blocked", reason, tasks: [] });
    if (!lesson?.available || lesson.unit !== 2 || lesson.kind !== "introduce")
      return blocked(
        "This routine supports existing visual word introductions only. Reviewed audio, pronunciation, strokes and sentence content are not supplied.",
      );
    if (
      !Array.isArray(words) ||
      !words.length ||
      words.length > 3 ||
      !Array.isArray(catalog) ||
      !Array.isArray(lesson.wordIds) ||
      !root.FidalText
    )
      return blocked(
        "The source words or text tools are unavailable. No practice or completion was created.",
      );
    const ids = new Set();
    for (const word of words) {
      const source = catalog.find((w) => w.id === word?.id);
      const letters = root.FidalText.graphemes(word?.word || "");
      if (
        !source ||
        ids.has(word.id) ||
        !lesson.wordIds.includes(word.id) ||
        source.word !== word.word ||
        source.concept !== word.concept ||
        source.art !== word.art ||
        !word.concept ||
        letters.length !== 2 ||
        !letters.every((ch) => /^\p{Script=Ethiopic}/u.test(ch)) ||
        JSON.stringify(letters) !== JSON.stringify(word.letters) ||
        JSON.stringify(source.letters) !== JSON.stringify(word.letters)
      )
        return blocked(
          "A word does not match the existing two-form Tigrinya source. Return to the path; no substitute was invented.",
        );
      ids.add(word.id);
    }
    const task = (kind, word, routine, model = false) => ({
      kind,
      word,
      routine,
      model,
    });
    const tasks = words.flatMap((word) => [
      task("look", word, "notice", true),
      task("build", word, "build", true),
    ]);
    tasks.push(...words.map((word) => task("read", word, "read")));
    tasks.push(...words.map((word) => task("type", word, "recall")));
    return {
      status: "ready",
      tasks,
      reviewStatus: "pending",
      evidence: "same-visit supported practice; not mastery or delayed recall",
    };
  }
  root.WordRoutine = Object.freeze({ stages, plan });
})(globalThis);
