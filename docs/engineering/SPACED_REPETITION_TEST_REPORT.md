# Spaced repetition verification

Verified locally on **21 November 2026**. No commit, staged change, pull request, push or deployment was created. Existing unrelated working changes were retained. HEAD remained `e17e045`.

## Implementation under test

The Unit 2-onward visual word path now schedules older, already taught items inside later lessons. It uses elapsed time and completed lesson positions, with at most two mixed items and one separated supported revisit. Source words, lesson prerequisites, Unit 1 and shared runtime/content files are preserved. The [policy and storage description](SPACED_REPETITION.md) identifies the exact intervals, evidence limits and content gates.

The app ran locally at:

`http://127.0.0.1:3005/preview/unit-02-first-words/path.html`

This was a local production Next.js server with the generated standalone preview assets, not an external publication.

## Commands and observed results

Commands ran from the repository root through its existing tool wrapper.

| Command | Observed result |
| --- | --- |
| `bash scripts/tool.sh python3 scripts/check_all.py` | Passed generated builds, source/content/HTML checks, JavaScript syntax checks and behavior regressions. Includes 13 new SRS groups and 10 existing word-path groups. |
| `bash scripts/tool.sh npm test` | Passed: 16 tests in six files. |
| `bash scripts/tool.sh npm run typecheck` | Passed. |
| `bash scripts/tool.sh npm run build` | Passed production build. |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3005 PLAYWRIGHT_CHANNEL=chrome bash scripts/tool.sh npm run test:e2e -- --workers=4` | Passed: **164 browser cases**, across desktop and phone-emulated projects. |
| `bash scripts/tool.sh dotnet test apps/api/Polyglot.Tests/Polyglot.Tests.csproj` | Passed: 18 tests, zero failures/skips. No backend code or schema was changed. |
| `bash scripts/tool.sh npm exec -- prettier --check unit-02-first-words/src/path-app.js unit-02-first-words/src/path-core.js unit-02-first-words/src/path-srs.js tests/check_path_srs.cjs tests/check_word_path.cjs tests/e2e/path-srs.spec.ts tests/e2e/word-path.spec.ts` | Passed all matched files. |
| `git diff --check` | Passed: no whitespace errors. |
| `git diff --name-only -- unit-01-fidel-foundations shared` | Empty: no tracked Unit 1/shared changes. The source suite also verified all 20 preservation-fixture hashes. |
| `git diff --cached --stat` | Empty: no staged changes. |

There is no configured lint script. The existing syntax/source checks, TypeScript check and targeted formatting check were run instead. No PostgreSQL integration suite was run for this frontend-only change.

Local run logs are under `/private/tmp/`: `srs-checks-verified.log`, `srs-vitest.log`, `srs-types.log`, `srs-build.log`, `srs-browser-verified.log` and `srs-api.log`. These are temporary machine-local evidence, not repository artifacts required to run the app.

## Requirement coverage

| Requirement | Evidence actually exercised |
| --- | --- |
| Newly introduced material gets a future review point | Pure scheduler checks assert one-day and two-lesson initial points. |
| Separate-session recall increases spacing | Controlled timestamps and distinct sessions assert 3/7/14/30/60-day progression. Same-day/model-supported answers cannot manufacture delayed evidence. |
| Mistakes and hints make items return sooner | Error/hint checks reset expansion and retain weak-item history. Browser lessons exercise specific feedback and a different supported task after at least two intervening activities. |
| Old material returns mixed with new after a meaningful gap | Browser scenarios play the first eight actual lessons, inspect hidden old-word models and retrieve older words within later lessons. Scheduler checks exercise later path positions and long calendar gaps. |
| Repetition remains bounded | Tests assert no consecutive-lesson repetition of the same word, distinct variants, no more than two mixed items, and no more than one supported corrective revisit. Long-backlog tests keep the next lesson usable and allow defer without success credit. |
| Existing persistence works across reopening | Opt-in browser round trips compare detailed item records and preserve the original Unit 1 key. Unit checks cover earlier-version migration, bounded history, invalid records, session reloads, duplicate events and clock rollback. Existing tests exercise disabled/unavailable storage and write failure. |
| Unit 1 and the existing path still work | All 20 Unit 1/shared baseline hashes match. Existing browser regressions cover Unit 1 navigation and activities, all 27 available path lessons completing/unlocking/replaying on both sizes, and the existing 20 games. |
| Script/input/layout remain correct | Source checks verify existing Ethiopic data and LTR metadata. Browser regressions exercise Ethiopic text entry, composition, onscreen keys, grapheme deletion, writing fallback and reduced motion. Tigrinya is LTR; RTL was not added. |

Additional cases cover a missing scheduler file with a clear recovery state and preserved saved bytes, response-skill isolation, cross-skill and shared-character model exposure, and the absence of invented audio/phonetic skills.

The ten added browser cases are five SRS scenarios run in both layouts. The total 164 includes previous app/game/path regressions; it does not mean 164 distinct SRS algorithms were tested.

## Defects found and resolved

The first mixed-practice browser checks exposed a larger-choice-pool bug: shuffling and then truncating could omit the correct target. Choice construction now always retains the target exactly once, samples distinct alternatives and then shuffles. Every recognition/reading prompt visited by the new browser helper checks this invariant.

An existing partial-review regression assumed review always used word buttons. The scheduler now also uses picture responses. That test was updated to resolve the actual direction and update rich SRS fixtures alongside the legacy projection, while keeping its spacing and no-double-counting assertions. Both layouts passed the targeted rerun, followed by the complete 164-case suite.

## Visual inspection

An isolated Chrome browser displayed a real mixed old-word question at 390 × 844 and 1280 × 900. Both screenshots were visually inspected: the source Fidäl, picture choices, progress indicator, model-help control and defer control rendered without overlap or horizontal clipping. There were no page errors during that flow. Screenshots are `/private/tmp/srs-phone.png` and `/private/tmp/srs-desktop.png`.

Phone screenshots use full-page capture and can require vertical scrolling. This is layout evidence in browser emulation, not a physical-device or assistive-technology audit. The first capture helper needed a selector narrowed to its first match because both the next-action card and path node correctly launch the same lesson; the corrected helper completed successfully.

## Remaining limits

- Elapsed days and return sessions were simulated; no multi-week learner study has been performed. The exact intervals are configurable design heuristics, not validated retention predictions.
- Existing dictionary-backed candidates, meanings, image associations, character contexts and directions still await qualified native Tigrinya review. Tests preserve provenance and pending gates; they cannot approve language content.
- No reviewed native recordings, verified teacher stroke sequences, pronunciation rubric or sentence/conversation content was invented. Those features remain unavailable pending source material and review.
- Real mobile IMEs, physical touch/stylus, screen readers, independent child usability and learning effectiveness remain unverified.
- Persistence requires the existing explicit device-save choice. Without it, only current-page practice survives. Shared-device users share that local profile; no cloud or account sync was added.
