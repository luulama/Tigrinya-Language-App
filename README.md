# Tigrinya Language App

This is the master folder for the complete children’s Tigrinya learning app.

## Project direction

- [Project brief](PROJECT_BRIEF.md) — The owner's vision, learning principles and task-specific output formats.
- [Project working rules](AGENTS.md) — Shared instructions for maintaining the app, protecting the native-review process and keeping the MVP simple.
- [Content review workflow](shared/content-review/CONTENT_REVIEW.md) — Review records and content release requirements.

The current implementation remains a local HTML/CSS/JavaScript prototype. Framework, database and cloud designs in the brief are conditional future tasks, not a requirement to add infrastructure now. AI-assisted checking does not replace approval by a qualified native Tigrinya reviewer.

## Units

- `unit-01-fidel-foundations/` — Alphabet families, tracing, sound-pattern lessons, and the B-family review pack.
- `unit-02-first-words/` — Latest two-letter picture-word prototype, letter fitting, pair game, full 142-headword review bank, editable source and automated checks.

## Shared

- `shared/assets/` — Reusable app artwork.
- `shared/content-review/` — Native Tigrinya review rules and records.

## Content rule

Every learner-facing Tigrinya word, transliteration, visual association, and audio recording must be approved by a qualified native Tigrinya reviewer before release.

## How we work

Each Unit has its own focused Codex chat, but every finished prototype and review file is copied into this master folder. This keeps the large app organised without mixing Unit work together.

This folder now contains the latest checked Unit 2 work, including its source files and review data. The dated task workspace is retained separately; continue app development in this master folder to avoid divergent copies.

## Run the prototypes

No package installation, API key, account or cloud service is required to view either prototype. Open `unit-01-fidel-foundations/index.html` or `unit-02-first-words/index.html` in a web browser, not just in the VS Code text editor.

For a local preview, open a terminal in this folder and run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit [Unit 1](http://127.0.0.1:8000/unit-01-fidel-foundations/) or [Unit 2](http://127.0.0.1:8000/unit-02-first-words/). These loopback URLs work only while the local server is running. GitHub source storage does not itself run or publish the app.

## Rebuild and check Unit 2

Python 3 is required for content checks and the build. Node.js is required only for the JavaScript checks. Run from this folder:

```sh
python3 unit-02-first-words/scripts/build_unit2.py
python3 unit-02-first-words/tests/check_unit2.py
node --check unit-02-first-words/src/unit2-child-app.js
node unit-02-first-words/tests/check_unit2_pairs.cjs
```

The build uses the tracked `src/` files and review-candidate JSON to generate the standalone `index.html`; an earlier generated HTML file is not required. Keep the source and built demo together in commits. Tests verify corpus completeness, review status, two-letter counting, embedded-source parity and 14 pair-game behaviors. They do not replace visual, accessibility, native-language or real-child testing.

## Content provenance and release status

Unit 2 dictionary-derived text is attributed to English Wiktionary contributors, via Kaikki.org / Wiktextract, under CC BY-SA 4.0. The [word bank](unit-02-first-words/unit-2-two-letter-words.md), [review data](unit-02-first-words/unit-2-content-review.json), and [dictionary fixture notes](unit-02-first-words/tests/fixtures/README.md) preserve source and attribution details. No repository-wide software license is assigned here.

These are development prototypes. No Tigrinya entry or image association in the Unit 2 bank is approved for learner release, and native pronunciation recordings are not available. Prefer a private source repository while review is pending; do not enable public lesson hosting as part of repository setup.
