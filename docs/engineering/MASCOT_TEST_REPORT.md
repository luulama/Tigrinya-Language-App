# Neri mascot — implementation and verification

Date: 2026-11-21. Local implementation only. No commit, push, PR or deployment.

## Product result

Selected **Neri, the notebook explorer**, after comparing generated hyrax, notebook and human concepts. The folded page, copper spine, three binding rings, teal bookmark and walking boots create a compact literacy-focused silhouette. The name is an invented working brand name, not a claimed Tigrinya translation. The original concept board and exact built-in imagegen prompt are in [the design folder](../design/mascot/IMAGE_PROMPT.md).

The reusable local SVG component has eight states: idle, listening, thinking, encouraging, celebrating, kind, demonstrating and resting. Captions and accessible labels accompany expressions. One-shot transitions replace idle loops; Quiet view and still steps preserve focus. Completing practice and choosing a self-rating can prompt encouragement, but facial feedback never grades pronunciation.

The existing pronunciation card front stays free of hints. After revealing support, eighteen exact forms in the B/M/F families offer a three-step consonant-component guide. A close-up shows lips/nose, with replay, slow visual pacing, stop and individually selectable still pictures. The /f/ picture shows upper teeth contacting the lower lip; /m/ includes explicitly schematic nasal airflow. No tongue placement is fabricated. Unsupported forms, sixth order and contextual words do not receive a guessed/default mouth pose.

**These are source-supported draft consonant guides, not complete Fidäl syllable models or native-approved teaching material.** Their vowels and context-dependent readings are not animated. There are still zero approved native recordings and zero reviewed audio timelines. The actual app therefore offers silent guides and unscored practice. The exact scope, sources and required reviews are described in [MASCOT.md](../../MASCOT.md).

Audio synchronization is implemented for future separately reviewed timelines. It requires the existing card/audio review gate, matching character, target kind, variety, normal/slow path, recording SHA-256 and an independently reviewed guide revision. Drawing or prompt changes invalidate the old guide revision. Playback follows actual media time, not a guessed fraction of a recording. A duration mismatch, buffering, pause, error or cleanup stops movement safely; unreviewed recording segments do not acquire invented vowel animation. Reduced motion preserves still steps instead of automatic mouth frames.

The mascot adds no microphone capture, synthesis, recognition, network calls, accounts, uploads or persistent storage. Existing optional private recording and microphone-denial handling remain intact. Stories contains no mascot or voice additions.

## Files and assets

| Area                           | Added or modified                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reusable character             | `shared/mascot/neri.js`, `shared/mascot/neri.css`                                                                                                                                                 |
| Articulation and integration   | `shared/mascot/articulation-core.js`, `shared/mascot/articulation-data.js`, `shared/mascot/practice.js`                                                                                           |
| Provenance and pending reviews | `shared/content-review/articulation.json`, `MASCOT.md`                                                                                                                                            |
| Static original artwork        | Eight expression SVGs and nine lip-step SVGs in `shared/mascot/assets/`, exported from the same renderer used by the app                                                                          |
| Exploration                    | `docs/design/mascot/concept-exploration.png`, `docs/design/mascot/IMAGE_PROMPT.md`                                                                                                                |
| Existing activity              | Only `unit-01-fidel-foundations/pronunciation.html` and `pronunciation-app.js`: five asset tags and four optional render/playback/cleanup hooks                                                   |
| Build/package                  | `scripts/build_mascot.py`, `scripts/export_mascot.cjs`; mascot entries in `scripts/build_site.py` and `scripts/check_all.py`                                                                      |
| Tests and report               | `tests/check_mascot.cjs`, `tests/e2e/mascot.spec.ts`, `tests/fixtures/mascot-preservation.json`, `tests/helpers/mascot-preservation.cjs`, scoped update to `tests/check_stories.cjs`, this report |

No dependencies were added. Unit 1's existing curriculum, order, family content, writing tools, ratings, scheduling and local-history implementation were not rewritten. All 91 pre-task source/art files have frozen hashes: 89 stay byte-for-byte identical, and the two enhanced pronunciation files match their original hashes after removing only the exact authorized hooks/tags. The earlier Stories preservation fixture was not regenerated; its check uses the same narrow exception and rejects any other change.

## Verification commands

From the repository root:

