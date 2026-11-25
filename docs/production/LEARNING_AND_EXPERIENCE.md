# Learning evidence and learner experience

Preserve the two current units and the approved initial learner situation. This plan expands learning systems through reviewed objectives and measured evidence, not by relabelling the current catalogue as a complete course. No new Tigrinya dialogue, translation or cultural fact is invented.

## Review architecture and algorithm choice

Anki is a product with multiple scheduling implementations, including FSRS; it is not a single algorithm. SM-2 is a public baseline. Modern SuperMemo behavior cannot be fully reproduced or ranked from the old public SM-2 formula alone. A custom hybrid has the greatest validation burden. Compare systems by held-out prediction calibration, workload at a comparable observed recall level, accessibility and learner outcomes, not brand or interval length.

| Option | Benefit | Cost/risk | Recommendation |
| --- | --- | --- | --- |
| SM-2 | Transparent, inexpensive, matches the current .NET authority | Ease/interval heuristics are not a calibrated child-Tigrinya forgetting model | Keep `sm2-v1` authoritative for the first production slice; retain a repeatable baseline |
| FSRS | Models difficulty/stability/retrievability; established implementations and tooling | Requires complete versioned state, appropriate history, calibrated interpretation and explicit migration | Prefer the existing pinned FSRS adapter as the next evaluated scheduler, not a second independent rewrite |
| Custom hybrid | Can combine curriculum constraints with scheduling | Unvalidated equations can look sophisticated while worsening workload/recall | Hybridize **queue policy**, not ad hoc memory equations: use reviewed prerequisite/skill/fatigue rules around a pinned memory model |

