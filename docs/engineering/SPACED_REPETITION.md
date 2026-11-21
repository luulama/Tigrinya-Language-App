# Spaced practice inside the word path

Implemented locally on 21 November 2026, starting at Unit 2. Unit 1 and its existing shared assets, runtime and history are unchanged. This extends the earlier word path; it does not publish pending language content or make a proficiency claim.

## What the learner experiences

The primary next action continues the course, even when many words are due. New-word overviews show only the lesson's new targets. The immediately previous word is no longer automatically presented as a model in every introduction.

The scheduler chooses at most two eligible older items outside those new targets. It inserts retrieval between the new-word activities, after intervening work, rather than displaying all old answers in the overview. An older word can return as picture-to-word recognition, word-to-picture reading, word construction or actual Ethiopic text entry when that response has been taught. Character-location items can use another already taught source word containing the same real form. They do not assess pronunciation or invent example words.

An error reveals a specific model, preserves the new lesson's progress and offers retry. At most one supported revisit is inserted after two other tasks, in a different activity direction. If there is insufficient intervening work, the item stays scheduled for a later lesson/session. There is no immediate flashcard loop. Older mixed questions also offer **Keep going · revisit later**; skipping does not count as success and does not unlock anything by itself. New-target check requirements remain intact.

The optional review action remains useful for targeted extra practice, but normal lesson progression includes due material automatically. The core course does not require clearing an unlimited backlog. The new lesson budget is two mixed items plus at most one supported corrective revisit.

## Scheduling policy

The runtime is `unit-02-first-words/src/path-srs.js`, a small offline heuristic scheduler integrated with the existing path. It is **not** an FSRS implementation or a calibrated memory predictor. The separate reviewed-content API's SM-2/FSRS infrastructure is unchanged. Unapproved preview content is not submitted to that server as published course evidence.

| Situation | Scheduling response |
| --- | --- |
| First actual model exposure | Register the word/visual skills and schedule a calendar revisit after one day and a path revisit after two completed lesson positions. |
| Progressing through several lessons in one sitting | Select eligible old items after lesson gaps and at least three intervening task advances. Successful path retrieval lengthens gaps from 2 to 4, 7 and 11 completed lesson positions. This does not create delayed-session evidence. |
| Successful due retrieval in a distinct session after at least 24 hours without a relevant model | Expand calendar spacing through 3, 7, 14, 30 and 60 days. Only the response skill's successful-session record advances. |
| Wrong answer or requested hint | Retain the outcome, mark the item as needing support, reset its expansion steps, and make it eligible sooner through the short relearning/time or two-lesson route. Eligibility still respects the last model exposure. |
| Same-day correct retry, modeled practice or supported revisit | Retain it as practice. Do not increment the delayed-session record or infer mastery. |
| Long absence | Prioritise overdue items within the two-item lesson budget, without requiring all overdue items to be cleared before new learning. |
| Leaving during review | Save actual individual responses when saving is enabled. Stable per-task event IDs prevent the same response being counted again. |
| Clock rollback | Ignore temporally invalid outcome records rather than invent delayed success; the course remains usable and lesson-progress selection does not require waiting for calendar dates. |

The calendar intervals are starting design hypotheses. The task-spacing and lesson-spacing constraints are also product decisions, not Tigrinya-validated learning standards. Eligibility uses both the due point and last exposure; a due timestamp alone is not a claim that an item is ready for independent recall. Short relearning can return after a ten-minute exposure gap; that is not counted as a 24-hour delayed success.

Showing a word model resets exposure for its existing word-skill records and relevant introduced character records. Corrective feedback also records exposure. Looking at an answer cannot be followed immediately by a falsely labelled delayed recall in another direction. A correct reading response does not automatically become a spelling or pronunciation success. Consecutive path lessons do not repeatedly select the same word, and only one variant of a word is selected per mixed lesson plan.