| Command/check                                                                                                                                                                                         | Result                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `bash scripts/tool.sh python3 scripts/check_all.py`                                                                                                                                                   | Passed: existing source/content/HTML/Unicode/behavior checks plus JavaScript syntax and fourteen mascot/articulation/preservation groups. |
| `bash scripts/tool.sh python3 scripts/prepare_web_preview.py`                                                                                                                                         | Passed: 95 runtime/review files, including all 17 SVG exports; all packaged HTML links/assets resolve.                                    |
| `bash scripts/tool.sh npm run build`                                                                                                                                                                  | Passed: standard Next.js production build.                                                                                                |
| `bash scripts/tool.sh npm run typecheck`                                                                                                                                                              | Passed.                                                                                                                                   |
| `bash scripts/tool.sh npm test`                                                                                                                                                                       | Passed: 16 tests in 6 files.                                                                                                              |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3006 PLAYWRIGHT_CHANNEL=chrome bash scripts/tool.sh npm run test:e2e -- tests/e2e/mascot.spec.ts tests/e2e/pronunciation-cards.spec.ts --workers=2 --trace=off` | Passed: all 42 mascot and existing pronunciation browser cases after the initial visual and test fixes.                                   |
| Prettier on edited mascot source, review JSON, activity hooks, tests, exporter and documentation                                                                                                      | Passed.                                                                                                                                   |
| `git diff --check`                                                                                                                                                                                    | Passed.                                                                                                                                   |

There is no configured lint command; no lint pass is claimed. JavaScript syntax, TypeScript, formatting and the existing validators were run.

The final full production-browser command passed:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3008 PLAYWRIGHT_CHANNEL=chrome \
  bash scripts/tool.sh npm run test:e2e -- --workers=2 --trace=off
```

Result: **262 passed in 2.9 minutes**, including all 18 new mascot cases and the existing Unit 1, pronunciation, word-path, spaced-repetition, games and Stories scenarios. The eighteen bindings are each exercised inside the new binding scenario on both layouts, including all three steps. The local production server was started with `PORT=3008 bash scripts/tool.sh npm run start --workspace @polyglot/web`; it listens on `127.0.0.1`. This is a local preview, not a deployment.

The nine new browser scenarios run on desktop and phone layouts. They exercise all eight expressions; every one of the eighteen exact bindings and its three still steps; recall/reveal separation; silent play/slow/stop/finish/replay; unsupported, sixth-order and missing-module recovery; keyboard and OS reduced motion; 320px layout and glyph separation; media-time synchronization, pause and slow recording; missing timing and failed audio; microphone denial; absence of speech recognition; preservation of other storage; and unchanged Stories navigation/content.

Synthetic PCM tones and clearly labelled transient review fixtures exercise audio transport only. They are never stored as native recordings or real approvals in the project. Tests cannot establish Tigrinya speech accuracy or native timing.

Initial browser results were 39 passed and 3 failed: two failures used a selector that matched both the character and its close-up, and a phone assertion raced an OS motion-preference update. Both test issues were corrected and all 42 cases passed. Visual review also prompted a true closed-lip pose, softer kind expression, resting arm, removal of distracting eyes from the lip close-up, and correct visual layering of lower lip over upper-tooth edges.

Visual inspection covered the character sheet, small-size identity, desktop home/practice, phone guide and all nine mouth/airflow steps. A fresh phone capture confirmed one header, one card panel, one guide and no horizontal overflow. An earlier full-page screenshot produced duplicated capture tiles; isolated element/viewport captures and DOM checks confirmed that the app itself did not duplicate content.

## Remaining review and limits

- A qualified fluent Tigrinya speaker and phonetics reviewer must approve the drawing, lip/teeth contact, nasal cues, prompts, consonant-component scope, intended variety, name and cultural/age suitability. /b/ varies in word context; lip appearance alone cannot establish /b/–/m/ sound differences.
- All other forms, sixth-order contextual targets, complete syllable/vowel movements and any tongue diagrams need appropriate evidence and review. Unsupported features remain explicitly unavailable.
- Native normal/slow recordings and exact separately reviewed timing data are still needed for real Tigrinya audio synchronization. The feature currently has zero such assets; only the transport mechanism was tested with tones.
- Real iOS/Android devices, real microphone hardware/permission UI, screen-reader use, observed child usability and learning effectiveness remain unverified. Chromium phone emulation, synthetic recording tests and source checks do not replace those evaluations.
- Nothing was staged or sent to GitHub. Existing uncommitted work was retained.

## Standalone SVG export correction

During the subsequent appearance preview, a standalone SVG rendered only the content preceding its mouth group: the exporter retained an HTML-style boolean `data-neri-mouth` attribute, which is invalid XML. The exporter now emits an explicit empty attribute value. All 17 static exports were regenerated, and the build now parses every exported SVG as XML before accepting it. The live inline component was already parsed as HTML and was unaffected. All fourteen mascot checks passed again, and isolated Chrome verified the corrected standalone SVG has no parser error and renders the smile. The correction was made after the full 262-case run above; that full suite was not rerun for this export-only fix.
