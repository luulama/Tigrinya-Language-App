# Pronunciation and placement design

This design extends the existing audio/card/native-recording implementation. The production release unit is a reviewed target and its exact native media, not a generic speech API. Current local review records contain no approved native recordings; no new Tigrinya pronunciation, IPA inventory, translation or model assessment is supplied here.

## Teaching audio and playback

Every Fidäl, word and sentence model resolves through a content-version reference and a reviewed language variety. A standalone form whose reading depends on context requires a reviewed contextual target. The existing sixth-order/context gate stays in force. A missing model produces an explicit unavailable state and a visual alternative, not a nonfunctional speaker icon or an Amharic fallback.

| Capability | Production behavior | Acceptance condition |
| --- | --- | --- |
| Tap to hear | One named button beside the exact script/meaning; no automatic page-load playback | Approved recording/hash/variety resolves; user gesture starts audio or a retryable error appears |
| Normal playback | Serve reviewed normal-speed rendition | Exact target version and byte hash are retained in the exposure event |
| Slow playback | Prefer separately recorded reviewed slow speech; otherwise tested pitch-preserving local playback at the labelled rate | No claim that time stretching is a second native recording; normal replay/transcript remains usable |
| Repeat mode | User-selected repeats, default off, bounded to three plays before another choice; Stop always available | Cancels on navigation/background/audio-focus loss and never increments recall evidence |
| Waveform | Precomputed peaks for native media; local peaks for a learner clip; static fallback | Label as sound level over time; no similarity-as-pronunciation score; text controls remain sufficient |
| Sentence playback | Whole sentence plus only reviewed, versioned segment timings | No character-count-derived timings or unreviewed forced alignment |
| Word playback | Sense-specific model and contextual meaning | Homographs/varieties are not merged by normalized display text |
| Fidäl playback | Reviewed syllable/context audio linked to family/order metadata | Tigrinya left-to-right rendering, verified scope and no Latin-letter-name substitution |

The player state machine is `unavailable → ready → buffering → playing ↔ paused → ended`, with `error` recoverable through explicit retry. Only `playing` after actual transport start creates a model exposure. A planned tap, fetch success or failed decode is not a listen. Buffering and repeated callbacks cannot double-count one playback ID. Pause freezes the cursor; Stop ends repeat mode and releases resources.

Audio visualization remains optional. Its canvas/SVG must not receive keyboard focus ahead of controls or announce every frame. Expose a readable elapsed/duration value, transcript and named Play/Pause/Stop/Normal/Slow controls. Reduced motion uses a still waveform and progress text. A transcript shown during an assessment changes the assistance record and the skill interpretation; it is not secretly treated as unaided listening.

## Recording catalogue and contributor pipeline

Use a private, adult contributor workflow first. The metadata model comprises:

- **Speaker:** internal pseudonymous ID, public display preference, privately stored contact/rights evidence, adult eligibility attestation, qualifications/variety experience and withdrawal contact. Do not expose legal identity, exact birth date or home location to learners.
- **LanguageVariety:** Tigrinya tag, community-reviewed name, contextual/region notes and provenance. Nation, script or browser locale does not determine a learner's preferred variety.
- **Recording:** immutable target content version, reviewed transcript/context, normal/native-slow designation, speaker, variety, original and normalized master digests, rights grant, technical QA status and publication state.
- **Rendition:** codec, sample rate, channels, duration, byte count, object key, served digest, encoder/configuration version, waveform digest and optional verified alignment revision.
- **Decision:** qualified reviewer, scope, target digest, rationale, conflict-of-interest check, timestamp and superseded decision reference. An administrator role alone does not supply native qualification.

Pipeline:

1. Authenticate contributor capability; verify rights/consent and a specific target revision. Allocate a server-generated quarantine key and a ten-minute scoped upload capability. Maximum initial model upload: 20 MiB and 60 seconds. These are proposed service limits, separately versioned from the mobile learner recorder's current eight-second cap.
2. Complete the upload with idempotency key and expected digest. The API verifies object existence/size and writes a job plus transactional outbox entry. Upload success is not approval.
3. An isolated worker sniffs the container, bounds decoding resources, strips unneeded metadata and retains a rights-cleared lossless master. Preferred contributor capture is mono 48 kHz/24-bit PCM; supported compressed input can be decoded but is never advertised as original lossless capture.
4. Produce iOS/browser-compatible AAC-LC/MP4 delivery, initially 96 kbit/s mono; provide an independently tested alternative where needed. Preserve originals, encoder version, output hashes and audible QA. A 48 kbit/s Opus option is a measured optimization, not an assumed universal-device fallback.
5. Compute technical measurements and route uncertain cases to review. Candidate mastering presets are approximately −16 LUFS with true peak at or below −1 dBTP. Noise/clipping estimates flag re-recording needs; they are not language-quality or pronunciation judgements and require corpus-specific tuning.
6. Obtain the existing Language, Teaching, Rights, Accessibility and Audio scopes, plus **two independent qualified native audio decisions** for the exact served rendition/target/variety. This quorum extends the current generic one-qualified-decision-per-scope workflow and must be implemented before claiming it exists. An author cannot review their own material. A rejecting or unresolved conflicting decision prevents release.
7. Publish a signed manifest referencing approved immutable hashes, with attribution and expiry/revocation policy. Only approved licensed teaching media reaches delivery storage/CDN. Draft audio, review evidence and learner voice never enter that namespace.

