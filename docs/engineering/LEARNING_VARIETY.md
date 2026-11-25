# Learning-path activity audit and focused improvement

Audit baseline: `fcce293`, 25 November 2026. The current owner request authorizes this scoped implementation and explicitly forbids commit/push/deployment, overriding automatic Git sync. This is a local visual-practice increment, not native approval or demonstrated learning effectiveness.

## Before-edit boundaries

Keep every tracked file in Unit 1, `shared/`, Product Bible, backend and mobile targets unchanged. Also preserve the three derived Bibles, source review JSON, `path-curriculum.json`, generated `path-content.js`, original picture-library page, `path-core.js`, `path-srs.js` and frozen baseline fixtures. A local hash inventory records these files before code edits. Changes belong to Unit 2's activity adapter/packaging, focused tests and this documentation. Existing normal progression and developer-preview isolation must continue to pass.

## Activity map before the change

All visual Tigrinya activities below remain **awaiting qualified native review**. “Implemented” describes software, not approved language or proven competence.

| Activity / location | Objective and learner response | Skill actually practised | Current status / repetition |
| --- | --- | --- | --- |
| Unit 1: model, guided match, difference check | See a form/family, compare shapes and choose the match/difference | Fidäl recognition; sourced vowel-order relationships | Implemented, pending review; preserved |
| Unit 1: writing/text workshop | Draw over a printed model, enter Unicode or use form keys | Freehand exploration/copying/text input | Implemented; no handwriting grade or verified teacher strokes |
| Unit 2, 16 introductions: `look` | Inspect source picture, word and two-form decomposition | Word-form/meaning exposure, not recall | Implemented, repeated each word |
| Same introductions: `build` with visible model | Select the two displayed forms in order | Supported Fidäl word construction | Implemented, but answer remains visible |
| Same introductions: `choose` | Picture cue → tap its written word | Receptive picture-to-word recognition | Implemented; dominates both practice and checks |
| Unit 2, five checkpoints + introductory checks | Repeat picture-to-word selection after the model is removed | Visual recognition; help tracked | Implemented; same response type, not independent writing |
| Unit 3, `positions` and `family` | Locate first/last or a sourced family form in a taught word | Segmentation and form relationships | Implemented; still choice-based |
| Unit 3, `copy` | Enter shown Ethiopic word; optional printed-form pad | Copying, accessible text entry | Implemented; drawing does not grade handwriting |
| Unit 3, `read` | Written word → choose picture | Reverse receptive word-to-meaning mapping | Implemented, concentrated in one lesson |
| Unit 3, `write` / `mixed` | Recall taught word from picture; input text; mixed reading | Cued written recall and receptive reading | Implemented; productive input arrives late |
| Embedded / manual spaced review | Revisit only taught items with separate recognition/reading/entry/construction/locating records | Task-specific retrieval; support and delayed sessions distinguished | Implemented; retain existing time/gap/budget and anti-inflation rules |
| Unit 4: listening / pronunciation | Planned sound-to-meaning and spoken response | Listening / speaking | Content-blocked: native recordings, rights, directions and human rubric missing |
| Unit 5: message / reply | Planned reviewed sentence and response | Grammar / communication | Content-blocked: native-authored constructions, translations, answers and recordings missing |
| Game Garden, pronunciation cards, Stories | Existing side activities and reading material | Varies; current English Stories are not Tigrinya sentence instruction | Preserve; games do not replace a coherent teaching sequence or certify proficiency |

The principal gap is response variety inside early word learning: recognizing a displayed answer is repeatedly treated as the main interaction. The existing renderer already supports reverse reading and text entry, so new game mechanics, content imports and backend algorithms are unnecessary.

## Research and public product approaches

