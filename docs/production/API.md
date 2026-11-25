# Proposed API contracts

[openapi.json](openapi.json) describes 31 proposed operations and 38 typed schemas. **These routes are specifications, not implemented features.** Existing unversioned `/api/*` endpoints stay intact. Preserve their server-graded review commands, protected answer keys and current SM-2 authority; do not create a second review service just because the new media/placement contracts use `/api/v1`.

## Transport, identity and errors

Use the deployment's configured HTTPS origin; the contract uses a relative server URL and supplies no fabricated host/tenant. Public published reads can omit a token. All protected calls validate the actual issuer, audience, scopes and subject. No request body selects the caller's learner ID or reviewer identity. A guardian path ID is an authorized learner UUID, never authority by itself. Return an appropriate consistent 404/403 policy without leaking another child's existence.

Personal responses and upload capabilities use `Cache-Control: no-store`. Approved immutable teaching renditions may be cached under their digest with the declared rights lease. A redirect cannot turn a private result into a public cached response. Enforce a narrow CORS allowlist appropriate to the real web/native deployment.

Each error uses `application/problem+json`: `type`, safe `title`, HTTP `status`, stable `code`, nonpersonal `traceId`, and `retryable`. Never include a token, storage URL, transcript, answer key, stack trace or another learner's identifier. The API's error vocabulary includes:

| HTTP | Code examples | Recovery |
| --- | --- | --- |
| 400 | `invalid_contract`, `invalid_signature` | Correct the request; no partial grading |
| 401 / 403 | `authentication_required`, `relationship_required`, `purpose_consent_required` | Sign in or complete the real authorized workflow; core account-free practice remains usable |
| 404 | `resource_unavailable` | Refresh catalogue or choose available material |
| 409 | `idempotency_conflict`, `invalid_transition`, `sequence_conflict` | Preserve existing result; fetch current state rather than overwrite |
| 412 | `revision_changed` | Reload ETag/review digest before a deliberate retry |
| 413 | `upload_too_large`, `batch_too_large` | Reduce bounded media/batch size |
| 422 | `unsupported_language_feature`, `unapproved_target`, `calibration_missing`, `rights_expired` | Offer the supported model/activity; no guessed grade |
| 429 | `rate_limited`, `budget_limit` | Honor `Retry-After`; never pressure repeated recording |
| 503 | `dependency_unavailable` | Retry only if safe; keep local/native practice usable |

`GET /capabilities` reports availability reasons, not marketing promises. The initial contract advertises the existing `sm2-v1` scheduler only. Enabling a future server FSRS adapter requires an explicit versioned capability/schema change and the migration gate; the existing TypeScript adapter alone cannot enable it.

## Idempotency and concurrency

Every mutation requires a UUID `Idempotency-Key`. Scope its canonical request digest and receipt to principal, route/action and resource. Same key/digest returns the prior result; changed payload returns 409. Do not expire a key while its billable job could still be retried. If a privacy deletion removes personal receipts, retain only the permitted non-content suppression marker needed to prevent resurrecting work.

Reviewable edits, decisions, publication, controls and placement/scenario turns require `If-Match` with the most recent quoted ETag. Return an updated ETag header on resource reads/mutations. An idempotent replay returns its original receipt even if the resource has since advanced; a new request with a stale ETag receives 412. The database command transaction owns these semantics, not a gateway cache.

List queries use an opaque bounded cursor, stable sort and maximum 100 results. Catalogue queries require the exact target version UUID and reviewed `varietyId`; do not silently choose a different variety. A public empty recording list is a valid unavailable state. Protected list/sync/export results remain principal-scoped.

## Native media workflow

