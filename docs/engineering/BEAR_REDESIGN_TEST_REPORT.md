# Neri bear redesign

Date: 2026-11-21. The owner requested an animal mascot and explicitly prohibited committing, pushing and deployment for this task.

## Character and experience

The notebook character has been replaced by an original **living cinnamon bear**, retaining the working name Neri. Rounded ears, a lighter ear tuft, three-point crown fur, cream muzzle/chest, a short tail and broad animal paws give it a recognizable silhouette. Seated and curled poses replace the object body, binding, bookmark, boots and human hands. No new Tigrinya name, translation or cultural/geographical claim was invented.

Nine reusable states are implemented: idle/welcoming, listening, thinking, encouraging, celebrating, kind/gently correcting, demonstrating, resting and sleepy. They vary eyes, brows, head tilt, forepaws, mouth and body posture. Sleepy is a curled bear; it is a still companion outside the story prose. There are no idle animation loops or shaming reactions. Quiet view, textual captions, accessible image labels and OS reduced motion preserve a usable static experience.

The new original reference sheet was generated with the built-in imagegen tool. Its exact prompt is in [the design notes](../design/mascot/IMAGE_PROMPT.md). The reference PNG is documentation only. Runtime illustrations are local editable SVG, with no new packages or remote image dependencies.

## Screens changed

| Screen                      | Integration                                                                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Main app welcome            | A welcoming bear beside the existing introduction; original Fidäl artwork and lesson links retained.                                                                                            |
| Learn                       | An encouraging bear beside the existing unit choices.                                                                                                                                           |
| Published-question feedback | Resting during recall, thinking during the request, kind after errors/mistakes and celebrating an actual completed answer; original grading and model/retry behavior retained.                  |
| Progress                    | Calm encouragement beside the existing evidence/status view; no invented counts or achievements.                                                                                                |
| Standalone home             | A bear welcome separate from unit cards and Stories.                                                                                                                                            |
| Unit 1 Fidäl                | Bear welcome replaces the previous guide illustration; a small quiet companion accompanies the lesson/check screens. Original family content, order, writing and checks are retained.           |
| Picture-word activities     | Bear replaces the old decorative helper, empty-shelf and completion artwork. Word-picture artwork, written models, hints and completion rules remain unchanged.                                 |
| Word path                   | Welcome, quiet lesson support and a practice-completion pose; no changes to unlocks, review or mastery rules.                                                                                   |
| Game Garden                 | Encouragement before playing, quiet during play, celebration after practice. All twenty game mechanics remain unchanged.                                                                        |
| Say & remember              | Every object-mascot pose becomes the bear. The existing pronunciation card gates, recording privacy and reflection schedule remain intact.                                                      |
| Stories                     | A welcoming library companion and sleepy reader companion, outside the prose. All twenty full stories, illustrations, bookmarks and reading positions are retained. No voice feature was added. |

## Pronunciation scope

The bear's expressive muzzle is character acting, not a claim about human speech anatomy. The close-up is explicitly labelled **Schematic human lips**. It preserves the source-backed lip closure/release, upper-teeth/lower-lip contact and schematic nasal airflow from the existing /b/, /m/ and /f/ component guides. Start/middle/end selection, replay, slower visual pacing and still steps remain available.

The same eighteen exact Fidäl bindings remain supported. No new sound-to-mouth mapping, vowel, tongue/throat position, whole-syllable pronunciation or audio was invented. Unsupported forms, sixth-order readings and contextual words still require appropriate review. Qualified guide approval and exact reviewed recording/timing gates remain in place, with revision hashes recomputed for the changed drawing source.

There are **zero approved native pronunciation recordings and zero reviewed lip timelines** in the actual project. Existing synchronization code was tested with clearly labelled synthetic transport fixtures, not Tigrinya speech. No automatic pronunciation grading was added. Fluent Tigrinya and phonetics review is still needed for every guide, prompt, diagram, variation and future recording/timeline.

## Main files and assets

