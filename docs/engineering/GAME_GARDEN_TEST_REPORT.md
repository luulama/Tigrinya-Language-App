# Game Garden implementation and test record

Verified locally on 20 November 2026. Twenty playable visual-practice games are integrated into the existing two units, standalone home, Next.js learning cards and main Games navigation. No commit, pull request, push, publication or deployment was performed.

## What changed

- Added the Game Garden catalog and twenty activities using a shared offline runtime, with separate interaction rules for recognition, classification, sequencing, memory, spatial assembly, route planning, patterns, drawing, visual scanning, picture delivery, word construction, set selection, positional segmentation, editing, word search, overlap chains, text entry, intersection and self-reported recall.
- Each game introduces existing source material before play, displays its learning objective and instructions, offers model help and specific correction where objectively graded, and has completion, replay and return navigation. Drawing uses comparison instead of a made-up writing grade. Recall explicitly uses the learner's own report and a bounded revisit queue.
- Added loading/error/empty-content recovery. Sources are generated locally from the existing Fidäl review records and selected Unit 2 picture-word candidates. Existing source spellings, character arrays, English concepts and illustrations are reused; ambiguous same-picture alternatives are excluded from picture-choice sets. No translations, grammar, pronunciations, stroke directions, audio or native approvals were invented.
- Added mobile layouts, large controls, native buttons, keyboard input, a persistent feedback announcement region, reduced-motion behavior and Ethiopic text metadata. Ink Studio supports pointer drawing and connected-dot keyboard/tap exploration. It preserves the dot panel after interaction. Word Notebook supports actual text entry, onscreen Fidäl keys, NFC comparison and composition-aware checking.
- Puzzle locations and memory layouts vary on replay; word-search locations also vary between rounds. Progress describes activity steps, not language mastery. Games use memory only, with no account, microphone, tracking, game-history storage or external runtime service.
- Added a source-packaging step to the existing site/preview pipeline and a configurable `PLAYWRIGHT_BASE_URL` for testing a separately started local build.

The initial concept-to-objective mapping, gameplay loops, completion rules, assets and risks were documented before implementation in [GAME_GARDEN.md](GAME_GARDEN.md).

## Three separate passes for every game

Every cell below represents a completed automated case in **both** Desktop Chrome and Chromium phone emulation (iPhone 13 viewport). These are separate functional, edge-case and integration tests, not three repetitions of one test.

| Unit | Game | Functional | Edge cases | Integration |
| --- | --- | --- | --- | --- |
| 1 | Shape Lantern | Passed, both | Passed, both | Passed, both |
| 1 | Family Baskets | Passed, both | Passed, both | Passed, both |
| 1 | Order Bridge | Passed, both | Passed, both | Passed, both |
| 1 | Twin Tiles | Passed, both | Passed, both | Passed, both |
| 1 | Shape Mosaic | Passed, both | Passed, both | Passed, both |
| 1 | Stepping Stones | Passed, both | Passed, both | Passed, both |
| 1 | Pattern Loom | Passed, both | Passed, both | Passed, both |
| 1 | Ink Studio | Passed, both | Passed, both | Passed, both |
| 1 | Family Detective | Passed, both | Passed, both | Passed, both |
| 1 | Word Spotlight | Passed, both | Passed, both | Passed, both |
| 2 | Picture Post | Passed, both | Passed, both | Passed, both |
| 2 | Word Forge | Passed, both | Passed, both | Passed, both |
| 2 | Picture Market | Passed, both | Passed, both | Passed, both |
| 2 | Letter Lenses | Passed, both | Passed, both | Passed, both |
| 2 | Word Repair | Passed, both | Passed, both | Passed, both |
| 2 | Word Windows | Passed, both | Passed, both | Passed, both |
| 2 | Word Dominoes | Passed, both | Passed, both | Passed, both |
| 2 | Word Notebook | Passed, both | Passed, both | Passed, both |
| 2 | Shared Shape | Passed, both | Passed, both | Passed, both |
| 2 | Picture Recall | Passed, both | Passed, both | Passed, both |

Functional cases open the introduction/model, start, interact through the complete activity, assert completion, replay and start the replay. Graded activities receive correct-answer feedback; drawing receives model-comparison feedback, and recall receives explicit self-check feedback. Pointer drawing is exercised on both projects; this does not represent a physical touchscreen/stylus test.

