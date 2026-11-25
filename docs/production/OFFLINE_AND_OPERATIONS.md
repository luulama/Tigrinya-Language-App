# Offline delivery security and operations

This is a target architecture for reviewed production content and future account synchronization. Keep the existing standalone/mobile preview and current in-tab/opt-in device saving intact. No database, cloud worker, analytics collector or provider is activated by this package.

## Download model and asset versioning

Use a signed immutable manifest per course/lesson/story/audio bundle. Fields include bundle ID/version, content-version references, language/variety, supported client/schema versions, issued/expiry times, dependency graph, total size, each object's SHA-256/byte count/MIME, exact approval/rights digests and a signing-key ID. Bundle creation traverses the full publication graph: an approved lesson cannot smuggle in an unapproved image, cultural note, sentence, audio segment or teacher stroke.

Use short safe filenames/object keys derived from immutable IDs/hashes. Teaching audio/CDN objects contain no child identifiers, tokens or private speaker evidence. Do not cache draft review URLs or authenticated profile responses in the existing broad `/preview/` cache. A future account cache must have its own explicit scope and migration; current offline practice does not imply account sync.

Download process:

1. Show size, offline scope, storage status and a meaningful cancel action before starting.
2. Obtain manifest and verify its signature, supported schema, current release/entitlement and rights lease. Use the pinned JCS/JWS ES256 protocol below and an explicit trust-key rotation process.
3. Compare hashes against the local object inventory; download only missing/changed objects to staging. Bound parallel transfers and total disk use. Resume only with verified range/ETag support.
4. Verify every digest/size and all dependencies before atomically switching the active manifest pointer. Interrupted or corrupt downloads cannot replace a usable bundle.
5. Retain older objects while an active session references them, then collect unreferenced **generated content cache**. Never delete learner work to make room without its defined policy and notice.

Incremental updates operate on immutable object hashes, not partial edits of a JSON lesson payload. A changed target or audio recording creates a new version and explicit evidence migration decision. Learners receive a clear update/retry state; cached progress is not erased because a download failed.

### Canonical bytes and signatures

