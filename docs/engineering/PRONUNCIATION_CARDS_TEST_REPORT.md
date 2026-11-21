# Unit 1 pronunciation cards verification

21 November 2026. The change is local only. No stage, commit, push, pull request or deployment was created. Existing unrelated working changes and learner data were preserved.

## Implemented scope

Unit 1 has one new navigation link to **Say & remember**. The original family lessons, order, writing workshop and checks remain in place. New static HTML/CSS/JavaScript cards use the existing 293-form inventory and existing optional device-save profile. A separate pronunciation history never relabels shape checks as speaking evidence.

The real production data has **zero approved native models**. All 293 cards remain pending recording/target review, with a clear unscored exploration path. Rated comparison is enabled only with explicit reviewed target/audio metadata and completed model playback. The test-only synthetic audio fixtures are not shipped as content or claimed to be Tigrinya.

The app was started locally using:

`bash scripts/tool.sh npm run dev --workspace @polyglot/web -- --webpack --port 3006`

Game URL: `http://127.0.0.1:3006/preview/unit-01-fidel-foundations/pronunciation.html`

## Observed checks

| Check | Result |
| --- | --- |
| `bash scripts/tool.sh python3 scripts/check_all.py` | Passed generated builds, source/content/HTML checks, JavaScript syntax and behavioral regressions, including 13 pronunciation groups, old Unit 1 checks, 20-game contracts, 27-lesson word path and Unit 2 SRS. |
| `bash scripts/tool.sh npm test` | Passed 16 tests in six files. |
| `bash scripts/tool.sh npm run typecheck` | Passed, including the final check after starting the local development app. |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3006 PLAYWRIGHT_CHANNEL=chrome bash scripts/tool.sh npm run test:e2e -- tests/e2e/pronunciation-cards.spec.ts --workers=1 --trace=off` | Passed all **24 final card-game cases**: twelve scenarios in desktop and phone-emulated Chrome, including focus and the unscored-to-first-model regression. |
| Full browser regression, same base/channel with `--workers=2 --trace=off` | **186 passed** on confirmation rerun. The earlier run had 185 passes and one settings-dialog failure in the unchanged React app; its full six-case learner file also passed separately. The 186-case run preceded the last small scheduling guard; all affected card/browser cases (24) and source groups were rerun successfully after it. These overlapping counts are not additive unique cases. |
| `python3 scripts/prepare_web_preview.py` | Passed: 44 runtime/review files, with all HTML links/assets resolving. No deployment. |
| Prettier check on the new HTML/CSS/JS and pronunciation/path test files | Passed on the final files. |
| `git diff --check` | Passed. |

There is no configured lint command. Relevant syntax/source checks, TypeScript and formatting were used. No backend/PostgreSQL code changed and those integration suites were not run for this task.

Temporary logs are in `/private/tmp/`: `cards-source-verified.log`, `cards-unit.log`, `cards-types-verified.log`, `cards-final-24.log`, `cards-learner-rerun.log` and `cards-full-browser-final.log`.

Final review found and fixed one scheduling defect: a past unscored visit, with no earlier model, could satisfy a naive elapsed-time check when its first real model arrived. The scheduler now requires prior model exposure for interval expansion and starts the first compared visit at one day. A pure-state regression and both browser layouts verify that unscored history cannot become retrospective pronunciation success.

## Build limitations, not hidden passes

The default `bash scripts/tool.sh npm run build` was attempted, including retries with local-port/network permissions. Turbopack failed while transforming the existing `apps/web/app/globals.css`: its worker could not bind a port (`Operation not permitted`). This is an execution-environment restriction; no CSS or configuration workaround was committed.

The documented webpack fallback was then attempted with:

`bash scripts/tool.sh npm run build --workspace @polyglot/web -- --webpack`

It compiled but its generated route-prop checks failed on existing `admin`, `profile`, `settings` and `signin` page exports (`reviewer`, `onboarding` and `signup` props are not `PageProps`). Those route files were not modified by this task. The default standalone TypeScript command passed, but **neither production-build attempt is reported as passing**. The webpack development server ran and served the learner flows for browser verification. The temporary `next-env.d.ts` development-path change was restored to its original contents.

Build logs: `cards-build.log`, `cards-build-final-attempt.log`, `cards-webpack-verified.log`. No unrelated account-page changes or ignored-build-error settings were introduced.

## Card/browser coverage

- Unit 1 navigation, crisp Ethiopic/LTR metadata, hidden support/audio/guide before attempt, missing-model explanation, five-card completion and replay.
- Reviewed-metadata fixture: attempt → complete normal playback → self-rating → feedback → next; slow/replay, supported retry, pause/resume, completion and keyboard-focus return.
- Need-to-practise scheduling and supported revisit only after two other cards; rich history persists through reload with the existing opt-in setting.
- A three-day-old unscored visit followed by the first reviewed model retains zero later-day self-ratings and begins a one-day interval.
- Denied microphone and absent speech recognition cause no penalty. Unsupported recording still allows speaking aloud.
- Broken reference playback cannot create a rating or false success. The learner can continue unscored.
- Late permission after pause stops the returned track and never begins capture. Permission is never requested on page load.
- Recording cleanup stops tracks, revokes the blob and excludes voice bytes/URLs from saved history.
- The browser's actual native MediaRecorder records a generated test AudioContext stream, then plays it through local Audio; the test observes completion and no non-GET request. This validates browser recording/playback mechanics, not real microphone hardware or speech.
- Keyboard activation, reduced motion, no horizontal overflow, return to the original Unit 1 lesson/writing controls.
- Missing runtime card data has a clear recovery alert and leaves the previous saved bytes unchanged.

Pure scheduler groups additionally cover source parity for all 293 forms, target/variety/provenance gates, sixth-order target restrictions, unscored evidence, 1/3/7/14/30/60-day timing, same-day/same-session/support isolation, model exposure before rating, shorter need/almost intervals, bounded separated revisits, five unique cards, mixed-family selection, duplicate events, rollback, malformed records, bounded history, quick-reload sessions and compatible saving of original visual checks/other keys.

## Preservation and visual QA

The original 20-file preservation fixture was retained rather than refreshed. Its test removes exactly the new Unit 1 link and marked shared storage extension in memory, then checks all original hashes. Every other original byte in those files matches. The original source/review JSON and learning content were not changed. Generated Unit 2 HTML picks up the shared extension through its existing build; its activity logic/content is preserved.

Phone (390 × 844) and desktop (1280 × 900) screenshots of the actual unscored card and phone home were inspected. The character, primary action, pause, optional recording disclosure and navigation render without horizontal clipping or overlap. That flow produced no page errors. Screenshots are `/private/tmp/say-home-phone.png`, `say-card-phone.png` and `say-card-desktop.png`.

Initial verification hurdles were separated from app failures: launching Chrome without required process permissions failed; a test helper tried a save button inside closed settings and was corrected to open the disclosure; one trace-writing/browser-close operation encountered temporary `ENOSPC`. Lower-concurrency, trace-free checks then exercised the actual UI. The original settings failure is not silently counted as a pass.

## Files added or changed for this task

- `unit-01-fidel-foundations/pronunciation.html`, `pronunciation.css`, `pronunciation-app.js`, `pronunciation-core.js`, generated `pronunciation-content.js`.
- `unit-01-fidel-foundations/index.html`: one game link.
- `shared/learning-path.js`: isolated optional-history extension. Generated `unit-02-first-words/index.html` includes that same extension through its existing builder.
- `shared/content-review/pronunciation-cards.json`: empty review-target manifest; zero fabricated approvals.
- `scripts/build_pronunciation_cards.py`, `scripts/build_site.py`, `scripts/check_all.py`: content generation, packaging and checks.
- `tests/check_pronunciation_cards.cjs`, `tests/e2e/pronunciation-cards.spec.ts`, `tests/check_project.py`, `tests/check_word_path.cjs`: new behavior checks and exact permitted-addition preservation checks.
- `PRONUNCIATION_CARDS.md` and this report: research, content workflow, implementation and actual results.

All pre-existing unrelated working changes were retained; they are not presented as new game implementation. No dependencies, backend schema, account page, original Fidäl/content-review inventory or preservation-fixture hash was changed.

## Content, research and remaining limits

The [feature/source guide](../../PRONUNCIATION_CARDS.md) links Harvard ELIAS and BGN/PCGN for structure/reading distinction, retrieval/spacing/interleaving research, IES feedback/practice guidance, and current MDN/Web Speech documentation. It explains the design impact and exact data/recording review workflow.

Reliable Tigrinya recognition for these isolated/contextual Fidäl targets was **not established**; no recognition, synthetic speech or automatic grading is enabled. Main practice uses speaking aloud and self-reflection against a reviewed model when available. Even a working transcript would not validate pronunciation quality.

All target readings, varieties, actual normal/slow recordings, contexts and support guidance still need a qualified native reviewer. Real mobile Safari/Firefox/physical microphones, noisy rooms, screen readers, child comprehension/usability and longitudinal learning effectiveness remain unverified. Chrome phone emulation and synthetic streams do not establish those outcomes. Saving remains origin/device-specific; a different local port is a different browser storage origin.
