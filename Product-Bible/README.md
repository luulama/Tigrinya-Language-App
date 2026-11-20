# Product Bible — Workflow and Approval Register

**Process established:** 20 November 2026, by the project owner's Golden Rule and document sequence.  
**Purpose:** Keep each section consistent with approved decisions and complete the documentation gates before further app implementation.

## Golden Rule

Every new or revised section must know the sections it depends on. Read the actual approved documents before drafting; a filename, a remembered chat summary, or a list of headings is not sufficient context.

When work is done outside this repository, supply the approved sections as source material in the working conversation. Within this repository, read their canonical files directly. The owner does not need to paste documents that are already available here.

Use approved earlier sections as authority. Drafts may provide explicitly labelled working context, but must never silently become binding decisions. Approval of one section does not approve another, prove a research hypothesis, or approve learner-facing language assets.

The locked [company vision](01-Vision.md) remains FINAL_V1. Preserve its [frozen version](versions/01-Vision-FINAL_V1.md) and integrity record. Conflicts with it require an explicitly approved successor rather than an incidental edit.

## Current approval register

**Completion update:** The owner subsequently requested completion of the whole attached blueprint. All twenty sections, the improvements-only whole-Bible review, a complete Version 2.0 consolidation, and the three substantive derivative Bibles have now been prepared. That request authorised preparing the full package; it did not fabricate approval of unseen decisions, native material, or learning outcomes.

