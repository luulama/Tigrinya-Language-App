# Language learning platform build specification

Build specification dated 20 November 2026. Tigrinya is the first language. The existing two-unit static app remains the running product; these documents define the complete target product and its staged implementation. No account service, database, AI provider or new curriculum is activated by this package.

[Product and experience specification](PRODUCT_SPEC.md) defines decisions, features, learner modes and screen contracts. [Learning and curriculum specification](LEARNING_SPEC.md) defines all learning stages, graduation rules and practice progressions. [Engineering and content operations](ENGINEERING_SPEC.md) defines data, APIs, AI boundaries, publishing and delivery gates.

| Requested phase | Binding specification |
| --- | --- |
| 1 Product foundation | PRODUCT_SPEC.md — Product foundation |
| 2 Complete learning system | LEARNING_SPEC.md — Stage contracts |
| 3 Curriculum architecture | LEARNING_SPEC.md — Curriculum hierarchy; curriculum.json |
| 4 Feature architecture | PRODUCT_SPEC.md — Feature contracts |
| 5 Spaced repetition | LEARNING_SPEC.md — Review algorithm; reference/scheduler.cjs |
| 6 Stories | LEARNING_SPEC.md — Story progression |
| 7 Speaking | LEARNING_SPEC.md — Speaking progression |
| 8 Listening | LEARNING_SPEC.md — Listening progression |
| 9 Writing | LEARNING_SPEC.md — Writing progression |
| 10 Child mode | PRODUCT_SPEC.md — Child mode |
| 11 Teen mode | PRODUCT_SPEC.md — Teen mode |
| 12 Adult mode | PRODUCT_SPEC.md — Adult pathways |
| 13 Culture | LEARNING_SPEC.md — Culture curriculum |
| 14 AI systems | ENGINEERING_SPEC.md — AI contracts |
| 15 Database | ENGINEERING_SPEC.md — Database contract; schema.sql; schemas/platform.schema.json |
| 16 Content production | ENGINEERING_SPEC.md — Content operations |
| 17 UX architecture | PRODUCT_SPEC.md — Screen contracts |

The machine-readable curriculum contains seven stages, 28 units, 56 modules and 224 lesson specifications. They are authoring assignments with blocked publication status, not 224 authored Tigrinya lessons. The current 42 Fidäl activities and 32 picture-word candidates are mapped as prototype source material; the full 142-word dictionary bank remains reviewer material. No new Tigrinya translations or review approvals are supplied.

Run the package checks from the app root:

```sh
python3 scripts/check_product_spec.py
/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node tests/check_product_scheduler.cjs
```

The SQL is an executable in-memory relational contract for development validation, not an installed production database. JSON Schema files define exchange formats. The scheduler is a tested reference implementation, deliberately separate from the current visual re-practice scheduler. Runtime adoption requires the migration and acceptance gates in ENGINEERING_SPEC.md.
