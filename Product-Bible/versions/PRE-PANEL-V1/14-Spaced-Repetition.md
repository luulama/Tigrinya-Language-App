# 14 — Spaced Repetition and Learning Evidence

**Version:** DRAFT_V1 — complete specification for whole-Bible review  
**Date:** 20 November 2026  
**Authority:** [Vision FINAL_V1](01-Vision.md), approved and unchanged. All other sections are working specifications awaiting owner approval.  
**Primary dependencies:** Sections 02–13, particularly 04 milestones, 06 nodes, 07 task conditions and modality-specific evidence; forward contracts to 15 lineage and 18 pilot.  
**Context:** All existing sections 01–13 read before this section was written. Later references are forward contracts reconciled in the whole-Bible review.  
**Evidence:** [Learning model and research](02-How-Humans-Learn.md); [source register](RESEARCH-REGISTER.md). Numerical targets, budgets, and thresholds below are design hypotheses unless explicitly sourced. No new Tigrinya teaching content or native approval is supplied.

## 1. The system's responsibility

Recommend useful revisiting, preserve honest evidence, and make returning manageable. Scheduling alone cannot establish meaning, supply native models, assess open speech, or create fluency. “Industry-leading” is an aspiration for validity, usability, privacy, and operations—not a proven ranking against other products.