| Operation | Permission and transaction |
| --- | --- |
| `GET /api/v1/targets/{id}/recordings` | Published target/version and selected variety; approved unrevoked renditions with transcript, attribution, hashes and lease only |
| `POST /api/v1/contributions/recordings` | Qualified adult contributor/rights check; exact target, speaker, variety, transcript, size and expected hash; allocate private upload |
| `GET /api/v1/contributions/recordings/{id}` | Owner or assigned qualified reviewer; state/revision/digest, never arbitrary private account data |
| `POST .../{id}/complete` | Verify actual uploaded bytes/hash; atomically enqueue decoder job; 202 means accepted, not approved |
| `POST .../{id}/submit` | Technical QA complete and metadata immutable; enter review |
| `POST .../{id}/decisions` | Current scoped native qualification, author independence and exact approval digest; append decision |
| `POST .../{id}/release` | Publisher command checks core scopes, two distinct native audio approvals, rights, final renditions and unresolved rejection atomically |
| `POST /api/v1/recording-releases/{id}/revoke` | Authorized moderation/verified rightsholder scope; immediately deny delivery and enqueue purge/revocation |

Upload capabilities expire after ten minutes, address one server-generated object key and permit only the bounded media PUT. Contributor max: 20 MiB/60 seconds. Content-Length/header claims are insufficient: bound received bytes and decoded duration, sniff MIME and verify digest after upload. Never let the client submit an arbitrary URL to be fetched by a worker. Signed capabilities are bearer secrets and excluded from logs.

Keep the existing content/admin/reviewer/relationship endpoints for authoring assignments, qualification and moderation. Specialized audio decisions extend that workflow; they do not grant a second unscoped administrator pathway. A contributor cannot become their own reviewer by calling another route.

## Learner speech and feedback

`POST /speech-submissions` accepts a target **release**, an existing valid purpose-specific consent receipt, duration, MIME, byte count and expected digest. The server derives the learner and checks feature capability before allocating storage. Initial limits: eight seconds and 1 MiB; the capture cap matches current mobile practice, not a new unlimited conversation recorder. Local self-comparison does not call this endpoint.

`POST /speech-submissions/{id}/complete` verifies bytes and enqueues eligible processing. `GET .../{id}` returns an owner-scoped status with expiry and nullable evaluation. Deleting the submission returns a deletion job while immediately blocking new processing/access. A linked human assessor is a specifically authorized assignee under sharing consent; the broad contributor/reviewer role cannot browse child recordings.

The evaluation schema has disjoint alternatives. Assessed output requires `qualified_human` or `validated_model`, rubric and engine versions, reviewed feedback IDs, and applicable uncertainty. `not_assessed` cannot contain a numeric score or `correct` label. At the storage/domain boundary a model result also requires the approved calibration digest. Human uncertainty can be null; do not invent a probability to fill a UI field.

Before displaying model feedback the API rechecks consent, target release, rubric/calibration, quality and subgroup eligibility. A processing timeout, silence, unsupported target or expired consent returns a safe reason and preserves practice without changing mastery. Do not trust an arbitrary provider callback to select a learner, approve content or award correctness.

## Placement and review

`POST /placement/sessions` pins an approved blueprint, requested supported skills and optional heritage self-description. Bank calibration and standard setting are required. A profile cannot use heritage background as an ability prior. Session responses contain the next public task and no answer key or private item parameters.

`POST /placement/sessions/{id}/answers` accepts a unique event ID, exact task version, typed response and help flag. Grade server-side under the session blueprint; check selected item membership and coverage; update the posterior/revision; select the next task or return results. Allowed response variants are choice, ordered reviewed tokens, bounded text, authorized qualified speech, or skip. A client-supplied correct flag/score is rejected. NFC is used carefully without rewriting approved spellings or assuming visually similar characters are equivalent.

Placement results expose per-skill band, posterior median/90% credible bounds, evidence count/date and reviewed recommendation IDs. Null bounds represent insufficient or inaccessible evidence. Validate ordering of bounds and band mass in the domain, not just number types in OpenAPI. A completed placement is not a CEFR certificate or course completion.

Existing `/api/reviews`, question-answer and exposure commands remain the online memory authority. Integrate current published tasks through an application adapter, not a parallel client scoring pipeline. A versioned facade can be proposed later only with compatibility tests. An unsupported speech axis stays unset while eligible reading/vocabulary review proceeds.