- Replaced artwork/API rendering in `shared/mascot/neri.js`; extended `neri.css`; retained the pronunciation adapter in `practice.js` with the explicit human-diagram label.
- Added `shared/mascot/scenes.js`, an optional standalone presentation adapter. It observes existing screen markers and never writes learning state. Captions survive image failures; static images remain when JavaScript/animation is unavailable.
- Added `apps/web/components/bear-companion.tsx` and its tests. App welcome, learning/feedback, progress and root style imports use the same local SVG exports.
- Replaced all eight previous expression SVGs and added `neri-sleepy.svg`. Nine lip-step SVGs now contain only the relevant human diagram. All eighteen exports are validated as XML.
- Added appearance-only markup/asset changes to the standalone home, Unit 1, picture-word shells, word path, Game Garden and Stories. Source shells and their generated counterparts were updated together.
- Updated the mascot builder/exporter, site package list, source checks, mascot browser tests and preservation helpers. Added `tests/e2e/bear-redesign.spec.ts` and the exact reversible UI replacement register.
- Updated `MASCOT.md`, the reference sheet/prompt and this report. The earlier mascot report is labelled as a historical record.

Existing preservation hashes were not regenerated. `tests/fixtures/bear-ui-replacements.json` records the exact appearance substitutions and additions; the helper reverses only those strings before comparing the original baselines. Source/content checks still cover all 293 Fidäl forms, original word candidates, original story text/assets, lesson order, completion gates and review scheduling.

## Checks completed

| Command/check                                                 | Result                                                                                                                                                                                                      |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bash scripts/tool.sh python3 scripts/check_all.py`           | Passed: content/build/HTML/Unicode checks, JavaScript syntax and behavior tests, fourteen mascot groups and original preservation baselines.                                                                |
| `bash scripts/tool.sh python3 scripts/prepare_web_preview.py` | Passed: the local standalone/web preview package includes all bear assets and presentation code.                                                                                                            |
| `bash scripts/tool.sh npm run build`                          | Passed: standard Next.js production build.                                                                                                                                                                  |
| `bash scripts/tool.sh npm run typecheck`                      | Passed.                                                                                                                                                                                                     |
| `bash scripts/tool.sh npm test`                               | Passed: eighteen tests in seven files, including quiet-state retention and failed-image recovery.                                                                                                           |
| Bear integration browser suite                                | Passed: sixteen cases, eight scenarios on desktop and phone layouts.                                                                                                                                        |
| Focused mascot/pronunciation/integration run                  | Initial result: 56 passed, two test-selector failures. The new word-path test matched both valid launch buttons; it was scoped to the first intended action, and all sixteen integration cases then passed. |

The integration command was:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3009 PLAYWRIGHT_CHANNEL=chrome \
  bash scripts/tool.sh npm run test:e2e -- tests/e2e/bear-redesign.spec.ts --workers=2 --trace=off
```

There is no configured lint command. TypeScript, JavaScript syntax, formatting and the project's validators were used; no lint pass is claimed.

The complete production-browser regression command also passed:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3009 PLAYWRIGHT_CHANNEL=chrome \
  bash scripts/tool.sh npm run test:e2e -- --workers=2 --trace=off
```

Result: **278 passed in 3.0 minutes**, including all sixteen new bear integration cases and the existing pronunciation, Fidäl, word-path, spaced-repetition, game and Stories cases. The local production server runs on `127.0.0.1:3009`; starting this local server did not deploy the app. The final source check and package build passed, including XML validation of all eighteen bear/human-guide SVG exports.

Visual inspection covered desktop and phone welcome, Fidäl home/lesson, picture words/help, Stories reader, the expression sheet and all lip diagrams. The bear remains separate from text and controls; Ethiopic characters retain their existing fonts, LTR direction and source content. Reduced motion, keyboard controls, failed-image recovery and JavaScript-disabled static artwork were exercised in browser tests.

The first preservation-check attempt exposed a bug in the new test normalizer: it converted unrelated binary assets to UTF-8 before hashing. The helper now returns original bytes for every file without a recorded UI replacement. No binary course asset was changed. Original baseline checks then passed.

## Limits

This is a local visual/engineering update, not native-language approval or evidence of learning efficacy. Physical iOS/Android devices, real screen readers, observed child/adult usability, cultural suitability and actual native audio/articulation timing remain unverified. The existing qualified content-review process still applies.

No commit, push, PR or deployment was made for this redesign.