The [L2 spacing meta-analysis](https://onlinelibrary.wiley.com/doi/abs/10.1111/lang.12479) supports distributed practice while identifying schedule/context variation. It does not prescribe this product's interval sequence. Section 02 and the [2026 classroom synthesis](https://link.springer.com/article/10.1007/s10648-026-10225-5) support testing actual task conditions rather than assuming every spaced quiz creates transfer.

## 2. Separate three layers

| Layer | Responsibility | Must not do |
| --- | --- | --- |
| Evidence interpreter | Determine what an event demonstrates under its support and task conditions. | Treat any correct tap as independent retention. |
| Memory scheduler | Maintain model-specific state and recommend due opportunities. | Declare a learner fluent or override content gates. |
| Session planner | Choose a small feasible set from valid due/new/support options. | Force the learner to clear a backlog or expose unavailable content. |

The same content can have separate targets for reading, listening, meaning, writing, or speech. Key state by learner context, language, objective, content revision/equivalence lineage, skill, and memory-model version. Do not schedule a bare word string independent of its sense and task.

## 3. Coverage by learning object

| Object | Useful review unit | Appropriate task | Invalid shortcut |
| --- | --- | --- | --- |
| Word | Reviewed sense and specific skill. | Interpret/read/retrieve under stated cues. | One pictured selection upgrades every modality. |
| Phrase | Communicative purpose and relevant form. | Use or interpret in an appropriate changed situation. | Repeating a displayed translation proves free expression. |
| Sentence | Reviewed pattern–meaning relation. | Interpret or adapt a controlled detail. | Memorising one sentence proves generative grammar. |
| Story | Objective-bearing segment or connected criterion. | Interpret sequence/reference or retell with support labelled. | Every playback counts as independent word retrieval. |
| Pronunciation | Reviewed target and qualified criterion. | Modelled attempt, later human/validated assessment. | ASR confidence is pronunciation truth. |
| Grammar | Pattern, sense/function, and context. | Choose/use a relation under controlled variation. | Stating a rule proves spontaneous use. |
| Conversation | Purpose, contingent contribution, and repair criterion. | Responsive human/validated task. | Script replay proves interaction. |
| Listening | Audio-linked meaning/criterion. | Respond before answer-revealing transcript. | Reading a caption is listening evidence. |
| Writing | Form/spelling/composition criterion and input mode. | Appropriate production or human rubric. | Tracing score is independent writing. |

## 4. Event contract and eligibility

Record only necessary evidence under explicit saving scope. Conceptually an event includes stable ID, task/encounter ID, target and revision, skill, server time, first response, grading authority/version, support, model exposure, retry lineage, and relevant access conditions. Answer content or recordings are not automatically analytics data.

**Proposed eligibility policy EVIDENCE_V1:**

1. The released target, model, and task are valid and available; prerequisites make the inference fair.
2. The event is the first committed response in that encounter, not a duplicate or correction retry.
3. No answer-revealing instructional help occurred before the response. Access accommodations are described separately and may remain available.
4. A prior teaching/exposure history exists for learned-retention claims. A first-ever unmodelled success can inform placement/baseline, not retention of app teaching.
5. For a delayed event, at least 24 elapsed hours have passed since the latest relevant exposure or attempt. Any intervening target model resets that interval. This threshold is a product convention to test, not a biological memory boundary.
6. Time is monotonic in the authoritative event record; time-zone/calendar changes do not convert minutes into a day. A corrupt future timestamp is rejected or quarantined, not used to create permanent due dates.

A no-help response soon after a model is an independent-looking practice action, not delayed retention evidence. A correct retry after feedback remains supported. Missing media, interrupted delivery, refusal, and inaccessible input are unassessed operational conditions. Delayed incorrect first responses remain in the eligible denominator; hiding them would inflate observed retention.

## 5. Mastery evidence bands

| Band | Meaning | Evidence rule |
| --- | --- | --- |
| M0 | Encountered / not yet assessed. | Exposure or no interpretable observation. |
| M1 | Supported practice. | Response with relevant model/help; correction and retries stay here. |
| M2 | Independent criterion demonstration. | A valid response/rubric criterion before answer help, with conditions retained. |
| M3 | Retained and suitably generalised criterion evidence. | Proposed pilot rule: three eligible independent successes across three opportunities separated by at least 24 hours, including one after at least 7 elapsed days without relevant exposure and one reviewer-approved parallel-task success. One event may satisfy both delayed and parallel conditions. |

M3 is a conservative **operational hypothesis**, not a research-established mastery threshold. Required coverage and rubric criteria are set per objective; open writing/speaking need qualified judgments rather than choice scoring. A consequential stage checkpoint must not rely on unpiloted thresholds. Unknown or unavailable evidence remains unknown.

Later difficulty prompts a fresh support/review recommendation while preserving the earlier dated record. Do not erase genuine achievement or present M3 as permanent memory. A critical content correction can suspend the affected inference through documented lineage rather than penalise the learner.

## 6. Algorithm choice and existing implementation

The current API uses `sm2-v1`; the shared TypeScript package also contains a real FSRS adapter. They are not interchangeable labels. The proposed target keeps SM-2 as the initial transparent scheduling baseline, with FSRS adoption a separate evaluated migration. No code changes are authorised by writing this section.

The [original SM-2 description](https://www.super-memory.com/english/ol/sm2.htm) supplies the algorithmic reference. The [FSRS project documentation](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm) describes its model; software documentation is not evidence of validated Tigrinya child outcomes.

For the current baseline: initial ease is 2.5; successful due repetitions use intervals of 1 day, 6 days, then rounded previous interval × previous ease; ease has a 1.3 lower bound. The quality update uses `EF' = max(1.3, EF + 0.1 - (5-q)*(0.08 + (5-q)*0.02))`. The application maps accepted successful outcomes to q=3/4/5; incorrect/assisted practice returns to a short interval and resets repetition count. This is a product-adapted implementation, not an exact claim that every SM-2 rule is unchanged.

For future valid human/automatic grading, correctness comes from an approved key/rubric, not the learner's confidence selection. A confidence/ease choice may refine scheduling only after valid grading; it cannot turn an incorrect response into success. Do not expose adult grading scales to young children unless they are understandable and necessary.

## 7. Worked scheduling trace

Assume a valid target, authorised saving, successful due events graded q=4, initial ease 2.5, and no relevant intervening model. The example tests mechanics, not expected human memory.

| Relative time | Event | Interpretation / scheduling result |
| --- | --- | --- |
| Day 0 | Model then guided correct response. | M1; no independent/delayed success. Near-term practice/revisit. |
| Day 1, after full 24 hours | Eligible first response correct. | M2; first successful due interval 1 day. |
| Day 2, after full 24 hours | Eligible first response correct. | Second successful due interval 6 days. |
| Day 8 | Eligible first response correct. | Third interval round(6×2.5)=15 days; gap is 6 days, so the M3 7-day condition is not yet satisfied. |
| Day 23 | Eligible parallel response correct after no intervening exposure. | 15-day delayed and parallel evidence may now satisfy those M3 conditions if all objective criteria are met. |
| Any day | Model/help then correct retry. | Supported practice; never added as an eligible delayed success. |
| Any due opportunity | Eligible first response incorrect, then correction. | Keep incorrect denominator; model, supported retry, short revisit; no shame/reset of unrelated skills. |

Early familiar practice should not extend due intervals or inflate delayed evidence. Overdue review uses actual elapsed time and caps/plausibility checks; missing a day is not a failed answer.

## 8. Session selection policy

Filter for published valid revisions, assets present, prerequisites appropriate, and access compatibility before ranking. Select a small mix of useful due targets, needed support, and appropriate new material. The initial hypothesis is at most three target objectives in a short child session, not a universal attention limit; the learner can stop earlier.

Fairness rules prevent one repeatedly difficult item dominating every visit. Offer a refreshed model, an equivalent suitable task, another target, or stop. A learner can choose familiar practice without manufacturing new mastery evidence. Due dates remain recommendations, not red alerts.

The current implementation's due-first recommendation is a starting behaviour, not the complete target planner. Mixed pedagogical planning, M3 criterion evaluation, and qualified open-response grading require future work after the documentation gate.

## 9. State, retries, and synchronisation

Grade and commit once using event ID plus request fingerprint. The same ID/same payload returns the prior result; same ID/changed payload is a conflict. Update evidence and scheduling atomically with concurrency protection. Never let two tabs award two independent responses for the same encounter.

Offline authenticated progress synchronisation is not currently implemented. A future outbox needs explicit opt-in, bounded storage, privacy protection, immutable event IDs, conflict rules, and server validation. Unsaved practice makes no cross-device recovery promise. A delayed upload does not move the actual response time to upload time or silently create eligible evidence.

## 10. Content and algorithm migration

Preserve the reviewed revision and task conditions for historical events. Cosmetic equivalence may carry evidence only through an explicit qualified record. A changed meaning, answer key, pronunciation, or stroke model must not inherit an old score blindly. Hide withdrawn content and offer correction when appropriate.

Algorithm migration stores old/new version, parameters, source history digest, replay procedure, due-date policy, and rollback plan. FSRS state must be represented and persisted explicitly before server activation. Calibrate only with consented appropriate data, evaluate held-out prediction and workload, and inspect subgroup harms. Do not silently switch algorithms on app update.

## 11. Metrics and verification

Observed delayed correctness is `eligible delayed correct / eligible delayed attempts`, always with denominator and conditions. Current code hides the fraction below five observations; that display convention is not statistical reliability. A predictive retention probability is absent unless actually modelled and calibrated. Neither metric is percent fluency.

Required checks include: help-before-answer, immediate imitation, same-day repetition, exact 24-hour boundary, intervening exposure, unknown baseline, invalid time, duplicate/mutated replay, concurrent submission, rejected content, media failure, changed revision, withdrawn pack, accessible alternatives, and missing follow-up. Evaluate actual learning tasks alongside algorithm behaviour; a correct interval calculation cannot validate the course.