Any transcript, target, variety, rights, normalization or served-byte change invalidates the affected approval digest. Create a new revision, preserve history and re-review the affected scope. A technically identical reupload can be deduplicated by digest, but rights and target approval are still checked. Withdrawal creates a revocation/takedown event, purges current delivery and updates manifests; already disconnected copies cannot be recalled instantly. Licence terms, contributor promises and cache leases must reflect that limit.

## Learner recording and comparison

The MVP default is **local self-comparison**: listen to an approved target, optionally record up to eight seconds, listen to both, choose to retry or continue, and discard the clip. The current native `PrivateVoicePlugin.swift` and browser card fallback provide the implementation starting point. No cloud upload, automatic grade, voiceprint, training consent or teacher sharing is implied by microphone permission.

A later cloud/human evaluation is a separate explicit action. The API checks learner identity, appropriate guardian relationship/consent where required, purpose, target/version availability and provider eligibility before allocating an upload. Denial leaves local practice available. Explain recipient, retention and deletion before upload, in language appropriate to the learner/adult.

Proposed retention defaults requiring legal/product adoption: local clips disappear on continue/navigation/background; an explicitly uploaded evaluation recording expires within 24 hours after completion and within 48 hours even if a job fails; derived private rubric feedback is retained for at most 90 days unless the owner adopts a documented necessary service policy. Do not copy temporary speech into long-lived backups, logs or model-training corpora. Deletion/consent withdrawal must cancel pending work and make provider callbacks unable to recreate the result.

## Feedback engine

An evaluation job moves through `accepted → validating → queued → evaluating → completed`, or ends `abstained`, `failed`, `cancelled`, `expired` or `superseded`. Provider timeout, missing model, noise, language uncertainty, unsupported variety, changed target or invalid consent returns a reasoned non-score. It must never become `Needs improvement` by default.

| Result | Required basis | Learner response |
| --- | --- | --- |
| Correct | Qualified human rubric, or calibrated eligible automatic evaluation meeting its confidence/error gate | Name the achieved target feature; offer another context or later recall |
| Close | Same valid evaluation basis with a specific, reviewed teachable contrast | Demonstrate one contrast and allow retry, without presenting a whole accent as deficient |
| Needs improvement | Sufficient usable evidence of the taught contrast under the approved rubric | Replay the relevant model, narrow the task and offer help/continue |
| Not assessed | Any abstention, unsupported feature, self-reflection or unavailable evaluation | Explain what is available, retain practice, and avoid a mastery update |

Store evidence source (`self`, `qualified_human`, `validated_model`), rubric/calibration/engine versions and uncertainty separately. Self-confidence (`not_sure`, `somewhat_sure`, `sure`) is a learner reflection, not correctness. A model confidence is a calibrated decision uncertainty, not a fluency percentage. A difficulty measure is task-specific expected error/workload with its population/date, not a diagnosis of the child.

No score is derived from waveform overlap, transcript edit distance alone, speaking volume or resemblance to one speaker's pitch. Evaluate only reviewed intelligibility/contrast dimensions appropriate to Tigrinya and the stated variety. Existing visible /b/, /m/, /f/ component diagrams do not provide a complete Tigrinya phone inventory or validated acoustic scorer. Do not invent articulation instructions for unverified sounds.

## Provider comparison and build versus buy

Checked 25 November 2026. Provider capability is feature-specific; language appearance elsewhere in a catalogue is insufficient.

| Approach | Useful capability | Tigrinya and accuracy risk | Cost/scaling and decision |
| --- | --- | --- | --- |
| Azure Speech/Pronunciation Assessment | Managed speech transport and assessment for listed locales | Tigrinya is absent from the documented pronunciation-assessment locale table. A translation target named Tigrinya does not establish Tigrinya input/phonetic assessment | Region/offer-specific rates; operationally managed. Keep scoring adapter disabled unless supported capability and our native benchmark are established |
| OpenAI Realtime | Low-latency speech interaction, interruption handling and tool orchestration | No verified calibrated child-Tigrinya pronunciation rubric is established by general voice capabilities. Model-generated encouragement or recognized text is not phonetic evidence | Buy transport/reasoning only for a later bounded, consented experiment; cap duration/tokens/concurrency; no open child voice agent at MVP |
| Hosted `whisper-1` | Transcription of supported speech | The public Whisper tokenizer language list does not include Tigrinya. Hosted `whisper-1` is deprecated. Do not substitute Amharic or infer phoneme quality from transcript agreement | Listed $0.006/min is a legacy comparison, not the recommended production dependency |
| Self-hosted Whisper or another licensed ASR | Controlled infrastructure and possible adult-corpus research | Generic weights are not proof of Tigrinya/child/dialect accuracy. Fine-tuning needs licensed data, held-out evaluation and sustained ML operations | GPU-hours, utilization, engineering, security patching and evaluation dominate; no claim that open source makes operation free |
| Hybrid native model + rules + human review | Accurate teaching models, bounded known tasks, explicit human rubrics, selective later automation | Native reviewer capacity and agreement are the bottleneck; automate only validated dimensions | **Recommended.** Build target/approval/evidence/privacy logic; buy commodity storage/CDN/identity and eligible speech processing later |

