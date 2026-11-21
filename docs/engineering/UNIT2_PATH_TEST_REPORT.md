# Unit 2-onward path verification

Verified locally on 20 November 2026. No commit, pull request, push or deployment was created. Git HEAD remains `e17e045`; the index is empty and the changes remain in the working tree.

## Results

| Command/check | Result |
| --- | --- |
| `bash scripts/tool.sh python3 scripts/check_all.py` | Passed: original corpus, activity, writing, Unicode, source-gate and product checks; new path checks and five-page structural/link/privacy checks |
| `bash scripts/tool.sh node tests/check_word_path.cjs` | 10 groups passed: content provenance, lesson definitions/order, locks, help/retry, all 27 unlocks, review intervals/model exposure/rollback, saved-state validation and Unit 1 preservation |
| `bash scripts/tool.sh npm test` | 16 frontend/shared tests passed in six files |
| `bash scripts/tool.sh npm run typecheck` | Passed |
| `bash scripts/tool.sh npm run build` | Production Next.js build passed |
| `bash scripts/tool.sh dotnet test apps/api/Polyglot.Tests/Polyglot.Tests.csproj` | 18 tests passed with SQLite; no backend code or schema was changed |
| `python3 scripts/prepare_web_preview.py` | Passed: 36 runtime/review files, resolving local HTML links/assets |
| `PORT=3004 bash scripts/tool.sh npm run start --workspace @polyglot/web` | Local production app started successfully |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3004 PLAYWRIGHT_CHANNEL=chrome bash scripts/tool.sh npm run test:e2e -- --workers=4` | **154 passed** in the final complete run |
| `bash scripts/tool.sh npm exec prettier -- --check unit-02-first-words/src/path-core.js unit-02-first-words/src/path-app.js unit-02-first-words/src/path.css tests/check_word_path.cjs tests/e2e/word-path.spec.ts` | Passed |
| `git diff --check` | Passed |

There is no configured lint script. Formatting, JavaScript syntax, actual Python build execution and TypeScript checks are reported as those checks, not as an ESLint result. PostgreSQL/cloud deployments were not needed or rerun for this static client path change.

## What was exercised

The 154 browser cases comprise the 134 preserved app/game cases and 20 new path cases (ten scenarios on each of Desktop Chrome and Chromium iPhone 13 emulation). The path scenarios cover:

1. Launch from the main app, correct initial order/locks, keyboard entry and return to the original Unit 1.
2. Actual UI playthrough of **every one of the 27 available lessons**, check completion and next unlock, Unit 2-to-3 transition, progress counters, replay and resume. Both desktop and phone completed the whole sequence. This is 54 lesson completions, not a claim of 54 separate test cases.
3. Incorrect/repeated answers, model correction, supported completion, a locked next lesson and a successful fresh check that unlocks it.
4. No saving before consent; opt-in save/reload; preservation of the old `tigrinya.practice.v1` value.
5. Simulated storage failure, visible warning, retained in-page progress and unchanged previous saved bytes.
6. Simulated due review with no initial answer model, later-day evidence and same-day replay without interval inflation.
7. Actual Ethiopic text entry, incorrect text, synthetic active composition, onscreen keys and grapheme deletion; writing input, clear/undo, still-picture behavior and missing native audio/teacher-guide fallbacks.
8. A model view followed by reload/review, proving that recent model exposure is not counted as delayed recall and saved lesson checks are preserved.
9. One due word with meaningful taught alternatives, correct answers saved before a review finishes, and return/replay without duplicate interval growth.
10. Failed source loading/recovery, malformed saved JSON left untouched, correct LTR page direction and content-gated future listening/message steps.

The earlier browser failures were ambiguous test selectors matching the same lesson in both the recommendation and path node, or matching a nested writing summary. Those selectors were narrowed, affected cases passed, and the final complete suite passed. Additional regressions were added while hardening review exposure, partial-review recording and storage warnings.

Browser tests use isolated contexts. Timestamp fixtures simulate elapsed days, storage errors and malformed records; they do not wait for or demonstrate actual learning over days. No learner release approval or real account was fabricated. Phone emulation and mouse-generated pointer events are not physical phone/stylus testing.

Visual screenshot checks covered the desktop and phone map and the compact three-word introduction on a phone. Every lesson playthrough also checked for horizontal overflow on its path return. Active controls use native buttons and the new path's 48px minimum; the existing writing workshop retains its original accessible controls. A full assistive-technology audit was not performed.

## Unit 1 preservation

`tests/fixtures/unit1-path-baseline.json` records the pre-task SHA-256 values of **20 Unit 1 and existing shared files**, including the Unit 1 HTML, CSS, content pack, image, checks and all existing shared runtime/content/review files. Every hash matches after the final build/check run. `git diff --name-only -- unit-01-fidel-foundations shared` is empty. The preserved browser suite still opens Unit 1, starts its original first family and reaches its writing action. Neither its content/order nor its progress key was changed.

The baseline is a guard for this preservation requirement. Rebaseline only when an owner explicitly authorises a Unit 1/shared change; it is not a substitute for inspecting the behavioral impact of such a future change.

## Remaining verification/content limits

- All 31 path word candidates, meanings, pictures, family examples, instructions and child suitability still require qualified native Tigrinya review. The same-picture `ገዛ` / `ቤት` usage distinction remains in the original review bank.
- Reviewed native recordings and spoken directions, recording rights, human pronunciation rubrics, verified handwriting stroke data and native-authored sentence patterns/accepted replies are missing. Unit 4 and Unit 5 remain content-blocked; they cannot be promoted into visual-quiz passes by changing availability alone.
- Tigrinya is LTR, as documented by [W3C](https://www.w3.org/TR/ethi-lreq/). RTL is not an applicable layout for these Tigrinya lessons. Native script rendering, input and the existing Unicode helper were exercised in the available Chrome/macOS environment; other OS/font combinations remain unverified.
- Real native-audio playback/error recovery cannot be verified without reviewed files. Current tests verify honest audio absence and usable visual/text alternatives. Speech assessment was not added.
- Real mobile IMEs, physical touch/stylus, VoiceOver/other screen readers, Safari/Firefox, observed child/adult usability and learning effectiveness remain unverified. Completion/mastery thresholds and the review schedule remain design hypotheses.

Implementation and curriculum rationale: [UNIT2_PATH.md](UNIT2_PATH.md). Runnable local path: **http://127.0.0.1:3004/preview/unit-02-first-words/path.html**. It is also linked from the main app's Unit 2 card and the existing Unit 2 picture library.
