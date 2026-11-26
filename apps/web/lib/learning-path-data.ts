export interface PathMilestone {
  id: string;
  kicker: string;
  title: string;
  description: string;
  orb: string;
  glyphs?: string[];
  href?: string;
  ctaLabel: string;
  available: boolean;
  kind: "first-lesson" | "fidal" | "words" | "read-write" | "review" | "locked";
}

export interface PathUnit {
  id: string;
  unitNumber: number;
  title: string;
  goal: string;
  tone: "sage" | "warm" | "explore" | "locked";
  badge: string;
  milestones: PathMilestone[];
}

/**
 * Structured learning path view-model reflecting the actual verified curriculum
 * milestones in Unit 1 (Fidäl foundations) and Unit 2–5 (path-curriculum.json).
 * No unapproved Tigrinya words or recordings are invented.
 */
export const LEARNING_PATH_UNITS: PathUnit[] = [
  {
    id: "unit-1",
    unitNumber: 1,
    title: "Unit 1 · Fidäl foundations",
    goal: "Meet the seven-order Ethiopic script, trace printed shapes, and spot visual differences at your pace.",
    tone: "sage",
    badge: "293 forms · Preview ready",
    milestones: [
      {
        id: "u1-first",
        kicker: "Step 1 · 1-minute warm start",
        title: "Meet your first Fidäl form",
        description:
          "Look closely at በ, try its shape by drawing or typing, and find it again with Mele nearby.",
        orb: "በ",
        glyphs: ["በ", "ቡ", "ቢ"],
        href: "/first-lesson",
        ctaLabel: "Try one form first",
        available: true,
        kind: "first-lesson",
      },
      {
        id: "u1-families",
        kicker: "Step 2 · 35 basic & 6 labialized families",
        title: "Explore Fidäl families",
        description:
          "Move through 42 guided activities across 293 source-defined forms with freehand writing and recaps.",
        orb: "ባ",
        glyphs: ["በ", "ቡ", "ቢ", "ባ", "ቤ", "ቦ"],
        href: "/preview/unit-01-fidel-foundations/index.html",
        ctaLabel: "Begin Fidäl preview →",
        available: true,
        kind: "fidal",
      },
      {
        id: "u1-games",
        kicker: "Step 3 · Playful reinforcement",
        title: "Fidäl Game Garden",
        description:
          "Ten calm games with families, twin shapes, mosaics, ink practice, and pattern spotting.",
        orb: "መ",
        glyphs: ["መ", "ፈ", "ተ"],
        href: "/preview/games/index.html?unit=1",
        ctaLabel: "10 Fidäl games →",
        available: true,
        kind: "review",
      },
    ],
  },
  {
    id: "unit-2",
    unitNumber: 2,
    title: "Unit 2 · First words",
    goal: "Move from familiar Fidäl forms to picture-linked two-character words across four everyday themes.",
    tone: "warm",
    badge: "21 guided lessons · Preview ready",
    milestones: [
      {
        id: "u2-familiar",
        kicker: "Chapter 1 · Three familiar pictures",
        title: "House, water, and cat",
        description:
          "Meet your first picture-word pairs, build them with a model, and check them at your own rhythm.",
        orb: "ቤት",
        glyphs: ["ቤት", "ማይ", "ድሙ"],
        href: "/preview/unit-02-first-words/path.html",
        ctaLabel: "Follow the word path →",
        available: true,
        kind: "words",
      },
      {
        id: "u2-everyday",
        kicker: "Chapters 2–4 · Table, Home, Outside & People",
        title: "Everyday two-character words",
        description:
          "Continue through At the table, Around home, Outside, and People & me with built-in review checkpoints.",
        orb: "ልቢ",
        glyphs: ["ላም", "ልቢ", "ሑጻ"],
        href: "/preview/unit-02-first-words/path.html",
        ctaLabel: "Open full word path →",
        available: true,
        kind: "words",
      },
      {
        id: "u2-games",
        kicker: "Review & play",
        title: "Word Game Garden",
        description:
          "Ten gentle games for building, matching, and revisiting two-character words without timers.",
        orb: "ማይ",
        href: "/preview/games/index.html?unit=2",
        ctaLabel: "10 word games →",
        available: true,
        kind: "review",
      },
    ],
  },
  {
    id: "unit-3",
    unitNumber: 3,
    title: "Unit 3 · Read & write",
    goal: "Revisit taught words through character positions, family relationships, reading, and Ethiopic text input.",
    tone: "explore",
    badge: "6 lessons · Preview ready",
    milestones: [
      {
        id: "u3-read-write",
        kicker: "Positions, families & recall",
        title: "From pictures to independent reading",
        description:
          "Spot first and last characters, connect families to real words, and type familiar words from memory.",
        orb: "ጽ",
        href: "/preview/unit-02-first-words/path.html",
        ctaLabel: "Explore Unit 3 on path →",
        available: true,
        kind: "read-write",
      },
    ],
  },
  {
    id: "unit-4-5",
    unitNumber: 4,
    title: "Units 4–5 · Listen, speak & first meanings",
    goal: "Connect reviewed native recordings with familiar meanings and short everyday exchanges.",
    tone: "locked",
    badge: "Awaiting native review & audio",
    milestones: [
      {
        id: "u4-listen",
        kicker: "Unit 4 · Native audio required",
        title: "Listen & respond",
        description:
          "Unlocks once qualified Tigrinya speakers approve natural and slow recordings for familiar words.",
        orb: "♪",
        ctaLabel: "Pending review",
        available: false,
        kind: "locked",
      },
      {
        id: "u5-meanings",
        kicker: "Unit 5 · Native authorship required",
        title: "First connected meanings",
        description:
          "Short useful messages and replies authored and reviewed by fluent Tigrinya speakers.",
        orb: "✎",
        ctaLabel: "Pending review",
        available: false,
        kind: "locked",
      },
    ],
  },
];
