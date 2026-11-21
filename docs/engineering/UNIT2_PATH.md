# Unit 2-onward word path

Implemented locally on 20 November 2026. Unit 1 is unchanged. This is a pending-native-review visual practice path, not a released all-skills language course.

Update, 21 November: [Spaced practice inside the path](SPACED_REPETITION.md) replaces the earlier simple review recommendation with adaptive, bounded older-item retrieval inside later lessons. Its policy and compatible storage migration supersede the original 1/3/7-day-only description below; existing lesson checks and source content are preserved.

## Sequence and scope

The proposed sequence was explained before coding: continue from Unit 1's source Fidäl forms into familiar picture words, revisit those words through reading and writing, and keep unsupported listening/speaking and sentence work behind content gates. The original picture library and its full dictionary bank remain available.

The canonical runtime lesson definitions are [path-curriculum.json](../../unit-02-first-words/path-curriculum.json). Every lesson declares its goal, prerequisites, vocabulary/source IDs, characters, skills, sound/grammar availability, activity sequence, completion criterion and review plan. These definitions are generated from the existing Unit 2 review records by `scripts/build_unit2_path.py`; they do not create Tigrinya content.

| Unit/chapter | Lessons | Progression |
| --- | --- | --- |
| 2 · Begin | u2-01–u2-02 | Introduce the existing house, water and cat candidates; then a mixed visual checkpoint. Relevant Unit 1 forms remain directly accessible. No invented Unit 1 completion state is required. |
| 2 · At the table | u2-03–u2-07 | Four short lessons with up to two new source candidates; eligible older words return through spaced mixed practice and cumulative review. |
| 2 · Around home | u2-08–u2-11 | Three small word groups and cumulative review. |
| 2 · Outside | u2-12–u2-17 | Five small word groups and cumulative review. |
| 2 · People & me | u2-18–u2-21 | Three small word groups and cumulative review. |
| 3 · First and last | u3-01 | Locate both Fidäl positions in previously taught words. |
| 3 · One family, real words | u3-02 | Revisit the existing seven-order B-family row and find its forms in taught source words. This is structural noticing, not an invented pronunciation lesson. |
| 3 · A word on the page | u3-03 | Copy taught words with actual Ethiopic input. Optionally explore a printed form with the existing writing workshop. |
| 3 · Read, then find | u3-04 | Match a written taught word to a picture. |
| 3 · Remember and write | u3-05 | Enter a taught word from its picture cue, with native input or Fidäl keys. |
| 3 · Mixed word check | u3-06 | Revisit taught reading and text entry in a mixed checkpoint. |
| 4 · Listen & respond | u4-01–u4-02, content-blocked | Planned familiar-word listening and human-supported pronunciation. Needs reviewed recordings, directions, rights and a valid assessment rubric. |
| 5 · First connected meanings | u5-01–u5-02, content-blocked | Planned useful messages and replies. Needs native-authored constructions, translations, acceptable responses and recordings. No sentences or grammar rules were invented. |

There are **21 playable Unit 2 lessons and six playable Unit 3 lessons**, using **31 existing picture-word candidates**. One same-picture alternative, `ገዛ`, remains in the original bank alongside `ቤት`; its usage distinction needs native review, so the path does not ask a child to distinguish identical house pictures. All 142 dictionary headwords and all 32 original picture candidates remain in the original library/review records.

The grouping follows existing editorial worlds, not a claimed Tigrinya frequency curriculum. Lesson size, gating thresholds and the adaptive review schedule are design choices requiring learner evaluation. They are not validated Tigrinya mastery standards.

## Teaching, checks and review

Word lessons show a compact overview, then teach one word at a time through its picture, whole word and two existing character forms. Learners look, build left-to-right and find the word; a recap precedes a differently arranged check. Later tasks vary the response: locate positions, notice a source family, read-to-picture, copy and retrieve text. Models and specific correction remain available throughout.

Each new lesson requires the previous **visual check** to be passed. All check prompts must be answered correctly on a fresh run without answer-revealing model help. Help or a mistake marks that run as supported; completing it records practice and offers a fresh check. The next lesson stays locked until that check succeeds. A later supported replay never removes an already passed check. There are no lives, scores, streaks or timers.

Passing is explicitly a within-session visual-practice result. It does not establish pronunciation, handwriting quality, unassisted decoding, long-term spelling or language mastery. Drawing is optional comparison, never an automatic writing grade. Full language mastery remains unassessed while the required content and rubrics are missing.

The recommendation prioritises an unfinished lesson, then the next eligible lesson, with eligible older material mixed into the lesson itself. Any passed lesson can be replayed. A learner can resume an unfinished lesson from the map or deliberately leave it to choose another activity. The optional review button remains available for taught material, even when nothing is due. An overdue backlog does not prevent new learning.

