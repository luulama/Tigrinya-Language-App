# Tigrinya Fidäl: families, writing and source requirements

## Implemented

Unit 1 teaches Tigrinya Fidäl in the Ge’ez/Ethiopic script. It includes 35 seven-order basic families, six five-order labialized families, and 18 additional fourth-order forms in a separate group: 293 forms. The latter groups keep their actual order labels and are not forced into seven-form rows. They are not presented as Latin alphabet letters. Tigrinya runs left to right; character counts are not assumed to be spoken-syllable counts. Sixth-order readings depend on context.

Choose **Write it** within any form. Draw on the printed model, hide it to write independently, undo, clear (with undo), or replay your own marks at normal/slow speed. Still-picture mode works without animation and is used for reduced-motion preferences. Text practice supports native input, paste, IME composition and direct Fidäl keys. Text feedback compares Unicode identity; drawing feedback invites comparison without grading handwriting, stroke order or pronunciation. Writing is optional and does not manufacture lesson-completion credit.

The form is highlighted inside existing Tigrinya word examples, including noninitial positions such as the final character in the existing house candidate. 45 of 293 forms have existing word contexts. The remaining 248 use shape/writing practice without invented example words. The original 142-headword bank and 32 picture candidates are unchanged. No new Tigrinya words, translations or pronunciations were invented. All examples remain pending qualified native review.

Latin working sound labels are hidden from the learner lesson. Existing source transliterations remain in review material, labelled by their source convention. The UK geographical romanization table is not a pronunciation curriculum, and Unicode character names are not language-specific pronunciation instructions.

## Evidence checked — 20 November 2026

| Source | What it supports | What was not inferred |
| --- | --- | --- |
| [Harvard ELIAS Tigrinya Unit 1](https://elias.fas.harvard.edu/languages/tigrinya/Beginning/1/Unit-1-Alphabets) | Tigrinya-specific family structure, the existing seven-form rows and family-based reading/writing exercises. | No usable character-specific stroke trajectories, audio licences or native approval were imported. |
| [UK BGN/PCGN Romanization of Tigrinya](https://assets.publishing.service.gov.uk/media/634e725ed3bf7f618eda950c/ROMANIZATION_OF_TIGRINYA_22.pdf) | Left-to-right writing, orders, the existing family rows and context-sensitive sixth-order romanization. | Its geographical-name romanizations were not converted into guessed sounds or native recordings. |
| [Unicode 17, Ethiopic](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-19/) | Encoded consonant-vowel matrix, combining marks, glyph variation and input principles. | Printed font outlines and Unicode names do not establish Tigrinya handwriting sequence or pronunciation. |

I also located a publisher's [Amharic writing guide](https://s3-eu-west-1.amazonaws.com/s3-euw1-ap-pe-ws4-cws-documents.ri-prod/colloquial/Writing_the_Amharic_Script.pdf), a [Tigrinya handwriting video listing](https://www.youtube.com/watch?v=FIkWjoljoq4) and a commercial [Tigrinya writing book](https://www.tigrinya.com/contents/en-us/d18.html). The Amharic guide was not treated as automatically valid Tigrinya instruction. The video could not be inspected frame by frame and reuse rights/reviewer decisions are absent. The book listing does not expose a reusable, verified dataset. None was converted into teaching paths.

## Stroke and sound data still needed

The canonical records are in shared/content-review/fidal-writing.json. scripts/build_fidal.py generates shared/fidal-content.js so the app works offline without fetching JSON. Every one of the current 293 stroke/audio records is pending; there are no approved teacher sequences or recordings.

The interface supports verified teacher strokes as normalized point sequences on a 400×360 SVG surface. Each stroke needs its sequence number, first point, ordered points, direction verification and a reviewed step instruction. A sequence also needs Tigrinya language, handwriting style, exact source URL or local evidence reference, page/frame locator, named qualified reviewer, valid review date and usage rights. A local evidence reference must be within shared/content-review/evidence/. A printed glyph's contour must never be decomposed and relabelled as handwriting order.

Only records with complete approval metadata expose teacher playback, numbered starts, direction indicators, previous/next stroke review and a static alternative. The current pending records expose none of these controls. Replay my writing is always explicitly the learner's own drawing, not an official demonstration. Tests use a synthetic geometry fixture solely to exercise the provider interface; it is not a Tigrinya asset or review decision.

Reviewed audio similarly needs Tigrinya language, normal and slow local files, exact source/locator, reviewer/date and rights. Remote playback URLs and path traversal are rejected. Commit the licensed local assets with their reviewed records before enabling them; do not set approval fields merely to reveal controls. Human source validation is required: metadata checks do not establish authenticity on their own.

## Unicode, font and interaction validation

Shared text utilities use NFC and grapheme segmentation (with a combining-mark-aware fallback). Search folds Latin case/accents while preserving Ethiopic combining marks and distinct characters. Text entry accepts actual Fidäl characters rather than interpreting Latin transliteration as equivalent. IME Enter is ignored while composition is active. Script text uses Tigrinya metadata, left-to-right isolation, grapheme-safe wrapping and a local font stack including the actual installed family name **Kefa III**.

The automated runner now includes 88 behavior checks: the prior journeys plus writing integration, pointer/capture cancellation, per-character history, undoable clear, playback speed, static/reduced-motion behavior, native typing/IME, search, source-derived examples and strict teacher/audio gates. These tests use a lightweight DOM stub and do not replace browser testing.

The optional macOS diagnostic tests the installed Kefa III font file directly. It covered all 120 Ethiopic code points in the test corpus, including a combining mark, and its CoreText multiline specimen was visually inspected without missing-glyph boxes or clipping. A sandboxed name lookup initially resolved to Helvetica, so this is a font-data/rendering check, not proof of browser CSS font selection. No Apple font file is bundled or redistributed. The combining-mark fixture is an encoding test, not lesson vocabulary.

Chrome checks on 20 November now cover startup, actual mouse drawing, clear/undo/replay, onscreen Fidäl entry, Enter comparison and the first guided match/next form. The first home/lesson screens were inspected at an emulated 390-pixel width. These checks exposed and fixed a script-loading failure that VM tests had missed; the harness now executes the page's scripts in document order. Physical touch/stylus, real IME composition, VoiceOver, 200% zoom and the complete device/reduced-motion matrix remain unverified. See [the debugging report](QA_REPORT.md). There is no cross-device accessibility or handwriting-recognition claim.

## Privacy and limits

Only normalized x/y points are held in memory, separated by character. No pressure or timestamps are stored; nothing is uploaded or written to browser storage. Reload clears the notebook, and Clear can be undone within the active tab. No synthetic pronunciation, guessed stroke arrows, OCR score, account, tracker or paid service was added. Native review, licensed teacher stroke data and sound/direction recordings remain the next content requirements.