Proposed protocol v1 uses UTF-8 JSON Canonicalization Scheme (JCS), detached-payload JWS compact serialization, and only JOSE `ES256` (P-256/SHA-256). The protected header contains `alg`, a registered `kid`, and a purpose-specific `typ`. Accept no `none`, algorithm negotiation, untrusted remote key URL or unsupported critical header. JWS encodes the 64-byte R||S signature, not an ASN.1 DER signature. Use maintained platform/JOSE libraries; these documents supply no cryptographic implementation. [JCS RFC 8785](https://www.rfc-editor.org/rfc/rfc8785), [JWS RFC 7515](https://www.rfc-editor.org/rfc/rfc7515), [ES256 RFC 7518](https://www.rfc-editor.org/rfc/rfc7518)

For a bundle/revocation list, sign its canonical full payload excluding the external `signature` field; `typ` distinguishes `tigrinya.bundle.v1` from `tigrinya.revocations.v1`. Signing keys belong to the publication service, with public keys distributed through a trusted pinned/rotatable key set. A manifest cannot introduce its own trusted key. Check signed expiry, schema, digest and purpose before activating anything.

For sync, each event digest covers JCS of that event with `sha256` omitted. Sign JCS of `{protocol:"tigrinya.sync.v1",deviceId,events}` with `typ:"tigrinya.sync.v1"`, the enrolled device key and its registered key ID. The transport `signature` field contains the detached compact JWS; reconstruct the base64url payload for verification. Authentication/relationship/consent checks still apply. Hash the original canonical values without extra Unicode normalization; normalize only the explicitly approved text-input boundary before constructing an event. Reject duplicate object keys, nonfinite numbers, invalid Unicode, unknown versions and over-limit envelopes.

Rotation must support a bounded overlap for valid old offline leases, an emergency signed key revocation, and tests for expired/unknown keys. Implementations need shared browser/.NET/iOS test vectors for property order, numbers, Ethiopic Unicode, signature encoding, tampering and wrong-purpose replay before rollout. Passing this package's SQL/structural checks does not verify signatures or provision real keys.

## Offline leases and revocation

Disconnected clients cannot know about immediate takedowns. Proposed policy: a maximum thirty-day offline lease for approved ordinary educational packs, shorter where rights/safety require it, with revocation checked on every connection and before a new download. The lease is an owner/legal decision to adopt, not an existing preview behavior or a guarantee of immediate erasure.

Critical recalls stop new delivery immediately, purge CDN/origin access, cancel queued distribution and enter a signed revocation list. Clients remove affected playback/download eligibility when they next receive that list. Expired/uncertain leases request an update while preserving the learner's history. Keep the last trusted server time and elapsed-time anchors; clock rollback cannot extend a signed lease. A rightsholder agreement must not promise instantaneous removal from all disconnected devices.

Public, rights-cleared teaching audio may be broadly cacheable. Premium entitlement or private study data requires a separate account boundary, short-lived authorization and an explicitly designed offline entitlement lease. A signed manifest alone is not authentication or confidentiality.

## Offline progress and conflict resolution

Use append-only typed practice events, not a mutable uploaded copy of the entire learner profile. Each event carries a UUID, device enrollment ID, session/stream ID and sequence, content/task/rubric version, permitted response, model/help flags, client time and canonical payload digest. The server adds receipt time and authoritative grading/provenance. No raw voice, free transcript or arbitrary analytics payload is accepted by the ordinary progress outbox.

An authenticated device enrollment binds a public key to the actual account. Native private keys use appropriate Keychain protection; browser nonextractable keys reduce accidental exposure but do not defeat same-origin XSS or prove honest activity. Device signatures protect transport provenance, not pronunciation correctness or child consent. Store browser account outboxes only after explicit adoption/consent, encrypted where appropriate, and purge account keys/cache on logout or relationship revocation. Do not retroactively attach anonymous preview history to a newly signed-in child account without an explicit, reviewed migration.

Batch limit: initially at most 100 events and 256 KiB, with cursor receipts and per-principal/device rate limits. Process each event in its own idempotent transaction and return per-event status; a recoverable bad item must not silently discard accepted neighboring events. Retry only unresolved events with exponential backoff/jitter and a bounded retry budget. The UI distinguishes `saved on this device`, `waiting to sync` and `confirmed by service`.

| Conflict | Server decision | Client recovery |
| --- | --- | --- |
| Same event ID and digest | Return original receipt; no new grade, interval or billable job | Mark acknowledged |
| Same event ID, different digest | Conflict; retain audit metadata without raw sensitive content | Show recoverable sync issue; do not overwrite the existing event |
| Out-of-order exposure/attempt | Retain stream dependency and defer eligibility or mark provisional | Retry the missing predecessor; do not inflate recall |
| Old target version | Keep historical reference; reject new authoritative grading unless a reviewed equivalence migration allows it | Fetch current content and offer a fresh task |
| Client clock rollback/large skew | Use bounded timing provenance; withhold delayed-evidence claims | Preserve practice and request an online cold follow-up |
| Revoked relationship/consent/device | Deny future protected sync, cancel related jobs, apply deletion policy | Clear protected cache/outbox as required; keep account-free practice available |
| Two devices update one target | Serialize/replay accepted events under the same pinned algorithm; use concurrency tokens | Accept authoritative new state; never last-write-win a mastery JSON blob |

Offline answer keys or local models are inspectable by the client. Offline feedback can therefore support learning, but cannot prove high-stakes unaided performance. Recompute permitted correctness server-side where possible and retain provisional provenance; a later live cold/parallel task is needed before stronger mastery claims. Never trust uploaded `correct`, `mastery`, `dueAt` or arbitrary study-time totals.

## Consent purpose and deletion

Separate service identity/progress, optional voice evaluation, human sharing, contributor publication and research/training purposes. A microphone permission is not permission for any of those cloud uses. Denying optional processing does not remove core practice. A parent/teacher role does not imply a verified relationship or unlimited access to another learner.

COPPA-covered child services require an appropriate notice/consent/access/deletion process; new rule requirements constrain sharing and indefinite retention. EU child-consent thresholds depend on Member State where that consent basis applies. Do not infer country, age, guardianship or legal basis from a display preference. Complete a jurisdictional data map/DPIA and provider/processor review before child cloud features. These are release requirements for qualified review, not a statement that this blueprint itself establishes legal compliance. [FTC update](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data), [EU guidance](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data/are-there-any-specific-safeguards-data-about-children_en)

Raw voice is restricted personal data; do not build voiceprints or identity recognition. Legal classification of biometric processing depends on purpose/context and requires review. No learner recording is reused for model training by default. A future licensed research corpus uses a separate adult contributor recruitment/rights process, not a buried learner checkbox.

Deletion is a workflow: authorize requester and relationship → freeze new processing → tombstone account/media/jobs → revoke private access → delete primary speech/results/outboxes as required → notify processors and remove eligible derived data → record a non-content audit receipt → reconcile restores. Race tests must show that delayed callbacks cannot resurrect deleted recordings or progress. Document backup erasure/restore limits and restricted retention. Temporary learner audio should not enter ordinary archival backup policies; never promise deletion while silently retaining long-lived blob versions.

## Security controls and trust boundaries

| Boundary | Required control |
| --- | --- |
| Browser/native to API | TLS, validated issuer/audience/scope, principal-scoped queries, exact CORS policy, CSRF handling appropriate to actual auth transport |
| Parent/teacher to learner data | Verified relationship plus role/purpose on each request; authorized-list enumeration; consistent denial semantics |
| Contributor to review/publish | Capability and qualification scope, exact digest/ETag, author independence, quorum and auditable reason |
| Upload to decoder | Server-generated key, scoped short-lived upload capability, format sniffing, size/duration/resource limits, sandboxed decoder without arbitrary network access |
| Worker to vendor | Capability/consent/version check immediately before call, managed secret access, bounded duration/concurrency/budget, circuit breaker and redacted logs |
| Draft/private to delivery | Physically/logically separate private storage and identity; no accidental public CDN/cache headers |
| Application to database | Runtime/migration identities separated; bound queries, least privilege, explicit tenant/subject scope, concurrency and uniqueness constraints |
| Logs/support tooling | No raw learner text/audio, token, SAS URL, request body or child identifier in operational telemetry; least-privilege support and audited emergency access |

Do not introduce a client-provided remote media fetch endpoint, unrestricted upload callback URL, public storage key, broad production CORS wildcard or database password in an app bundle. Restrict callback destinations to registered provider integrations. Normalize text deliberately with NFC while preserving the approved Ethiopic spelling; do not equate script sharing with language equivalence.

The current repository's Azure manual deployment/OIDC separation remains. This plan does not run Terraform, create accounts, provision a database, select a real tenant/region or spend on APIs. Secrets and local identity files stay excluded from Git. No unrelated active IDE project's `.env.local` is a source for this platform.

## Worker reliability and delivery

Use a PostgreSQL transactional outbox initially, with a separately runnable .NET worker/container. Poll/claim with bounded leases and concurrency; each job has a unique business idempotency key, input hashes and processor version. Commit output metadata before acknowledging. Lease expiry permits safe retry; a repeated decode/provider callback cannot publish twice or create duplicate attempts.

After five failed retryable attempts, dead-letter the job and surface an operator/learner recovery path. Nonretryable validation/consent/language errors abstain immediately. Do not retry a billable provider call blindly if its result is uncertain; retain provider request IDs, use supported idempotency and reconcile before another charge. Queue waiting/timeout is not a learner failure.

Adopt Service Bus or another managed queue only when measured throughput/operations justify it; preserve the same outbox/idempotency contracts. Add media workers independently of the interactive API so a malformed file or vendor outage cannot exhaust lesson/navigation capacity.

## Availability backup and incidents

Proposed first-release targets: 99.5% API availability during the declared service window; p95 non-media API response below 300 ms at the accepted load; cached playback start below 500 ms on the tested device/network matrix; published-media processing outcomes observable within their queue SLA. These are engineering targets to measure, not current production results or promises covering third-party outages.

Use readiness separate from liveness, budget-based alerts, dependency circuit breakers, database connection-pool ceilings and per-learner/provider caps. A provider outage leaves approved native models and local practice usable. Never pretend a failed protected write was saved.

Define database restore targets such as RPO 15 minutes/RTO four hours only after the chosen Azure configuration and restore drills support them. Run isolated restore/deletion-reconciliation exercises before launch and at least quarterly thereafter. Retain no raw child recordings in a general-purpose test restore. Backups are encrypted/restricted and have a declared expiry, not indefinite protection from deletion requests.

Incidents include harmful language/media, privacy exposure, authorization failure, scoring bias, runaway vendor cost and unavailable learning. Give each a named owner/severity, immediate containment/rollback, user/support communication and legal review where required. Critical media/score recalls revoke affected versions; privacy incidents suspend processing and revoke private access. Do not solve outages by disabling authentication, review gates or consent checks.
