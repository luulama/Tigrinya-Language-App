# 15 — Content Architecture

**Version:** DRAFT_V2 — reviewed complete specification; owner approval pending
**Date:** 20 November 2026  
**Authority:** [Vision FINAL_V1](01-Vision.md), approved and unchanged. All other sections are working specifications awaiting owner approval.  
**Primary dependencies:** Sections 02–14, especially objective graph, activity instances, story/media contracts and evidence lineage; forward links to 16 AI, 17 entitlements and 18 scope.  
**Context:** All existing sections 01–14 read before this section was written. Later references are forward contracts reconciled in the whole-Bible review.  
**Evidence:** [Learning model and research](02-How-Humans-Learn.md); [source register](RESEARCH-REGISTER.md). Numerical targets, budgets, and thresholds below are design hypotheses unless explicitly sourced. No new Tigrinya teaching content or native approval is supplied.

## 1. Architecture principles

Content is structured, versioned educational material, separate from activity state and learner evidence. A content object must be usable in more than one activity without copying its language or losing provenance. A published snapshot must not change because an author saves a draft. Language accuracy, teaching suitability, media rights, and access are independent release concerns.

Use a modular monolith and the existing PostgreSQL runtime where appropriate. The earlier `docs/product/schema.sql` is a design contract, not the runtime migration source. Do not create a second production database to implement this Bible.

## 2. Entity families and essential fields

All reviewable entities share stable ID, language pack, kind, author, revision ID, payload schema version, source references, rights, review requirements, workflow state, timestamps, and published-revision pointer. The following fields extend that envelope.

| Entity | Required content responsibilities | Relationships |
| --- | --- | --- |
| LanguagePack | Language/script/variety metadata, direction, segmentation/comparison policies, fonts, support limits. | Family/forms, sound inventories, content and evaluators. |
| FidälFamily / Form | Unicode identity, reviewed relationships/orders, variants, teaching references. | Structural membership distinct from hard prerequisites. |
| Sound | Reviewed target distinction, native model and context. | Audio assets and forms/words; no inferred pronunciation. |
| Word / Sense | Original headword, grapheme count, distinct senses, usage/variety, source, optional transliteration policy. | Form relations, audio, images, contextual examples. |
| Phrase | Purpose, reviewed form/meaning, register and context. | Word senses and relevant patterns. |
| Sentence | Reviewed language and meaning, pattern links, context. | Words/phrases, grammar, audio, parallel variants. |
| Story / Passage | Purpose, audience, linguistic demands, ordered segments, branch graph where present. | Segment-level text/audio/images, questions and sources. |
| Dialogue / Turn | Purpose, roles, turns, repair and context. | Reviewed utterances, audio and optional alternate turns. |
| GrammarPattern | Reviewed form–meaning relation, scope, examples, exceptions where relevant. | Objectives, examples and assessed criteria. |
| CultureItem | Context/perspective, sources/date, variation and suitability. | Stories, media, domain reviewers. |
| Objective | Skill node, capability criterion, prerequisite edges, assessment and support contracts. | Stage/course placement, tasks and parallel sets. |
| Course / Unit / Module / Lesson | Purpose, sequence, objective coverage, learner/readiness and recovery. | References to reusable content and activities. |
| ActivityTemplate / Instance | Response mechanism, objective/skill, delivery guard, support/feedback, key or rubric. | Exact content revisions and access alternatives. |
| Question / Quiz / Assessment | Blueprint, response type, approved answer/rubric, task conditions and interpretation. | Objectives, evidence spans, parallel sets and rater anchors. |
| Project / PortfolioTask | Purpose, outputs, support/reference policy, rubric, revision protocol. | Multiple skill criteria without score inflation. |
| ImageAsset | File identity/digest, attribution/licence, reviewed visual association, alt descriptions. | Referenced senses/segments; isolated rights approval is insufficient. |
| AudioAsset | Native recording/source, speaker permissions, transcript, timing, variety, quality review. | Exact text/target revisions and segments. |
| VideoAsset | Source/rights, transcript/captions, relevant descriptions, age suitability and timing. | Reviewed language and visual/gesture claims. |
| StrokeModel | Verified source, character/variant, paths/order/direction/start, static alternative. | Exact form and qualified approval; optional and blocked if missing. |
| Review / Approval | Scope, qualification, reviewer, independence, revision/hash, decision/date, notes. | Exact subject and required scope set. |
| ReleaseManifest | Immutable bundle version, content/asset revisions and digests, dependencies, revocation state. | Language/stage availability and correction lineage. |
| LearningEvidence | First-response conditions, target revision/skill, support, judgment and lineage. | Separate private learner context; never embedded in public content. |

The existing implementation already has many typed payloads and versioned aggregates. Objective-level graphs, full release manifests, semantic equivalence, portfolio moderation, and pack revocation require gap analysis and later implementation rather than being falsely marked complete.

## 3. Example association contract

The following is structural illustration only. IDs are reference placeholders, not invented language, live content, or approval records.

```json
{
  "id": "activity-reference-example",
  "schemaVersion": "activity-v1",
  "language": "ti",
  "objectiveRef": "objective-reference@revision",
  "skill": "reading",
  "mechanism": "ACT.05",
  "wordSenseRef": "sense-reference@revision",
  "promptRef": "prompt-reference@revision",
  "requiredAssetRefs": ["native-model-reference@revision"],
  "supportPolicyRef": "policy-reference@revision",
  "assessmentRef": "question-reference@revision",
  "workflowState": "Draft"
}
```