Algorithm sources: [SM-2 from its author](https://www.super-memory.com/english/ol/sm2.htm), [FSRS maintainer documentation](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm). Formula versions differ; the repository pins `ts-fsrs@6.0.0` and requests FSRS-7. Do not paste FSRS-4.5 equations into an adapter named FSRS-7.

Each state key is `(learner, target content version, skill, task type, variety when relevant)`. Vocabulary recognition, Fidäl reading, listening discrimination, pronunciation and conversation-pattern production have distinct evidence. A single card may share a teaching target but cannot transfer a matching success into a speaking score. Curriculum dependencies describe a sequence; they do not prove capability.

The server is the authority for authenticated scheduling. Publish capabilities with the enabled algorithm and parameter-set identity. Keep a durable unique event ledger and bounded in-memory duplicate cache; do not let the current client `eventIds` array become an indefinitely growing synchronization mechanism. Parameter changes require versioning and a replay/migration decision.

### Scheduling transaction

```text
authenticate learner and load published task/target version
check unique event ID and canonical payload digest
verify allowed response shape and server-grade the task or validated rubric
classify model exposure/help, skill, timing provenance and cold eligibility
append attempt/exposure and an outbox event in the same transaction
lock or concurrency-check the current state
apply the state's pinned memory model only under its evidence policy
commit a due-date/state revision and immutable receipt
```

Preserve the current protection against same-day supported repetitions inflating later recall or intervals. The existing one-day exposure gap is a product rule, not evidence that twenty-four hours is universally sufficient. Review without a response is exposure. A replay after an error provides support; a later response must retain that support context. Server time is authoritative online; uncertain offline timing produces provisional evidence and a cold follow-up, not a calibrated interval jump.

Keep immediate guided retries outside the cold-retention denominator. Assisted/failed items can reappear with useful teaching in the current session, but should not crowd out every other objective. Queue order: prerequisite-ready due material → selected weak evidence within the session budget → introduced/new objective when capacity remains. Cap session length by learner preference and observed fatigue; offer a valid stopping point with no overdue-debt warning.

### State and migration

Preserve current SM-2 fields and due dates. Add a versioned algorithm checkpoint containing parameter digest, complete memory state, source-event range, migration reason and effective time. Backfill exposure/support provenance before evaluating FSRS. Shadow replay uses the same eligible events and target/skill keys; it cannot train on its held-out test period or assume self-ratings equal observed correctness.

Acceptance requires deterministic cross-platform fixtures, no duplicate/lost state under concurrent submissions, recovery from clock rollback, preservation of current due items, measured prediction calibration and a workload comparison at a prespecified retention target. Activate by cohort with rollback; never silently rewrite historical algorithms or historical learning claims. User-facing predicted recall stays absent until locally validated. Data volume alone does not establish validation.

## Evidence and progress levels

Use evidence states rather than a universal percent-mastery badge:

| Level | Evidence | Safe interpretation |
| --- | --- | --- |
| Encountered | Model/meaning was actually presented | Has seen/heard the material |
| Practised with support | Response used picture/script/audio/help | Can participate with the indicated support |
| Independent in this task | Valid response before a model under the task rubric | Demonstrated the specific skill/task once or repeatedly as recorded |
| Recalled later | Eligible independent response after the approved delay | Retained the target under those conditions, with date/count |
| Used in another context | Approved parallel/transfer task and rubric | Evidence of transfer within the observed contexts, not broad fluency |

Numerical level criteria belong in versioned curriculum/rubric records and require educational review. A child can keep practising without a numerical label. The existing API's minimum-five-attempt observed rate is an implementation threshold, not a statistical certificate. Proposed dashboards show counts and uncertainty, with `not enough evidence` rather than an invented score.

Define observed retention as delayed independent correct responses divided by eligible delayed independent attempts, with the delay window and denominator. Define difficulty as model/item/population-specific, with version and uncertainty. Plot a forgetting curve only from a validated model or observed stratified delay bins with enough data; a default exponential curve is not the learner's measured memory. Track requested pronunciation self-confidence separately from a human/model judgement.

## Learner analytics and calendars

The current child optional-analytics prohibition remains. Necessary progress used to deliver learning and a verified caregiver summary requires an adopted lawful service purpose; it does not authorize research export. New study-time/usage measurements need a separate scope/privacy decision before collection. Adult optional analytics remain explicit opt-in. No browser fingerprint, advertising identifier, replay recording or raw learner speech belongs in event analytics.

| Requested measure | Contract and limitation |
| --- | --- |
| Daily streak | Optional adult consecutive eligible local dates; a date qualifies only through an actual completed/practised activity under the policy, not a page open |
| Weekly streak | Optional adult consecutive local ISO weeks with at least one qualifying activity; not seven required daily visits |
| Monthly streak | Optional adult consecutive local calendar months with a qualifying activity; no purchased freezes, penalties or loss alerts |
| Total study time | Foreground active intervals, pauses/background excluded, idle capped; client values are bounded estimates and labelled practice time |
| Mastered words | Replace with evidence counts by sense/version/skill unless the approved mastery rubric is actually satisfied |
| Reading fluency | Qualified reading task with accuracy and timing rubric; matching/tapping and interface response speed are insufficient |
| Listening proficiency | Reviewed listening tasks and coverage; transcript-supported responses do not become unaided listening |
| Pronunciation score | Only validated human/model rubric evidence; absent in self-comparison and unsupported-provider modes |

Freeze the reporting timezone for a period and keep a change history; changing zones cannot fabricate extra eligible days. Preserve event-time uncertainty for offline events. Deletion recomputes aggregates; it does not leave a shadow child profile in an analytics warehouse.

The requested GitHub-style heatmap is an optional adult/authorized caregiver calendar of practice, with text totals, keyboard-operable dates and contrast beyond color. It is not a public contribution graph or leaderboard. Children receive a calm recent-practice summary by default. The trajectory shows evidence over time with assistance/uncertainty; the skill tree shows prerequisites, taught/available/review states, accessible alternatives and a recommended next action. Goal completion uses learner-chosen actions and is independent of linguistic correctness.

## Parent dashboard and safety controls

Verify adult–learner relationships server-side before returning a learner list or details. Token role, shared surname, an email link alone or a child selecting adult presentation cannot establish guardianship. Relationship revocation immediately removes future access and invalidates cached account bundles on reconnection. Teachers need separately verified educational relationships and purpose restrictions.

Dashboard cards: recent taught objectives; practice estimates where collection is permitted; independent versus assisted evidence; useful next shared activity; areas to revisit; strengths with examples; and privacy controls. Do not label the learner lazy, weak, delayed or disordered. If the parent sees a pronunciation judgement, display its evaluator/rubric/date and uncertainty. Do not disclose raw recordings by default; sharing is a distinct authorized purpose with retention and audit controls.

Controls cover optional device saving, local versus cloud speech, service consent, permissions, export/deletion, account relationships and quiet/reduced-motion preferences. A parental gate must use an appropriate adult verification process; simple arithmetic is a UI friction, not legal consent verification. Content/purchase links sit behind the adult boundary. No public child profile, direct messages, advertising, sale of data or personalized child upsell is part of this design.

## Interactive scenarios

Use a reviewed deterministic graph for initial production. Each node references a published native sentence/prompt, available audio, intent/sense IDs and context notes; responses reference reviewed alternatives. Edges are typed conditions, not arbitrary JavaScript or an LLM-authored grading rule. Bound turns, retries and loops; every node must have help, stop, unavailable-audio and safe fallback behavior.

| Scenario | Communication objective | Required review before authoring release |
| --- | --- | --- |
| Family visit | Appropriate greeting, relation/context and turn taking | Native register, family diversity, politeness and contextual alternatives |
| Airport | Follow/ask for routine travel information | Actual reviewed vocabulary and non-guaranteed policy/date context |
| Restaurant | Ask/order/respond and clarify preferences | Region/variety, food context, neutral dietary choices |
| Shopping | Ask/choose/clarify items and amounts | Reviewed numeracy/currency context, no fabricated market norms |
| Taxi | State/clarify a destination and routine request | Reviewed local phrasing and practical safety-sensitive wording |
| Health care | Practise a reviewed communication task | Qualified linguistic/domain review; no diagnosis, treatment, triage or emergency advice generated by the scenario |
| School | Ask/answer a familiar learning or classroom request | Child suitability, role/power context and inclusive examples |

These are curriculum assignments, not authored Tigrinya dialogues. Do not fill missing turns with guessed translations. Reinforce vocabulary by linking encountered sense IDs to later tasks; do not add a conversation success to every word's productive mastery state.

Rules-based graphs give auditable coverage, predictable language and low operating cost. Unconstrained LLM conversations introduce factual/language drift and unpredictable scoring. The later hybrid may map an adult's free response to a bounded intent with an explicit uncertainty/confirmation step, then select approved feedback/branches. It may not invent canonical Tigrinya, change a medical scenario's boundary, or autonomously approve a conversation score. Speech evaluation needs its own supported, calibrated input path.

Server evaluation checks the submitted node/choice against the pinned graph revision, keeps turn bounds, and records only the specific objective/rubric evidence. Exhaustive bounded-path tests must find no orphan nodes, unsafe cycles, unavailable dependencies or dead ends without a stop/recovery path.

## Native contributor governance

Start with vetted adult contributors and explicit payment/licensing terms. Proposed capabilities map to existing roles without automatically expanding their privileges:

| Responsibility | Capability | Separation |
| --- | --- | --- |
| Contributor | Submit a draft or native recording for assigned scope | Cannot approve own work, publish or inspect learner voice |
| Reviewer | Review exact assigned language/audio/teaching/rights/accessibility scopes | Qualification, language/variety scope and conflict checks required |
| Linguist | Maintain target/rubric/variety guidance within qualified scope | An expertise designation, not unrestricted administrative power |
| Moderator | Triage reports, contributor conduct and appeals | Cannot manufacture linguistic approval or silently change content |
| Administrator | Manage assignments, qualifications, publication operations and incidents | Cannot waive required review by granting themselves a role |

Publish scope/rubric standards, reviewer onboarding, calibration samples, conflict-of-interest declarations, compensation policy and an appeal path. Use two independent native audio decisions plus required existing scopes before release. Review disagreements go to documented adjudication; volume/reputation scores cannot automatically approve an asset. New edits invalidate affected approvals. Track reviewer agreement and rework rates to improve guidance, not to penalize legitimate variety differences.

Reports create a case with severity, affected hashes, assigned moderator, response deadline and resolution. Urgent harmful/rights-defective media can be withheld immediately while review proceeds; restore only through recorded approval. Community trust also requires timely fair payment and realistic contributor rights, including the limits of recalling disconnected or previously licensed media.

## Culture across the curriculum

Keep the existing Culture content kind and content links. Add contextual version links rather than a detached completion silo. A lesson, word sense, story segment or scenario node can reference a reviewed culture context with community, perspective, sources, rights, date and age/context suitability.

Traditions, music, food, holidays, proverbs, stories and history enter suitable language objectives. No culture area becomes a test of ethnic/religious belonging. A proverb requires reviewed meaning/use/context, not a literal machine translation. Music needs composition/performance/recording rights; historical or holiday material needs sourcing and context updates. Label perspectives/variation and distinguish a recorded account from a universal norm.

Progression moves from familiar concrete contexts to comparison/explanation and later interpretive language tasks, only as language comprehension permits. Culture recall is separate from language-skill evidence. The release graph checks the culture context and all referenced language/media versions. If a cultural fact or licensed song is unavailable, choose a reviewed alternative instead of inventing an example or blocking unrelated foundation practice.
