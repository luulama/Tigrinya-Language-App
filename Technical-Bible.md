# Technical Bible

**Version:** V2.0-DERIVED — complete handoff specification, owner adoption pending.  
**Date:** 20 November 2026.  
**Sources:** [Product Bible V2.0](Product-Bible/Product-Bible-V2.0.md), [Curriculum Bible](Curriculum-Bible.md), and [source manifest](Product-Bible/V2.0-MANIFEST.json). Section 01 remains approved FINAL_V1; the other specification decisions await adoption.  
**Boundary:** Target contracts and implementation gaps, not permission to code, migrate, deploy, activate accounts, or spend on services.

## 1. Architecture decision and existing assets

Preserve the existing standalone preview and the Polyglot Core modular monolith. The repository already uses Next.js/React/TypeScript, Tailwind/Radix, TanStack Query and Zustand; ASP.NET Core/.NET 10 with application/domain/infrastructure boundaries; EF Core/PostgreSQL; shared content/learning/type/UI utilities; Entra adapters; Azure Blob adapters; and explicit infrastructure/CI assets.

These are inspected repository choices, not recommendations to reinstall the latest versions. Exact package versions and .NET toolchain remain controlled by lockfiles and `global.json`. Do not rewrite the stack merely because a specification becomes more detailed. Check current maintainer guidance before any future upgrade.

The original static app remains an explicitly pending-review practice preview. Runtime publication and reviewed native teaching are separate gates. Existing engineering guides describe implementation; this Bible governs the target's educational contracts without falsely claiming every target is implemented.

## 2. Module responsibilities

| Boundary | Responsibility | Invariant |
| --- | --- | --- |
| Domain | Content workflow, approval independence, learning evidence/scheduling invariants. | No HTTP/provider dependency or arbitrary status-field bypass. |
| Application | Use cases, validation, ports, permissions and transaction intent. | Task validity before side effects. |
| Infrastructure | EF mappings, storage adapters, migration and identity integration. | Correct digests, persistence, concurrency and private access. |
| API | Authenticated/public DTOs, authoritative grading, problems, rate limits. | No client-supplied learner identity/correctness authority. |
| Web | Understandable task lifecycle, accessible controls, honest service/save states. | Never invent content, progress, or a successful upload. |
| Content engine | Typed content/pack validation and public eligibility checks. | Server remains publication authority. |
| Learning engine | Versioned scheduler and evidence interfaces. | Algorithm compatibility and support semantics explicit. |
| Shared types/UI/utilities | Wire contracts, owned controls, Unicode and safe names. | One consistent vocabulary for task/support/evidence. |

Start with measured needs in one deployable service boundary. A separate service, event bus, vector database, or replica needs a demonstrated operational requirement and a migration plan.

## 3. Runtime status and gap ledger

| Capability | Inspected status | Required next work before the target claim |
| --- | --- | --- |
| Static Fidäl/word previews | Implemented; language/media approval pending. | Do not promote as a complete reviewed child course. |
| Typed content, snapshots, scoped approvals | Implemented foundation. | Map all new objective/association and correction contracts. |
| Server grading for published choice tasks | Implemented foundation. | Preserve key redaction and exact task conditions; do not grade speech/writing as choices. |
| Model exposure and per-skill scheduling | Implemented foundation. | Full EVIDENCE_V1 encounter/support/baseline and M3 policy remain proposed. |
| `sm2-v1` API scheduling | Implemented authoritative baseline. | Calibrate educational policy separately from interval mechanics. |
| FSRS shared-package adapter | Implemented adapter, not API activation. | Persist correct state and execute explicit evaluated migration before activation. |
| Entra/auth and protected relationships | Implemented adapters; real configuration required. | Verify actual environment and account relationships before service claims. |
| Protected unpublished media preview | Implemented foundation. | Confirm complete association, rights, and review context for new assets. |
| Advanced objectives/portfolio/human assessment | Partial types; full workflow proposed. | Rubrics, rater/appeal, permissions and content. |
| Full objective graph, equivalence lineage, release manifests | Proposed contracts beyond current foundation. | Design compatible persistence and migration after approval. |
| Offline public shell/preview | Implemented limited cache. | No authenticated progress-sync claim; full pack integrity/revocation proposed. |
| Native recordings and verified stroke models | Content blocked where absent. | Qualified sourced/licensed assets and approval. |
| Learner-facing AI | Interfaces only. | No provider activation from these documents. |
| Actual child usability and delayed learning | Not established by build/tests. | Appropriate observed use and evaluation. |