The server must resolve every required reference to the intended published revision at release, not simply trust that an ID exists. An answer key belongs in protected assessment data and is omitted from initial public question payloads.

## 4. Workflow and approval gates

Use Draft → Submitted → UnderReview → Approved → Published. NeedsRevision returns a decision to the author; Archived/withdrawn revisions cannot enter new learner bundles. A published item can open a new draft while the old published snapshot remains available unless actively withdrawn for a reason.

Required scopes include Language, Teaching, Rights, and Accessibility, plus Audio, Culture, Strokes, or domain expertise when relevant. Qualification must match language/scope; the author cannot independently approve their own item. An administrator can perform publication but cannot bypass missing approvals by changing a status field.

An approval binds exact revision, canonical reviewed payload bytes/digest, media bytes/digest, required association context, reviewer qualification, decision, and date. A changed illustration can change meaning; a replaced recording is not covered by the old text approval. Record the scope-renewal decision instead of preserving a misleading badge.

## 5. Provenance and language fidelity

Preserve original forms and sense distinctions, source link/title, relevant page/entry locator, attribution, access date, and licence/permission. Dictionary evidence yields candidates, not native approval or child suitability. Keep the complete 142-entry sourced bank as draft material; select reviewed teaching instances without destroying source records.

Normalise only under an explicit language policy, preserving source text and reviewed byte identity. Do not strip Ethiopic combining marks, apply English stemming, or equate transliteration with script answers. Regional variants require documented context and acceptable-answer policy, not uncontrolled string substitutions.

Future language packs must supply script direction, segmentation, collation/search approach, rendering/input support, comparison rules, phonology/morphology content, review expertise, and assessment contracts. Unknown future languages may need new adapters; “supports any language” is an architectural goal, not a claim of prevalidated universal pedagogy.

## 6. Dependencies and publication transactions

Maintain separate graphs for structural membership, delivery references, and educational hard prerequisites. Reject cycles in hard prerequisites and required publication dependencies where they create impossible release order. Family ↔ form membership is not a hard prerequisite cycle.

Before publication, validate schema, language constraints, required assets, digests, source/rights, qualifications, author independence, approval completeness, prerequisite semantics, branch reachability, and public DTO redaction. Commit the published snapshot and dependency graph atomically with concurrency protection. Media storage uses immutable create-only names so a reviewed file cannot be overwritten behind an unchanged ID.

## 7. Delivery, caching, and correction

Public APIs return published snapshots. Draft/media preview requires author/reviewer/admin permission and no-store handling. Private learner evidence, auth callbacks, tokens, and protected responses must never enter a public service-worker cache.

A future offline pack verifies manifest and asset digests before activation, retains the previous safe bundle after partial failure, records revocation status/last check, and communicates verification limits. Immediate revocation cannot be guaranteed to a permanently disconnected device; sensitive content requiring fresh checks must expire or remain online-only. The correction policy must say which option applies.

A semantic correction can require withdrawing dependent assessments and suspending affected progress interpretation. Cosmetic equivalence can carry evidence only with an explicit qualified record. Preserve what the learner actually saw. Never rewrite history to pretend a corrected key was always delivered.

## 8. Private evidence and data operations

Keep learning records in a protected domain with server-derived learner identity and verified relationship access. Persist only explicitly scoped data; guest practice remains possible. Idempotency uses event ID plus immutable request fingerprint. Answer grading is server/qualified-rubric authority, not a client-supplied score.

Define export, deletion, retention, backup, and permitted audit exceptions before expanding persistent child services. Do not log raw recordings, journal text, credentials, or complete protected request bodies. Exported records retain content-version context without exposing other learners or protected question banks.

## 9. Search, performance, and scale

Search published fields only; index language/kind/revision and due learner/skill state. Use pagination and immutable media/CDN caching for public assets where configured. Measure query plans and storage growth before partitioning or adding services. A future attempt partitioning strategy must preserve global replay uniqueness; per-partition keys alone are insufficient.

Content scale also means reviewers, rights, corrections, and editorial maintenance. Track missing assets and scopes, source/rights expiry, dependent releases, review capacity, and correction turnaround. A million generated questions with no validated tasks is not a scalable educational catalogue.

## 10. Acceptance and migration

Create an implementation gap ledger against the actual EF entities, public DTOs, current review flow, and service-worker rules before coding. Version schema changes explicitly, retain old published readers as needed, and use reviewed migrations with tested restore. No automatic destructive down-migration or source-bank overwrite.

Acceptance cases include author self-approval rejection, wrong scope/language, stale hash, concurrent publication, unpublished dependency, structural-family cycle exception, semantic correction, withdrawn cached pack, protected preview leakage, answer-key leakage, cross-learner access, Unicode round trips, and partial download recovery. These checks establish implementation behaviour; qualified review and learner evaluation establish different evidence.

## 11. Change impact and offline assessment boundary

Classify changes before release: cosmetic-equivalent (document equivalence); teaching/support change (renew teaching/access scope and reassess task conditions); semantic/key/model change (renew relevant native/teaching scopes and suspend invalid dependent inferences); rights change (recheck permitted distribution); safety/cultural issue (withdraw affected releases and communicate correction). Preserve historical events rather than rewriting them.

A downloadable public practice pack may expose its answer/model data to the device. Treat its results as practice unless a separately validated assessment protocol exists. Protected or consequential server-graded assessments remain online; do not ship protected answer keys in a public bundle and call them secret. Permanently disconnected revocation cannot be guaranteed. Record pack last verification and expiry policy explicitly (RV15/RV16).
