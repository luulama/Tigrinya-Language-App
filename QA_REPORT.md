## Learning-path implementation — 20 November 2026

Applied the platform brief within the two existing units: next-step home panel, opt-in device-only completed-check history, separate shape/word evidence, due review selection, 1/3/7/14/30/60-day starting intervals, short-session selection, and presentation preferences. No new language content, external services or publication.

Validation: full build/source/corpus/HTML/privacy/JavaScript checks and all 99 behavior checks pass (11 new scheduling/storage/integration checks). Chrome local preview verified the home panel, time selection, explicit saving, a complete one-word Look → Make it → Find it → recap → supported check → result flow, and restored progress after reload. A browser-discovered static three-word label and a short-session planner loop were corrected and covered by regression checks. Existing Unit 1 and full default Unit 2 journeys remain covered by their executable checks.

Limitations: new layout has not been tested with real children, physical phone/stylus or VoiceOver. Presentation modes do not create new curricula. Longer time preferences do not promise 15/30-minute lesson content. Scheduling is provisional; re-teaching before checking cannot demonstrate unaided delayed retention. Reviewed audio, handwriting guides and expanded language curriculum are still missing. Hosted preview has not been updated in this task.

# Debugging check — 20 November 2026

## Expanded-demo follow-up

The later catalogue revision replaces the three-family limit with 35 basic families, six labialized families and 18 additional forms: 293 forms in 42 complete activities. All 42 groups complete guided practice, recap and checks in the regression harness. New order-label tests cover five-order groups and the separate additional-form group. All 88 behavior checks pass, as do builds, structural/source checks and `git diff --check`. The optional font test covers all 296 Ethiopic scalars in the expanded diagnostic corpus.

Chrome checks confirmed the 35 basic family buttons, the seven More forms activities, a newly added family and its writing surface, and the five-form group's actual order labels 1, 3, 4, 5, 6. Native audio and teacher trajectories remain pending. See [requirements coverage](DEMO_REQUIREMENTS.md) for the remaining content and future-unit boundaries. The earlier sections below describe the preceding three-family debugging revision.

## Confirmed defects and fixes

- **Unit 1 did not start in Chrome.** The family grid was empty and Start did nothing. The console reported `ReferenceError: FidalContent is not defined` at startup. Three Fidäl dependencies were placed after the inline app and after `</html>`. They now load before the app; the writing stylesheet is in the head. Start, family/order navigation and writing now work in Chrome.
- **Unit 2 used its search helper before loading it.** Its final `renderReview()` ran before `FidalText` was defined. The standalone shell now embeds that helper before the app. The rebuilt page starts without a console error; the adult bank shows all 142 headwords and a pasted `ቤት` query returns one house entry.
- **The pair game exposed a disabled sound button without recordings.** It now uses the same Visual status as the word activities. Audio and language review remain pending.

The old VM harnesses preloaded dependencies in an ideal order, hiding the startup defects. Both now execute the actual HTML scripts in document order. Structural checks also reject runtime markup after the document end and unavailable audio buttons.

## Git and Copilot

GitHub's remote HEAD was verified as `refs/heads/main`. The local `origin/HEAD` now points to `origin/main`. VS Code's machine-scoped User setting `git.path` now uses `/usr/bin/git`; its fresh log confirms Git 2.50.1, the correct repository and no earlier default-branch/config warnings. No repository was reinitialized or reset.

GitHub Copilot received a debugging assignment and a shorter review request. Both stayed at Working without returning findings. Reloading the project window activated its pending extension updates but did not produce a report. The stalled requests were cancelled. The findings in this report come from Codex's own inspection and browser reproduction, not a completed Copilot review.

## Verification

- `python3 scripts/check_all.py --node /Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node` — passed: both builds, corpus/source/link/ARIA/privacy/contrast checks, JavaScript syntax and all 87 behavior checks.
- `/usr/bin/git diff --check` — passed.
- `/usr/bin/git diff --exit-code -- unit-02-first-words/unit-2-content-review.json unit-02-first-words/unit-2-two-letter-words.md` — passed; source bank unchanged.
- Chrome: Unit 1 startup, first-form matching and next order; actual pointer drawing, clear, undo, replay, onscreen Fidäl input, wrong/correct text feedback and Enter submission.
- Chrome: full default Unit 2 journey through three word builds/matches, incorrect-answer recovery, all three picture pairs, recap, cumulative check, supported revisit and finish. The result correctly reported two matches without help and one with help.
- Chrome: Unit 1 home/lesson at an emulated 390-pixel width; no missing Fidäl glyphs observed. Unit 2's rebuilt startup/search showed zero console messages. The local root page also opens with `file://`.

## Limits and saved state

This is a focused check, not proof of every browser/device or complete accessibility conformance. Physical touch/stylus, real IME composition, VoiceOver, the full zoom/reduced-motion device matrix, and child/adult usability remain unverified. Native review, licensed recordings and verified teacher stroke data are still needed.

Fixes are saved in the master project and local demo bundle. They have not been committed, pushed to the original GitHub repository or redeployed to the existing private Site. Existing uncommitted work, learner-content review records, the stray user text file and the old editor save conflict were preserved.