The historical [verification record](docs/engineering/VALIDATION.md) documents earlier local checks. This documentation task does not rerun those application tests and does not claim new runtime validation.

## 4. Target data contracts

PB15's content envelope and typed payloads are authoritative target requirements. Keep stable content identity, immutable revision, language/variety, kind, schema version, author, provenance, rights, required scopes, review history, and published snapshot. Keep objective/skill graph and content-delivery graph distinct.

Represent private evidence separately: learner context, target/objective/revision/skill, task version, encounter ID, event ID, grading policy, first response, support conditions, exposure lineage, actual response time, and optional permitted judgment history. Store only fields justified by enabled scope; a conceptual schema does not authorise child persistence.

Required constraints include revision uniqueness, author-independent scoped approvals, restricted references for published dependencies, immutable asset digests, event replay uniqueness/fingerprint, concurrency stamps, and per-learner target/skill/model state uniqueness. Structural family membership must not become reciprocal educational hard prerequisites.

The existing EF migrations are runtime schema authority. Future migrations must map target fields, preserve old published readers/evidence, and state whether data is backfilled, unassessed, or withheld. The earlier design-only SQL cannot silently replace the runtime database.

## 5. Activity delivery and answer protocol

The following are **logical target operations**, not claims of new implemented endpoint routes:

1. Resolve a published task with exact content revisions, objective/skill, permitted response type, required asset availability, support/replay policy, and assessment conditions.
2. Create/identify an encounter with stable submission identity and appropriate server-side state. Do not expose protected answer keys.
3. Record a model/help exposure where relevant, with local awareness so a failed upload cannot manufacture unaided evidence.
4. Submit first response with event/encounter IDs, task revision, observed support, actual event timing under an explicit trust policy, and only necessary answer data.
5. Server validates identity/authority, task/revision, prerequisites, media/delivery conditions, payload, replay fingerprint, and grading key/rubric.
6. Commit first-response evidence, exposure/support effects, and compatible scheduler state atomically. Return the stored result on exact retry; reject changed payload with the same ID.
7. Return specific correction/model where appropriate; a subsequent retry is linked supported practice, not another independent event.

Client confidence may inform a later scheduler policy only after authoritative grading. It cannot decide correctness. Open speech/writing returns pending qualified/descriptive judgment unless a separately validated evaluator exists. A client flag cannot prove absence of off-device help.

## 6. Identity, authority, and privacy

Public approved content/basic practice can work without an account. Protected evidence uses validated issuer/audience/signature/expiry and server-derived subject. Parent/teacher access requires a verified relationship and scope, not just a role or self-declared adult flag. Reviewer qualifications and author independence are enforced separately from administrator publication authority.

Fail closed when protected service configuration is missing. Do not invent demo users or a local auth bypass to make a page appear complete. Public practice remains a truthful fallback.

Keep raw child recordings, free text, credentials, and complete request bodies out of operational telemetry. Child analytics remain off; any future adult opt-in or research collection needs its own purpose and permissions. Self-editable age/consent fields cannot override a child privacy boundary.

Before expanding collection, define purpose, storage location, access, deletion/export, backup expiry, audit exceptions, and retention owner. Temporary audio should remain memory/session-scoped unless explicitly retained. Do not assert a universal legal retention duration; obtain appropriate jurisdiction/service-specific advice for actual launch scope.

## 7. Storage, media, publication, and correction

Use immutable create-only asset names and verified SHA-256 digests; validate file type/size and untrusted uploads. Reviewers need authorised no-store preview of exact bytes. Publication checks language/teaching/rights/access and relevant audio/culture/stroke/domain scopes, then commits snapshot and dependency references together.

Implement PB15 change classes. A semantic/key/model correction can withdraw tasks and suspend relevant inference; cosmetic equivalence requires documented qualified rationale. Historical events retain what was delivered. Rights withdrawal affects distribution even if language remains correct.

A future public pack verifies a complete manifest and digests before activation and preserves the previous safe bundle on partial failure. Exclude auth callbacks, protected APIs, tokens, private records, and drafts from public caches. Offline practice may expose its models/keys; protected assessment remains online without a separately validated protocol. Declare last verification/expiry because disconnected revocation cannot be guaranteed.

## 8. Scheduling and state migration

