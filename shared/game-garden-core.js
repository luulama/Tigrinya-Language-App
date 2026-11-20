/* Local visual-practice rules. Source records remain pending native review. */
(function (root) {
  "use strict";
  const catalog = [
    [
      1,
      "lantern",
      "Shape Lantern",
      "Find the same Fidäl form.",
      "Compare the model. Tap its twin.",
      "recognition",
      "◉",
    ],
    [
      1,
      "baskets",
      "Family Baskets",
      "See which forms belong together.",
      "Look at the form. Choose its family basket.",
      "sorting",
      "⌑",
    ],
    [
      1,
      "bridge",
      "Order Bridge",
      "Explore one seven-form family.",
      "Fill the bridge from left to right.",
      "sequencing",
      "▰",
    ],
    [
      1,
      "twins",
      "Twin Tiles",
      "Remember where matching forms are.",
      "Turn two cards. Keep identical pairs.",
      "memory",
      "▦",
    ],
    [
      1,
      "mosaic",
      "Shape Mosaic",
      "Look closely at a printed form.",
      "Choose a piece for the highlighted space.",
      "spatial assembly",
      "◩",
    ],
    [
      1,
      "stones",
      "Stepping Stones",
      "Follow a sequence of forms.",
      "Start at the flag. Move to a touching stone.",
      "route planning",
      "⚑",
    ],
    [
      1,
      "loom",
      "Pattern Loom",
      "Notice a repeating shape pattern.",
      "Look at the pattern. Add the next form.",
      "pattern inference",
      "≋",
    ],
    [
      1,
      "ink",
      "Ink Studio",
      "Explore writing with a printed model.",
      "Draw, then compare. There is no writing score.",
      "drawing and reflection",
      "✎",
    ],
    [
      1,
      "detective",
      "Family Detective",
      "Notice a different character family.",
      "Find the form that belongs to the other family.",
      "classification by exclusion",
      "◇",
    ],
    [
      1,
      "spotlight",
      "Word Spotlight",
      "Find a form inside a real source word.",
      "Tap the highlighted model inside the word.",
      "visual scanning",
      "◎",
    ],
    [
      2,
      "post",
      "Picture Post",
      "Connect written words with pictures.",
      "Choose a word label. Deliver it to its picture.",
      "one-to-one mapping",
      "✉",
    ],
    [
      2,
      "forge",
      "Word Forge",
      "Build two-character words left to right.",
      "Use the model. Fit each form into the word.",
      "construction",
      "▱",
    ],
    [
      2,
      "market",
      "Picture Market",
      "Read a small set of picture labels.",
      "Choose the words on your picture list. Check the basket.",
      "set selection",
      "♧",
    ],
    [
      2,
      "lenses",
      "Letter Lenses",
      "Notice the first and last forms.",
      "Look at the position. Tap that form in the word.",
      "position and segmentation",
      "◌",
    ],
    [
      2,
      "repair",
      "Word Repair",
      "Notice and correct a changed form.",
      "Compare the model. Replace the marked puzzle piece.",
      "editing",
      "⚒",
    ],
    [
      2,
      "windows",
      "Word Windows",
      "Find two-character words in a grid.",
      "Tap two touching tiles, from first form to last.",
      "word search",
      "▥",
    ],
    [
      2,
      "domino",
      "Word Dominoes",
      "Notice identical forms across words.",
      "Connect words where the touching forms are identical.",
      "overlap chain",
      "▣",
    ],
    [
      2,
      "notebook",
      "Word Notebook",
      "Enter actual Fidäl text.",
      "Copy the model. Type or use the Fidäl keys.",
      "text input",
      "▤",
    ],
    [
      2,
      "shared",
      "Shared Shape",
      "Compare forms in different words.",
      "Tap the same form once in each word.",
      "intersection",
      "⋈",
    ],
    [
      2,
      "recall",
      "Picture Recall",
      "Revisit a word with honest self-checking.",
      "Try to remember. Reveal, then choose what to practise.",
      "retrieval and self-report",
      "☀",
    ],
  ].map(([unit, id, name, objective, instruction, mechanic, icon]) => ({
    unit,
    id,
    name,
    objective,
    instruction,
    mechanic,
    icon,
  }));
  const normalize = (value) => String(value).normalize("NFC").trim();
  const rotate = (items, n) =>
    items.slice(n % items.length).concat(items.slice(0, n % items.length));
  function content(fidal, wordData) {
    const families = (fidal?.families || []).filter(
      (f) =>
        f.kind === "basic" &&
        f.forms?.length === 7 &&
        f.forms.every(
          (x, i) => typeof x.character === "string" && x.order === i + 1,
        ),
    );
    const seen = new Set();
    const words = (wordData?.words || []).filter((w) => {
      if (
        !w ||
        typeof w.id !== "string" ||
        seen.has(w.word) ||
        !Array.isArray(w.letters) ||
        w.letters.length !== 2 ||
        w.letters.join("") !== w.word ||
        !w.concept ||
        !/^[a-z-]+$/.test(w.art)
      )
        return false;
      seen.add(w.word);
      return true;
    });
    return { families, words };
  }
  function build(id, data, variation = 0) {
    const game = catalog.find((g) => g.id === id);
    if (!game)
      throw new Error(
        "This game could not be found. Choose another garden game.",
      );
    if (game.unit === 1 && data.families.length < 2)
      throw new Error(
        "This game needs two complete source families. Return to the unit or retry.",
      );
    if (game.unit === 2 && data.words.length < 4)
      throw new Error(
        "This game needs four source picture words. Return to the unit or retry.",
      );
    const families = rotate(data.families, variation);
    const forms = families[0]?.forms.map((f) => f.character) || [];
    const other = families[1]?.forms.map((f) => f.character) || [];
    const preferred = ["ቤት", "ማይ", "ድሙ"];
    const unique = data.words.filter(
      (w, i, all) => all.findIndex((x) => x.art === w.art) === i,
    );
    if (game.unit === 2 && unique.length < 4)
      throw new Error(
        "This game needs four distinct source pictures. Return to the unit or retry.",
      );
    const sorted = [
      ...preferred.map((s) => unique.find((w) => w.word === s)).filter(Boolean),
      ...unique.filter((w) => !preferred.includes(w.word)),
    ];
    const words = rotate(sorted, variation).slice(0, 4);
    const p = {
      game,
      forms,
      other,
      family: families[0]?.family,
      otherFamily: families[1]?.family,
      words,
      rounds: [],
      teaching: [],
    };
    if (game.unit === 1)
      p.teaching = forms.map((text, i) => ({ text, caption: `Form ${i + 1}` }));
    else p.teaching = words.map((w) => ({ text: w.word, word: w }));
    switch (id) {
      case "lantern":
        p.rounds = forms.slice(0, 3).map((target, i) => ({
          target,
          choices: rotate([target, other[i], forms[i + 3]], i + 1),
        }));
        break;
      case "baskets":
        p.rounds = [forms[0], other[2], forms[4], other[5]].map((target) => ({
          target,
          answer: forms.includes(target) ? p.family : p.otherFamily,
        }));
        p.teaching = [families[0], families[1]].map((f) => ({
          text: f.forms.map((x) => x.character).join(" "),
          caption: `${f.family} family`,
        }));
        break;
      case "bridge":
        p.rounds = forms.map((target) => ({ target }));
        break;
      case "twins":
        p.cards = rotate(
          [forms[0], forms[1], forms[2], forms[1], forms[0], forms[2]],
          variation,
        );
        break;
      case "mosaic":
        p.target = forms[0];
        break;
      case "stones":
        p.path = [
          [0, 1, 4, 5],
          [2, 1, 4, 7],
          [6, 3, 4, 5],
          [8, 7, 4, 1],
        ][variation % 4];
        p.route = forms.slice(0, 4);
        p.grid = Array.from({ length: 9 }, (_, i) => other[i % other.length]);
        p.path.forEach((cell, i) => {
          p.grid[cell] = p.route[i];
        });
        break;
      case "loom":
        p.pattern = [forms[0], forms[1], forms[0], forms[1]];
        p.rounds = [forms[0], forms[1], forms[0]].map((target) => ({ target }));
        break;
      case "ink":
        p.rounds = forms.slice(0, 2).map((target) => ({ target }));
        break;
      case "detective":
        p.rounds = [0, 1, 2].map((i) => ({
          choices: rotate([forms[i], forms[i + 3], other[i]], i),
          target: other[i],
        }));
        p.teaching = [families[0], families[1]].map((f) => ({
          text: f.forms.map((x) => x.character).join(" "),
          caption: `${f.family} family`,
        }));
        break;
      case "spotlight": {
        const contexts = families.flatMap((f) =>
          f.forms.flatMap((form) =>
            (form.contexts || [])
              .filter((c) => c.word.includes(form.character))
              .map((c) => ({
                target: form.character,
                word: c.word,
                meaning: c.meaning,
              })),
          ),
        );
        if (contexts.length < 3)
          throw new Error(
            "Three existing word contexts are needed. No examples have been invented.",
          );
        p.rounds = contexts.slice(0, 3);
        p.teaching = p.rounds.map((r) => ({
          text: r.word,
          caption: r.meaning,
        }));
        break;
      }
      case "post":
        p.words = words.slice(0, 3);
        break;
      case "forge":
      case "repair":
      case "notebook":
      case "windows":
        p.rounds = words.slice(0, 3).map((word, i) => ({
          word,
          target: word.word,
          letters: word.letters,
          choices: rotate([...new Set(words.flatMap((w) => w.letters))], i + 1),
          positions: [
            [3, 4],
            [0, 1],
            [7, 8],
            [1, 2],
            [4, 5],
            [6, 7],
          ][(i + variation) % 6],
        }));
        if (
          id === "windows" &&
          p.rounds.some((r) => !r.choices.some((f) => !r.letters.includes(f)))
        )
          throw new Error(
            "The word grid needs another source form for its puzzle tiles. Choose another game.",
          );
        break;
      case "market":
        p.rounds = [
          { list: [words[0], words[2]] },
          { list: [words[1], words[3]] },
        ];
        break;
      case "lenses":
        p.rounds = [0, 1, 2, 3].map((i) => ({
          word: words[i % 3],
          position: i % 2,
        }));
        break;
      case "domino": {
        let chain;
        for (const a of unique)
          for (const b of unique)
            for (const c of unique) {
              if (
                !chain &&
                a.id !== b.id &&
                b.id !== c.id &&
                a.id !== c.id &&
                a.letters[1] === b.letters[0] &&
                b.letters[1] === c.letters[0]
              )
                chain = [a, b, c];
            }
        if (!chain)
          throw new Error(
            "No three-word chain exists in the available source words. Choose another game.",
          );
        p.chain = chain;
        p.words = chain;
        p.teaching = chain.map((w) => ({ text: w.word, word: w }));
        break;
      }
      case "shared": {
        const pairs = [];
        for (let a = 0; a < unique.length; a++)
          for (let b = a + 1; b < unique.length; b++) {
            const common = unique[a].letters.filter((x) =>
              unique[b].letters.includes(x),
            );
            if (new Set(common).size === 1)
              pairs.push({
                left: unique[a],
                right: unique[b],
                target: common[0],
              });
          }
        if (pairs.length < 3)
          throw new Error(
            "Three source-word pairs with a shared form are needed. Choose another game.",
          );
        p.rounds = rotate(pairs, variation).slice(0, 3);
        p.words = [
          ...new Map(
            p.rounds.flatMap((r) => [r.left, r.right]).map((w) => [w.id, w]),
          ).values(),
        ];
        p.teaching = p.words.map((w) => ({ text: w.word, word: w }));
        break;
      }
      case "recall":
        p.words = words.slice(0, 3);
        break;
    }
    return p;
  }
  root.GameGarden = { catalog, content, build, normalize };
})(globalThis);