Sources: [Azure language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=pronunciation-assessment), [OpenAI voice model](https://developers.openai.com/api/docs/models/gpt-realtime-2.1), [Whisper languages](https://github.com/openai/whisper/blob/main/whisper/tokenizer.py), [Whisper model status](https://developers.openai.com/api/docs/models/whisper-1). No provider was called with learner speech and no measured accuracy ranking is claimed.

### Automation release gate

Require explicit locale/feature support or an owner-approved research route, commercial/data-processing rights, consent/retention controls, a reviewed Tigrinya target/rubric corpus and a held-out native-rated benchmark. Separate speakers/items across training, calibration and test. Include intended ages, relevant varieties, microphones/noise and access needs; an adult-only result cannot approve a child feature.

Use agreement/adjudication to assess the human reference itself. Track false correction of acceptable speech, false acceptance of misunderstood speech, useful-feedback accuracy, latency and abstention. Proposed gates: the one-sided 95% upper bounds for false correction and false acceptance must each be at most 5% within supported evaluation groups, with abstention disclosed. These are product risk limits to validate, not results already achieved. Sample size follows the risk/power design; zero errors in twenty independent cases still gives a one-sided upper bound of about 13.9%, not evidence of a 5% ceiling. Speaker-correlated clips require clustered analysis.

Only then fit rubric thresholds to `Correct`/`Close`/`Needs improvement`. Preserve an abstention region, monitor drift and roll back a version when the gate fails. Never let an LLM invent its own thresholds at request time. Speaking streaks, levels and self-confidence stay separate from validated assessment; optional adult calendars cannot compensate for unsupported feedback.

## Placement model and UX

Represent background and ability separately. `heritage_background` is optional self-description and never an ability prior or a fourth proficiency rank. A heritage learner may be an absolute beginner in reading and advanced in some oral tasks. Record a skill profile for reading, listening, speaking and vocabulary. Writing/input support can inform route accessibility without being conflated with language knowledge.

Use local course bands `absolute_beginner`, `intermediate`, `advanced`, plus `insufficient_evidence`. These are not CEFR certificates. Each published assessment blueprint requires native-reviewed tasks, calibrated item parameters, a standard-setting record, skill coverage, rubric versions and validated band boundaries. Missing calibration leaves placement unavailable/provisional; it must not activate arbitrary numeric thresholds.

For a calibrated item bank, use Bayesian item-response scoring independently per skill. The versioned model defines a grid or equivalent validated numerical method over ability θ, a prior independent of heritage identity, discrimination a, difficulty b and a justified guessing term c where appropriate:

```text
p(correct | θ, item) = c + (1 − c) × sigmoid(a × (θ − b))
log posterior_new(θ) = log posterior_old(θ)
                       + y × log p + (1 − y) × log(1 − p)
normalize with log-sum-exp
```

Use numeric clamping only for stable computation, not to manufacture certainty. Derive the median, central 90% **credible interval**, and posterior mass within approved course-band boundaries. This is Bayesian uncertainty, not a frequentist confidence interval. Validate numerical grid limits/resolution and recalibrate with new item versions. Do not claim that a uniform correct-rate posterior estimates ability across adaptively selected unequal items.

Select the next eligible item by expected posterior entropy reduction subject to blueprint coverage, no repeated/exposed item, reviewed prerequisite context, accessibility constraints and fatigue budget. Speaking uses a qualified rubric or a validated evaluator; a recognition multiple choice cannot fill the speaking axis. Missing microphone evidence leaves that axis unset.

Split the assessment into short optional blocks. Proposed operational cap: six scored tasks per block and no more than twenty-four across the first placement, subject to observed child usability. Stop a skill only after its approved coverage and calibrated uncertainty criterion are met, or return `insufficient_evidence` at the cap. Exact posterior-band/interval thresholds are part of the published standard-setting record, not guessed from the interface.

Do not count assisted/exposed responses as cold placement. Explain unfamiliar tasks without revealing the answer; skipped/no-device tasks are not automatically wrong. Results show a recommended starting step, evidence date and uncertain/missing areas. The learner can choose foundations regardless of placement. Propose an alternate-form retest after two weeks of new learning or on request when enough new evidence exists; do not reuse the same remembered items or overwrite prior results without history.

API/data handoff: AssessmentBlueprint → calibrated PlacementItem versions → PlacementSession → immutable responses → PlacementResult with background, skill posteriors, coverage, uncertainties and recommendations. Server-side scoring pins the blueprint/model; a newer model does not silently rewrite a learner's historical placement.