| Section | Document | State |
| --- | --- | --- |
| 00 | [Master Vision](00-Master-Vision.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 01 | [Vision](01-Vision.md) | FINAL_V1 — approved and locked. |
| 02 | [How Humans Learn / How Humans Become Fluent](02-How-Humans-Learn.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 03 | [User Archetypes](03-User-Archetypes.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 04 | [Learning Framework](04-Learning-Framework.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 05 | [Curriculum Framework](05-Curriculum-Framework.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 06 | [Skill Tree](06-Skill-Tree.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 07 | [Activity System](07-Activity-System.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 08 | [Game System](08-Game-System.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 09 | [Story System](09-Story-System.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 10 | [Speaking System](10-Speaking-System.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 11 | [Listening System](11-Listening-System.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 12 | [Writing System](12-Writing-System.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 13 | [Culture System](13-Culture-System.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 14 | [Spaced Repetition](14-Spaced-Repetition.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 15 | [Content Architecture](15-Content-Architecture.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 16 | [AI Strategy](16-AI-Strategy.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 17 | [Business Strategy](17-Business-Strategy.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 18 | [MVP](18-MVP.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 19 | [Roadmap](19-Roadmap.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |
| 20 | [Final Decisions](20-Final-Decisions.md) | DRAFT_V2 — complete/reconciled; owner approval pending. |

[Read the full Product Bible V2.0](Product-Bible-V2.0.md), the [improvements-only review](V2.0-IMPROVEMENTS.md), the [applied-change ledger](V2.0-CHANGE-LEDGER.json), and the [exact-source manifest](V2.0-MANIFEST.json). [Context receipts](CONTEXT-LEDGER.json) record the pre-panel authoring inputs for Sections 04–20; they are historical context receipts, not approval records or hashes of the later reconciled sections.

Derivative handoffs: [Curriculum Bible](../Curriculum-Bible.md), [Technical Bible](../Technical-Bible.md), [Design Bible](../Design-Bible.md). Each is V2.0-DERIVED, substantive and traceable, with owner adoption pending. Preparing them now avoids leaving the authorised package unfinished; it does not bypass the implementation approval gate.

[Master brief coverage](REQUIREMENTS-COVERAGE.md) maps every requested section and follow-on deliverable. [Verification record](VERIFICATION.md) describes structural, integrity, coverage, and source-preservation checks. Original pre-panel drafts are preserved under `versions/PRE-PANEL-V1/`; those are verbatim historical snapshots with links originally relative to their canonical source location. Navigate current documents through this register.

## Context required for each section

Before drafting, identify the requested section, the approved versions of earlier sections, and any particularly relevant dependencies. Read all available approved earlier sections and inspect relevant drafts as provisional context. Do not advance beyond the requested section merely because a dependency is missing.

Each new section should state:

- Its version and approval state.
- The exact approved sources and versions governing it.
- Any draft dependencies and the decisions that remain provisional because of them.
- Relevant unresolved contradictions, assumptions, or missing evidence.
- Its scope and the neighbouring sections whose detailed work it does not replace.

For example, Speaking System must use the approved vision, learning model/framework, user archetypes, skill tree, activity contracts, and story decisions relevant to speaking. It must not invent a conflicting proficiency model or imply that an unapproved story or assessment system is already settled.

Later-numbered dependencies may be named as forward references, with open questions recorded. Once those sections exist, reconcile the references before final approval. The final whole-Bible review must check dependencies in both directions, not merely verify that each section cited earlier documents.

When work proceeds using a draft dependency, keep the affected decisions provisional and visible. Do not claim a fully approved chain of decisions until the relevant approvals exist.

## Effort priorities

### Tier 1 — Company-defining foundations

Spend the most effort on 01 Vision, 02 How Humans Learn, 04 Learning Framework, 05 Curriculum Framework, 06 Skill Tree, 14 Spaced Repetition, 15 Content Architecture, and 18 MVP.

For these sections, examine assumptions, learning evidence, operational feasibility, content dependencies, interpretation of progress, and cross-system consistency. Resolve consequential ambiguity before downstream systems treat it as a settled requirement. More words alone do not establish quality.

### Tier 2 — Implementation layers

07 Activity System, 08 Game System, 09 Story System, 10 Speaking System, 11 Listening System, and 12 Writing System implement the foundations. Their mechanisms and learner claims must be traceable to the governing decisions rather than introducing competing educational models.

### Tier 3 — Evolving strategy

16 AI Strategy, 17 Business Strategy, and 19 Roadmap should be proportionate, testable, and revisable. Avoid premature optimisation or detailed commitments unsupported by the educational foundations, resources, or evidence.

### Sections not assigned a tier

The owner did not assign 03 User Archetypes, 13 Culture System, or 20 Final Decisions to a tier. Keep them required; do not interpret their omission as permission to skip them or weaken inclusion, authenticity, or decision accountability. No additional tier is inferred here.

## Whole-Bible review and Version 2.0

After all twenty sections 01–20 are complete and their approval states are explicit, conduct the requested review from these perspectives: Product Architects, Learning Scientists, Software Architects, Curriculum Designers, and Startup Founders.

These are review perspectives unless actual external experts participate; do not claim independent expert endorsement from a simulated panel.

Identify contradictions, missing systems, weak assumptions, scalability concerns, technical risks, and curriculum risks. Include cross-section dependencies, language-review gates, privacy, accessibility, and the practical ability to deliver the MVP when they affect those categories.

The review output must contain **only improvements**, as requested. Make each proposed improvement actionable: identify the affected sections, the issue, the replacement or addition, its rationale, and any dependencies or evidence still required. Do not repeat the entire Bible, add generic praise, or label unresolved claims as proven.

Produce Version 2.0 as a traceable improvement set. Consolidate approved changes into the successor Bible after explicit owner approval; preserve earlier approved baselines. An improvement affecting locked FINAL_V1 requires the recorded successor approval specified in that document. Do not silently relabel an unchanged or unreviewed collection as Version 2.0.

## Required derivative documents

From the final approved Product Bible, create the following documents in order:

1. **Curriculum Bible:** Content-related decisions, including language and literacy goals, progression, content requirements, sources, review, assessment content, and approved media dependencies.
2. **Technical Bible:** Code-related decisions, including architecture, data contracts, authorisation, persistence, interfaces, privacy controls, delivery, testing, and operating constraints.
3. **Design Bible:** UX and activity-related decisions, including learner journeys, interaction states, feedback, accessibility, presentation, activities, and recovery behaviour.

Each derivative must name the exact source version and trace important requirements to the Product Bible. Resolve overlaps through shared contracts and cross-references rather than conflicting duplicate definitions. A derivative may expose missing detail but must not silently alter an approved product decision. Return substantive conflicts for explicit resolution.

The three documents must be substantive, mutually consistent specifications, not empty files or renamed copies of the Product Bible. Existing engineering documentation and code are useful context but do not automatically satisfy this gate.

## Implementation gate

The sequence is:

**Product Bible → whole-Bible review and approved Version 2.0 → Curriculum Bible → Technical Bible → Design Bible → codebase implementation.**

For further app implementation, complete the documentation sequence first, unless the owner explicitly changes or makes an exception to this workflow. This process instruction does not itself authorise code changes, deployment, publication, new accounts, tracking, or cloud spending.

Existing app code and working functionality are preserved. Do not delete, reset, or rewrite them because the owner has chosen to finish the planning sequence before more coding. The presence of an earlier implementation does not mean the new gate has been met.

## Next work under this process

The complete review-ready package is prepared. The owner can adopt the reconciled V2.0 and its derivative Bibles, or request targeted revisions. FINAL_V1 remains unchanged; the other documents retain their pending-approval status until explicit adoption.

No further app implementation, data change, deployment, service activation, or publication was performed. Before resuming implementation, resolve the documented adoption gate and the concrete content/evaluation/configuration gaps for the selected slice, or obtain an explicit owner change to the workflow.