Edge cases exercise incorrect/repeated answers where objectively graded, matching-card mismatches and repeated selections, missing source datasets for each game, recovery after restoring source data, and a fresh successful playthrough. Ink Studio additionally checks empty drawing, clearing, connected-dot input, panel persistence and Space-key activation. Word Notebook checks incorrect text and blocked checking during an active composition. Recall checks reveal-before-self-report and supported revisits through completion. No fake audio failure or speech score is tested: no audio/speech mechanic is offered without the missing reviewed recordings.

Integration cases launch each game from its actual unit, verify the ten-game collection, enter by keyboard, check horizontal layout bounds and 44px minimum activity controls at both sizes, verify visible left-to-right Ethiopic content, open model help, return to the collection and navigate back to the correct unit. Shared cases additionally cover the Next.js Games navigation, a failed content script and an unknown game ID.

The browser total is **134 passed**: 120 individual game-pass cases, four shared game navigation/load-error cases, and ten preserved learner/Copilot-regression cases. All passed in the final complete run after the drawing and accessibility refinements.

## Commands and results

Commands ran from the master repository. The local tool wrapper selects the project's installed Node/.NET tools.

| Command | Result |
| --- | --- |
| `bash scripts/tool.sh npm test` | 16 frontend/shared tests passed in six files |
| `bash scripts/tool.sh npm run typecheck` | Passed |
| `bash scripts/tool.sh npm run build` | Production Next.js build passed, including `/games` |
| `bash scripts/tool.sh dotnet test apps/api/Polyglot.Tests/Polyglot.Tests.csproj` | 18 tests passed with SQLite |
| `bash scripts/tool.sh npm run test:postgres` | 18 tests passed with PostgreSQL 16; migrations and draft import passed in an isolated temporary test database |
| `bash scripts/tool.sh python3 scripts/check_all.py` | All original checks and new game contracts passed, including the four-page structural/privacy checks |
| `bash scripts/tool.sh node tests/check_game_garden.cjs` | All twenty contracts, 35 configurations per game (700 configurations), source integrity, valid chains/routes and empty-content guards passed |
| `python3 scripts/prepare_web_preview.py` | Offline preview packaged successfully; 30 runtime/review files with resolving HTML links/assets |
| `PORT=3003 bash scripts/tool.sh npm run start --workspace @polyglot/web` | Corrected production app started locally |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3003 PLAYWRIGHT_CHANNEL=chrome bash scripts/tool.sh npm run test:e2e` | 134 passed in the final full run |
| `bash scripts/tool.sh npm exec prettier -- --check shared/game-garden-core.js shared/game-garden.js shared/game-garden.css tests/check_game_garden.cjs tests/e2e/game-garden.spec.ts apps/web/app/games/page.tsx playwright.config.ts` | Passed |
| `git diff --check` | Passed |

JavaScript syntax checks are included in `check_all.py`. There is no configured lint script; formatting and syntax checks are reported as such, not as an ESLint run. The first browser run exposed drawing navigation/viewport issues and an over-specific case-sensitive test expectation. These were corrected, affected tests rerun, and the final complete suite passed. Visual screenshot spot checks covered the catalog, mobile mosaic, mobile picture delivery and desktop drawing views; they are supplementary to the per-game layout assertions.

## Preservation and remaining limitations

Comparison with the pre-task file hashes found only intended edits to existing unit navigation, the generated Unit 2 HTML, Next.js navigation/learning links, packaging/check scripts and TypeScript build cache. The original unit activity code, dictionary bank, review records and shared language content were preserved. New game runtime, generated game package, tests and documentation were added. No existing learner records were deleted or migrated.

The games remain **pending-review visual practice**. The source family games use the existing complete seven-form basic rows; the original 293-form exploration remains available in Unit 1. The picture games use existing suitable two-character picture candidates, not the entire adult review bank. Qualified native review, licensed native recordings/spoken instructions and reliable handwriting data remain necessary before a complete independent Tigrinya course or verified pronunciation/stroke-order instruction can be released.

Physical phone/stylus input, real mobile IMEs, VoiceOver/other screen readers, Safari/Firefox, observed child/adult usability, learning effectiveness and actual completion times were not verified. Synthetic composition events, keyboard checks and phone emulation do not replace those checks. No new authentication/cloud integration was added or claimed as tested by the games.

Local app: **http://127.0.0.1:3003/games**. Select a unit, choose a game, look at its model, then play. Games can also be opened from either existing unit. No hosted website was changed.