Optional reviews use up to three taught words, with due targets first and familiar alternatives added so a lone due word is not a one-option test. They start without a written answer model. Per-item responses are recorded as they occur, so leaving a review does not discard genuine responses or count them again on return. Calendar intervals begin at one day and expand through three, seven, fourteen, thirty and sixty days after qualifying due recall in separate sessions. A lesson-progress route also supports learners taking several lessons in one sitting. Errors and hints shorten scheduling; models reset the relevant exposure gap. Same-day or supported repetitions do not create delayed-success evidence. Clock rollback and invalid records are handled conservatively. See [the full scheduling policy](SPACED_REPETITION.md) for budgets, skill isolation, migration and eligibility details.

The evidence records describe observed visual response skills only. They are not a general retention percentage or evidence of oral competence. Reading and writing lessons can be revisited independently; their completion is not relabelled as a delayed listening or speaking result.

## Script, media and accessibility

Tigrinya uses left-to-right Ethiopic text. New script spans and inputs use `lang="ti"` and `dir="ltr"`; the page is left-to-right. No RTL layout was introduced. This follows [W3C Ethiopic script guidance](https://www.w3.org/TR/ethi-lreq/). Family relationships come from the project's existing source records, whose Tigrinya source register includes [Harvard ELIAS](https://elias.fas.harvard.edu/languages/tigrinya/Beginning/1/Unit-1-Alphabets). No Amharic translations or pronunciation were substituted.

The model/practice alternation, visual support and spaced revisiting are consistent with the [IES learning guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1). That guide supports these broad instructional principles; it does not validate this app's exact sequence, check threshold or schedule.

Text entry uses the existing NFC/grapheme helper, native input, composition-aware checking, onscreen Fidäl keys and grapheme-aware deletion. The existing writing workshop provides freehand input, clear/undo, replay of the learner's own marks, optional still picture and text practice. It is loaded only by the new path; its shared source was not modified. Missing verified strokes and recordings retain their existing explanatory fallbacks. A printed glyph is not a teacher stroke sequence. Approved local recording paths are rebased for the new page and media-load errors retain visual/text alternatives; no reviewed recordings currently exist to exercise native playback end-to-end.

Controls use native buttons, visible keyboard focus and large touch targets. Feedback has a persistent announcement region. Reduced-motion settings disable the completion animation and select the writing workshop's still-picture option. Layouts and the word overview adapt to phone and desktop widths.

## Preservation and privacy

The path is a separate generated page, `unit-02-first-words/path.html`, linked from the main app's Unit 2 card, standalone home and original Unit 2 library. Unit 1's route, content, order, CSS, scripts, assets and behaviour were not rewritten. The existing Unit 1 card is unchanged. `tests/fixtures/unit1-path-baseline.json` records hashes for **20 Unit 1/shared files**; the preservation check verifies every byte. Original Unit 2 activity JavaScript and content/review records are retained.

The opt-in store, `tigrinya.word-path.v1`, is separate from `tigrinya.practice.v1` and other app history. Nothing is migrated into fabricated passed lessons, and old keys are not cleared. Default progress is in memory on the current page; leaving or reloading discards unsaved checks. Saving is an explicit device-only choice. Compatible earlier path checks and schedules are retained through a known-version/material-version migration; unknown or invalid data is preserved and explained rather than silently trusted. Historical successes are not invented. A failed write keeps in-page progress and the previous saved copy, with a visible warning and settings status. Unfinished lessons and drawings are not persisted. No account, tracker, microphone or external API was added.

## Verification and remaining native work

The original path results are recorded in [UNIT2_PATH_TEST_REPORT.md](UNIT2_PATH_TEST_REPORT.md); the current adaptive-review results are in [SPACED_REPETITION_TEST_REPORT.md](SPACED_REPETITION_TEST_REPORT.md). Automated coverage includes all 27 lessons through completion/unlock/replay on both sizes; wrong answers, repeated attempts, model help, saved-state recovery/failure, delayed and partial reviews, source/media absence, Unicode entry/composition/keys, writing clear/undo, reduced motion, navigation and Unit 1 preservation.

Before learner release a fluent qualified Tigrinya reviewer must verify all selected spellings, meanings, image associations, modern/regional usage, child suitability, character-family examples and instructions. Listening needs licensed native word recordings and spoken directions. Pronunciation needs a human-grounded rubric. Handwriting demonstrations need verified Tigrinya stroke data. Connected messages need actual reviewed constructions, translations and accepted replies. These are content gates, not fake lessons or failed learner scores.

Observed child/adult usability, real mobile IMEs, physical touch/stylus, screen readers and learning-effectiveness validation remain unperformed. Browser phone emulation, synthetic composition events and source checks do not replace them. No commit, pull request, push or deployment is part of this task.