- Duolingo's public [spaced-practice explanation](https://blog.duolingo.com/how-we-learn-how-you-learn/) motivates useful revisits. Its prediction/usage results are product-specific and do not validate this app's Tigrinya learning outcomes. Retain this repository's scheduler rather than copy another algorithm or rewards.
- Rosetta Stone describes [scaffolded image/context connections with native audio](https://educationblog.rosettastone.com/2022/10/a-new-look-for-rosetta-stone-for-schools-lessons/). Reuse our own existing picture/word associations in both directions; do not simulate immersion when reviewed recordings and meaningful sentence contexts are absent.
- ThoughtCo's [vocabulary reference article](https://www.thoughtco.com/vocabulary-acquisition-1692490) uses an accessible definition and related concept links. Adopt the general idea of short explanations and an optional reference, not its wording, examples or empirical authority.
- The [IES practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) supports spacing, worked examples alongside problems, and graphic/verbal connections. The original [foreign-language retrieval study](https://doi.org/10.1126/science.1152408) supports repeated retrieval over restudy in its studied setting. These inform model fading and later recall; they do not establish an effect size, ideal duration or child usability for this application.

No competitor content, images, screens or lessons are imported. No new Tigrinya word, translation, pronunciation, sentence or answer key is generated.

## Chosen implementation

**MVP increment:** integrate a short, reusable model-fading routine into the sixteen existing word introductions. Model and build each new target first; revisit it through a written-word-to-picture task and picture-cued Ethiopic input after other targets intervene. Keep the existing visual recognition checks and their unlock criteria; written practice is not silently promoted into assessed writing proficiency.

Objectives/prerequisites and support conditions belong to the routine contract. Text alternatives use actual Ethiopic input and existing form keys; pointer dragging, speech or drawing are never prerequisites. Wrong answers show the correct existing model and allow retry. Existing mixed-review items remain bounded and scheduled by the unchanged scheduler. Reference/model access is support, not independent success. Missing audio, scoring, strokes and sentence content remain visibly blocked.

Impact: broader receptive/productive practice early in Unit 2. Effort: bounded Unit 2 adapter plus pure sequence module. Risks: increased session length and motor/input demands; preserve accessible keys, help, pause/resume and existing check gates, and validate with real learners before claims of independent use or improved retention. See the accompanying validation record for concrete implementation, checks and remaining limits.

## Implemented result

The routine is live in all sixteen existing Unit 2 introductions, using each lesson's existing new-word focus. For one to three targets it creates four to twelve practice steps: model/build pairs first, then a reading round and a picture-cued entry round. Multiple-word groups revisit targets after other words intervene. A one-word group cannot provide the same within-session separation; it still receives the unchanged later review schedule. Existing bounded mixed reviews remain inserted by the existing adapter.

| New routine step | Model and response | Evidence limit |
| --- | --- | --- |
| Look | Existing picture, written word and form order are visible | Exposure only |
| Build | Follow the visible word model with stable form keys | Supported construction |
| Read | See the word and choose its picture, with the meaning model hidden | Same-visit receptive practice; help reveals the correct existing association |
| Recall | See the picture and enter the word with keyboard or Fidäl keys; written model hidden | Same-visit cued entry, not fluent writing, handwriting quality or pronunciation |

Each step has a concise instruction and a Goal and support disclosure defining its objective/prerequisite. The introduction includes a short word/Fidäl reference using only existing source spellings, meanings, family/order records and dictionary links, with native-review limitations visible. It supplies no sound rule. Wrong responses reveal the existing model and allow correction; empty entry asks for input/help without recording an incorrect answer. Text uses the existing NFC/grapheme utilities, LTR Tigrinya fields and native composition handling. Standard buttons support keyboard and touch; no animation, drag requirement or dependency is added.

All existing check types, unlock criteria, source content versions, stored progress formats and scheduler code remain unchanged. Old passed recognition checks are not reinterpreted as written competence. New same-visit activities remain supported practice in the existing evidence contract; only a later eligible review can contribute delayed evidence. Developer Preview reaches the new steps while preserving its no-write guarantee. Missing routine files fail clearly with reload recovery.

Implementation files: `unit-02-first-words/src/word-routine.js`, `.css`, the existing `path-app.js` adapter, source shell/generated page and runtime packaging. Exact new Unit 2 hooks are normalized before older frozen-source checks; their baseline hashes and the previous preview fixture are not changed. See [validation](LEARNING_VARIETY_VALIDATION.md).
