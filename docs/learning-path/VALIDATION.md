# Learning path design validation

**26 November 2026 · design package against code baseline `adf5d79`.**

## Scope

This change adds an audit and proposed learning design, English lesson recommendations, a source-derived coverage inventory and a deterministic documentation builder. It corrects the earlier audit's mistaken description of Stories as English: the actual collection contains 20 Tigrinya drafts awaiting qualified review. The engineering index links this package.

No app behavior, lesson content, release status, Unit 1 file, shared asset, audio, progress record, backend, mobile target, approved Product Bible or derivative Bible is changed. Proposed listening, writing instruction, placement, confusion lessons, stories and missions are not new runtime features. The source hashes in [coverage.json](coverage.json) identify the audited revisions; the generator does not write any source or approval file.

## Checks run

| Command / check | Result |
| --- | --- |
| `python3 docs/learning-path/build_inventory.py` | Pass. Generated only `coverage.json` and `LESSONS.md`, from exact current sources and authored English design notes. |
| `python3 docs/learning-path/build_inventory.py --check` | Pass. All 293 unique source forms / 42 groups, source statuses/context pointers, all 31 lesson IDs in canonical order, prerequisites, target IDs, review-source identity, 27 preview-available / 4 blocked nodes, 20 Tigrinya story drafts / 160 paragraphs, source hashes and local design links verified. |
| `python3 scripts/check_product_spec.py` | Pass. 32 schema definitions; seven stages, 28 units, 56 modules and 224 blocked authoring assignments in the wider proposed specification; 43 relational tables; 17 phase references and document links. These counts concern the existing broader design, not the implemented 31-node path. |
| `bash scripts/tool.sh node tests/check_word_routine.cjs` | Pass. Seven groups covering teach-before-retrieval, all 16 introductions, objectives/access instructions, source preservation, bad-content rejection and blocked future units. |
| `bash scripts/tool.sh node tests/check_path_srs.cjs` | Pass. Thirteen checks covering actual delayed intervals, same-day/support isolation, bounded review, clock/replay behavior and progress compatibility. |
| `bash scripts/tool.sh node tests/check_word_path.cjs` | Pass. Ten checks covering source goals/gates, actual 27-node progression, help/unlocking, review, optional storage and Unit 1/shared baselines. |
| Python AST and JSON parsing | Pass. Documentation builder parses; both package JSON files parse. |
| Local Markdown link check | Pass. 34 local links across this package and the two affected engineering documents; design heading anchors checked. External reference URLs were opened during research rather than tested by this parser. |
| Protected-file SHA-256 comparison | Pass. All 449 tracked non-document files remain byte-identical to the before-edit inventory, including app code, Unit 1, source/review JSON and learner-runtime assets. |
| `git diff --check` | Pass. No whitespace errors. |

The first inventory run rejected an incorrect assumption that the review bank and path have identical candidate membership. The source builder deliberately excludes one same-picture alternative. The documentation builder was corrected to verify **31 path candidates plus the one documented exclusion equal the 32 review-bank picture candidates**, while comparing each included target with its exact source. The app's exclusion was preserved. This was a documentation-generator correction, not an app defect.

## Reproducing the design checks

From the repository root:

```sh
python3 docs/learning-path/build_inventory.py --check
python3 scripts/check_product_spec.py
bash scripts/tool.sh node tests/check_word_routine.cjs
bash scripts/tool.sh node tests/check_path_srs.cjs
bash scripts/tool.sh node tests/check_word_path.cjs
git diff --check
```

To revise recommendations, edit [lesson-recommendations.json](lesson-recommendations.json), then run the builder without `--check`. It writes only two generated documentation files. Source scope/review changes deliberately fail closed and require updating the audit instead of silently reusing stale readiness claims. The inventory is not imported by the app and grants no approvals or progress.

## Remaining validation and release boundaries

No new web build, TypeScript lint/typecheck, API/database run, browser session or device usability test was required or performed for this documentation-only change. The passing existing CJS tests are automated behavior/source checks, not newly observed app interactions. No child, adult, heritage-learner, teacher or accessibility-user trial occurred. Numeric audit ratings, proposed placements, remediation thresholds and timing targets remain design judgments.

Qualified native review, source-backed teacher strokes, licensed native recordings/directions, accepted responses and cultural/context judgments remain necessary. No pronunciation, handwriting, comprehension or comparative learning-effectiveness result is claimed. A release must also pass real phone media/offline/input/assistive-technology tests and appropriate privacy/content operations. The [full design](README.md) specifies the learning outcomes and evaluation plan; the [lesson map](LESSONS.md) identifies each node's content gate.
