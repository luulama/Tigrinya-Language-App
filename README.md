# Tigrinya Language App

This is the master folder for the complete children’s Tigrinya learning app.

## Polyglot Core

The new implementation uses Next.js/React/TypeScript, ASP.NET Core/.NET 10 LTS, EF Core/PostgreSQL, Entra authentication adapters and versioned content workflows. The [engineering guide](docs/engineering/README.md) covers all ten foundation phases, development, testing and Azure deployment configuration.

```sh
bash scripts/tool.sh npm ci --ignore-scripts
python3 scripts/prepare_web_preview.py
bash scripts/tool.sh npm run dev
```

Open http://127.0.0.1:3000. The existing Fidäl and word previews work without an account. Published course data requires the API/database; sign-in requires real Entra configuration. AI is interfaces only, and dictionary imports remain unapproved drafts. No Azure resources or hosted-site changes are created by these commands.

## Project direction

The [complete Product Bible V2.0](Product-Bible/Product-Bible-V2.0.md), [Curriculum Bible](Curriculum-Bible.md), [Technical Bible](Technical-Bible.md), and [Design Bible](Design-Bible.md) are prepared as a review-ready blueprint package. Only the company vision is currently approved; see the [approval register and workflow](Product-Bible/README.md). Further app implementation remains gated on explicit adoption or an owner-approved workflow change.

- [Official company vision — FINAL_V1](Product-Bible/01-Vision.md) — Approved, locked strategic baseline; changes require an owner-approved successor version.
- [Project brief](PROJECT_BRIEF.md) — The owner's vision, learning principles and task-specific output formats.
- [Project working rules](AGENTS.md) — Shared instructions for maintaining the app, protecting the native-review process and keeping the MVP simple.
- [Content review workflow](shared/content-review/CONTENT_REVIEW.md) — Review records and content release requirements.

The original standalone HTML/CSS/JavaScript preview remains intact. The explicitly requested Polyglot Core monorepo now lives alongside it under apps/ and packages/. AI-assisted checking does not replace approval by a qualified native Tigrinya reviewer.

## Units

- `unit-01-fidel-foundations/` — 35 basic Tigrinya Fidäl families, six labialized families and an additional-form group (293 forms), source-word contexts, freehand writing/text practice, guided matching and checks. Teacher strokes and sound lessons await reviewed assets.
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

No package installation, API key, account or cloud service is required. Open the root `index.html` in a browser to choose Fidäl families or First words. Both units link back to All lessons. Unit 2 remains a standalone generated page; Unit 1 also needs its local shared scripts, stylesheets and image.