Separate eligibility interpretation, memory-model updates, and session selection. Apply PB14 EVIDENCE_V1/M0–M3 only after explicit implementation and evaluation. Use actual elapsed UTC instants, not a calendar-day change or upload time, for delayed evidence. Do not treat initial placement as retention of app teaching.

Pin algorithm identity and parameters to state. For FSRS migration, persist its own state representation, source-history digest, replay/due-date policy, and rollback behaviour. Compare held-out prediction/workload where appropriate; no calibrated probability appears merely because a library returns a number. M3 criterion coverage remains distinct from a scheduler interval or observed-correctness fraction.

Support concurrent tabs with encounter-level idempotency and atomic commits. An untrusted or uncertain offline timestamp cannot silently become authoritative delayed evidence. A future outbox needs opt-in, bounded encrypted storage where appropriate, reconciliation, and an explicit conflict/trust model.

## 9. Unicode and language-pack interface

A language pack supplies scripts/direction, form relationships, segmentation/counting, comparison/accepted variants, search/collation, fonts/input needs, target language models, rubric policies, qualified review, and supported content kinds. Unknown future scripts may require new adapters; no generic engine can guarantee future pedagogy in advance.

For Tigrinya, preserve Ethiopic text and combining marks, use appropriate `lang`/LTR spans, test font fallback and mixed-language punctuation, and count graphemes where the content rule requires it. Keep source text and reviewed digests unchanged; search projections are separate. Use qualified equivalent/non-equivalent fixtures rather than broad stripping to increase match rates.

## 10. Reliability, deployment, and operational boundaries

Distinguish liveness, dependency readiness, missing content, unauthenticated, forbidden, unavailable media, failed save, and invalid task conditions. Do not turn a service outage into learner failure. Use bounded requests, rate limits, safe problem responses, and explicit retry/recovery.

The repository contains containers, GitHub workflows and Azure/Terraform assets. They are not proof of a deployed environment or permission to create one. Use explicit migrations with reviewed scripts and tested backup/restore. Reverting an image does not justify destructive schema downgrade. Measure load before scaling infrastructure; preserve global replay constraints if partitioning later.

AI providers, payments, live school services, third-party analytics, and new cloud resources remain disabled/out of scope unless separately authorised. Technical readiness is one gate among content, access, learning evidence, and operations.

## 11. Verification matrix

| Area | Required checks | What passing establishes |
| --- | --- | --- |
| Content | Wrong scope/language, self-approval, stale hash, concurrent publish, unpublished dependency. | Workflow enforcement, not native correctness. |
| Evidence | Immediate model, retry, unknown support, baseline, exact 24-hour gap, intervening exposure, changed revision. | Correct policy handling for the tested conditions. |
| Security | Cross-learner access, forged subject, unverified relationships, draft/media/key leakage. | Boundary behaviour under tested threats. |
| Reliability | Exact/mutated replay, concurrent tabs, failed save, unavailable audio, time rollback. | Honest recovery and idempotency. |
| Script/access | Unicode round trips, IME/composition/paste, marks, caret, zoom/reflow, keyboard, reduced motion and assistive technology. | Tested rendering/input/access paths, not universal conformance. |
| Packs | Partial download, wrong digest, old/revoked manifest, protected-response cache attempt. | Explicit offline contract for tested cases. |
| Migration | Old data/readers, explicit model migration, backup restore and non-destructive rollback. | Operational compatibility and recovery. |
| Learning | Qualified content review and intended-learner/delayed/parallel evaluation. | Different evidence from unit/build/browser tests. |

Future implementation should use the existing commands documented in `docs/engineering/DEVELOPMENT.md` and `TESTING.md`: type checks, Vitest, .NET tests including real PostgreSQL, production build, browser flows, and relevant content checks. Run tests appropriate to actual changes; do not present a historical pass count as a fresh run.

## 12. Traceability and implementation gate

TB audience/access requirements derive from PB01–04 and the Curriculum Bible. Task/evidence contracts derive from PB05–14; content/permissions from PB15; AI/business limits from PB16–17; implementation scope/readiness from PB18–20. The Design Bible supplies screen/state contracts without changing those meanings.

Before coding, owner adoption must resolve the review-ready status and any critical open decision. Then prepare a narrowly scoped implementation gap/change list with acceptance evidence, required content, migration impact, and owner. Preserve working functionality and data. This Bible adds no application source, dependency, service, migration, or deployment.