The broad choices to space encounters, require retrieval and combine models with practice are consistent with the [IES learning guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1). That source does not establish these exact intervals or this app's effectiveness.

## Records and storage

Each item is keyed by source word and visual response skill, or by an existing character and its location skill. Records retain introduction/model timestamps, last reviewed point, next calendar/path point, expansion steps, correct/incorrect/hint counts, recent outcomes, task direction, lesson contexts and distinct delayed-session identifiers. Recent event history is bounded to 12 entries, deduplication IDs to 32, and retained session/context windows to 24. These are observable practice records, not a fluency percentage.

Sessions resume across a quick reload and renew after a gap of more than 30 minutes. Merely opening a new page cannot promote an item: calendar advancement also needs the exposure/time gap and a due response. Path advancement uses distinct passed lesson positions, not repeatedly pressing the same lesson button.

The richer `srs` object lives in the existing `tigrinya.word-path.v1` store. Saving remains explicit and device-only; a visible save action explains how to retain history for another day. With no consent or unavailable storage, current-page practice and lesson-gap selection still work, but unsaved history cannot survive leaving/reloading. The app says so and exposes storage failures without blocking learning. Shared-device users share this local profile. No new account, tracker, microphone, upload or external API is added.

Existing passed checks and original word schedules are retained. Old records initialise new schedules from their last known exposure, use the migration checkpoint for unknown lesson timing, and carry a `legacyImported` marker. Unknown original introduction dates and historical session successes are not fabricated. Newly observed exposures and attempts then supply the richer history.

Curriculum exports now describe the adaptive policy and new-target focus. `compatibleProgressVersions` accepts the known earlier path snapshot, and `materialVersion` identifies the unchanged source words and assessment references separately from policy wording. Policy-only updates do not discard valid lesson checks. Real source-material changes can still invalidate incompatible evidence. The earlier lightweight `review` fields remain a compatibility projection for existing progress UI; mixed-item selection and detailed recall evidence use the new skill-specific scheduler.

## Content and preserved work

The same 31 existing picture-word candidates and existing form data are used. The original full bank, excluded same-picture alternative and native review status remain intact. Source word IDs, spellings, meanings, artwork and assessment prerequisites are not replaced. Tigrinya remains left-to-right Ethiopic text with `lang="ti"`, NFC handling and existing accessible text entry. [W3C's Ethiopic guidance](https://www.w3.org/TR/ethi-lreq/) describes that script direction; RTL is not an appropriate layout for this material.

Sounds, spoken syllable practice, pronunciation, sentence patterns and conversation are not simulated. The current course lacks their reviewed media/content, so those gates remain closed. All word candidates, picture associations, character examples and future directions still need qualified native Tigrinya review. Browser tests cannot supply that approval or prove learning effectiveness.

## Verification

`tests/check_path_srs.cjs` covers introduction, calendar/path intervals, errors/hints, meaningful gaps, bounded selection, skill isolation, model exposure, idempotency, rollback, migration and saved-state round trips. `tests/e2e/path-srs.spec.ts` exercises actual lessons through the UI, proving hidden old-answer models, bounded mixed items, later corrective activities, continued path movement, reopen persistence and scheduler-load recovery. It also verifies that every generated answer set includes its target exactly once and contains distinct choices. Existing full-path, Unit 1 and game regressions remain part of the suite.

The first browser run exposed an omitted-target bug when sampling a larger answer pool. Choice construction now keeps the target and samples distinct alternatives before shuffling. An earlier regression test assumed all review prompts used word buttons; it now verifies both word and picture directions while retaining its partial-review and spacing assertions.

Final commands/results are recorded in [SPACED_REPETITION_TEST_REPORT.md](SPACED_REPETITION_TEST_REPORT.md). Simulated dates and browser storage fixtures validate mechanics; real longitudinal learning, physical mobile IMEs/stylus, screen readers and native audio remain unverified. No commit, pull request, push or deployment is part of this task.