For a local preview, open a terminal in this folder and run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit [All lessons](http://127.0.0.1:8000/), [Unit 1](http://127.0.0.1:8000/unit-01-fidel-foundations/) or [Unit 2](http://127.0.0.1:8000/unit-02-first-words/). These loopback URLs work only while the local server is running. GitHub source storage does not itself run or publish the app.

## Rebuild and check the app

Python 3 is required for content checks and the build. Node.js is required only for the JavaScript checks. Run from this folder:

```sh
python3 scripts/check_all.py
```

This runs the builds, content/HTML/contrast checks, JavaScript syntax checks and all 88 behavior checks. If Node is outside your PATH, pass `--node /absolute/path/to/node`. Individual commands are:

```sh
python3 scripts/build_fidal.py
python3 unit-02-first-words/scripts/build_unit2.py
python3 unit-02-first-words/tests/check_unit2.py
python3 tests/check_project.py
node unit-01-fidel-foundations/check_unit1.cjs
node --check unit-02-first-words/src/unit2-child-app.js
node unit-02-first-words/tests/check_unit2_pairs.cjs
node unit-02-first-words/tests/check_unit2_literacy.cjs
node unit-02-first-words/tests/check_unit2_practice.cjs
node tests/check_learning_path.cjs
node tests/check_journey.cjs
node tests/check_fidal.cjs
```

The builds generate offline Fidäl review data and Unit 2's standalone HTML from source files. Keep source and generated files together. Checks cover corpus/review integrity, two-character counting, source parity, links/assets, contrast, 14 pair-game behaviors, 12 literacy behaviors, 10 practice/review behaviors, 16 Unit 1 behaviors, 14 complete-journey behaviors and 22 writing/Unicode/source-gate behaviors, plus 11 device-saving/scheduling/integration behaviors. JavaScript tests use a small DOM stub; they do not replace real browser, keyboard, screen-reader, native-language or child testing.

Both units use a reusable purpose → teaching → practice → recap → check → outcome structure. Metadata, panel rendering and the check state live in `shared/unit-journey.js`; shared responsive styles are in `shared/unit-journey.css`. Unit 1 loads them locally; Unit 2 embeds them during its standalone build. A supported item returns once later without its model; results still describe the original encounter as practised with help. There is no pass mark, lockout or mastery claim.

Unit 2 follows Look → Make it → Find it → picture pairs → recap → picture-word check. The child sees the draft word and existing English concept, assembles its shapes with a model, then chooses the printed word for its picture. The first recognition is guided; later alternatives use introduced words. The cumulative check revisits taught words after pair play and recap, without a model unless help is needed. The [first-lesson review brief](unit-02-first-words/lesson-01-review-brief.md) records the three starting candidates for qualified native review.

Completed word activities count as **practised**, independently of the optional Keep pictures collection. Next words mixes familiar and new candidates; Review rotates through previously practised candidates. Continue resumes the current activity. Progress stays in memory by default. My practice & settings offers explicit device-only saving of completed checks and preferences, stop-saving and clear-history controls. Saved history schedules visual re-practice after 1/3/7/14/30/60 days, shortening after help; same-day repetition cannot advance an interval. A three-minute preference uses one word and still advances to fresh material. Due items take priority. Drawings, collections and unfinished sessions remain in memory. No proficiency or retention score is assigned.

Unit 1 has 42 complete activities: 35 basic seven-order families, six labialized five-order families, and 18 additional forms in one group. Look → Find the same shape uses up to three introduced alternatives, followed by a seven-shape recap, a demonstrated difference-spotting task and a cumulative shape check. Every form must be practised and checked before a family counts as checked. The B-family review opens after its check. Unprepared families have no selectable placeholder screens. Missing audio is status text, not a dead button. Missing picture words are not filled with invented content.

See [Fidäl writing and verified-data requirements](FIDAL_WRITING.md), [Learning flow and validation](LEARNING_FLOW.md) and [Research notes](RESEARCH_NOTES.md). Unit 1 now offers an actual drawing surface, learner replay, native/onscreen Fidäl input and word highlighting; these do not grade handwriting or invent stroke order. The roughly 3–5 minute activity estimates remain unvalidated planning estimates.

The [demo requirements audit](DEMO_REQUIREMENTS.md) records the full implemented scope and the exact content gaps. The [20 November debugging report](QA_REPORT.md) records browser-reproduced startup fixes, updated regression checks, Git configuration and the remaining verification limits. The expanded catalogue and startup fixes are now included in the private hosted preview; [publication details](PUBLISHING.md) identify the deployed revision.

## Content provenance and release status

Unit 2 dictionary-derived text is attributed to English Wiktionary contributors, via Kaikki.org / Wiktextract, under CC BY-SA 4.0. The [word bank](unit-02-first-words/unit-2-two-letter-words.md), [review data](unit-02-first-words/unit-2-content-review.json), and [dictionary fixture notes](unit-02-first-words/tests/fixtures/README.md) preserve source and attribution details. No repository-wide software license is assigned here.

These are development prototypes. No Tigrinya entry or image association in the Unit 2 bank is approved for learner release, and native pronunciation recordings are not available. Prefer a private source repository while review is pending; do not enable public lesson hosting as part of repository setup.

## Learning-path update

The 20 November platform design is applied as a focused MVP foundation: a recommended next action, separate shape/word evidence, optional local saving and cross-day scheduling, short-session selection, and child/teen/adult presentation preferences. These preferences are not placement levels or separate curricula. No external AI, account, API, audio or unreviewed curriculum was added. The full C1–C2-oriented curriculum remains dependent on reviewed teaching material. This local update has not been deployed; the existing hosted preview remains on its previous revision.

## Complete platform build specification

The [17-phase platform specification](docs/product/README.md) defines the target curriculum, product rules, every major screen, learner modes, content operations, AI gates and database architecture. It includes a machine-readable curriculum of 224 blocked authoring assignments, 32 JSON contract definitions, an executable 43-table relational contract and a tested cold-review scheduler reference. These are implementation contracts, not newly authored or approved Tigrinya lessons. The reference scheduler is separate from the current runtime and requires the documented evidence migration before adoption. No backend, account, AI service or publication is activated.

The standard `scripts/check_all.py` command also validates these contracts and runs the 14 reference-scheduler checks.