## Offline, progress and family operations

`GET /offline/bundles` returns permitted, reviewed signed manifests and download sizes. `GET /offline/revocations` returns a signed bounded list/cursor for release and bundle recalls. Manifest verification, expiry, key rotation, incremental hashes and atomic updates are specified in [offline operations](OFFLINE_AND_OPERATIONS.md). A signed manifest is not entitlement authorization.

`POST /devices` enrolls an authenticated learner's P-256 public key; never upload a private key. Device deletion revokes future synchronization and returns a cleanup job. `POST /sync/events` limits the decoded request to 256 KiB/100 events and verifies the enrolled key over a canonical, versioned envelope. The `sha256` of each event covers the canonical event excluding that digest field; the signature covers the protocol marker, device ID and ordered full event array. Follow the [pinned JCS/JWS ES256 protocol](OFFLINE_AND_OPERATIONS.md#canonical-bytes-and-signatures); publish cross-platform test vectors before client rollout rather than improvising cryptography.

Events are exposure, attempt, scenario turn or playback. Validate a stricter event-specific payload than the common transport schema: an attempt must carry an allowed response; exposure/playback cannot award correctness; a playback needs its unique transport-start ID. Question keys and content hashes resolve through published versions. Server timestamps, receipt status and state revisions are authoritative. Per-event `duplicate`, `conflict`, `deferred`, `provisional`, `rejected` and `accepted` outcomes let the client retry unresolved events without losing its neighbors. Detailed policies are in [OFFLINE_AND_OPERATIONS.md](OFFLINE_AND_OPERATIONS.md).

`GET /progress/me` and verified-guardian `/parents/learners/{id}/progress` return evidence counts and a next step. They do not report universal fluency. Practice seconds remain null when collection is unavailable/not adopted. Existing teacher authorization is preserved; new teacher dashboards require their own scoped contract rather than broadening guardian routes.

Guardian controls use a reviewed policy version and ETag. Setting cloud speech or human sharing true **does not grant consent**; it succeeds only with a valid independently verified receipt for that learner/purpose. Setting false blocks jobs immediately. `optionalAnalytics` stays false for children. Export/deletion create owner-authorized asynchronous jobs with identity/relationship checks at request and delivery; a job ID is not a public download URL. `GET /jobs/{id}/export` streams a completed ZIP through the protected service, rechecking the guardian and fresh authentication. Proposed download window: fifteen minutes after preparation, then regenerate on a new verified request. Use no-store/attachment headers, private expiring storage and no public redirect; revoke access on deletion/relationship loss. The adopted privacy policy determines the export's personal-data scope and raw-media rights. This specification does not enable that account service.

## Scenario sessions and jobs

Start a scenario only from an approved reachable bounded graph whose nodes reference reviewed prompts, responses, feedback, audio and culture versions. Turns bind the displayed node and allowed response under an ETag; never accept arbitrary client `nextNode` or score. The service returns one next node, specific reviewed feedback and evidence counts, or a satisfying completion. A technically valid graph without reviewed dialogue remains unavailable.

`GET /jobs/{id}` reports authorized processing state, not internal stack traces or raw envelopes. Include operational timeout/recovery notices in the client. Completed export, deletion, media decode and speech processing have different business outcomes; the client must fetch the respective protected resource/status rather than interpreting all `done` jobs as successful learning.

## Required contract verification before implementation release

Run a standards-compliant OpenAPI/JSON Schema validator in adoption CI, then generated-client compatibility tests against actual handlers. The local package check only verifies structural references, required properties and operation policy; it is not full OpenAPI conformance. Test anonymous/expired/wrong-audience access, foreign learner IDs, revoked relationships, missing purpose, stale ETags, malformed hashes, conflicting keys, oversized bodies, empty media, unavailable features and concurrent replay. Do not claim these behavior tests passed merely because a contract file parses.
