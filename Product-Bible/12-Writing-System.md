# 12 — Writing System

**Version:** DRAFT_V2 — reviewed complete specification; owner approval pending
**Date:** 20 November 2026  
**Authority:** [Vision FINAL_V1](01-Vision.md), approved and unchanged. All other sections are working specifications awaiting owner approval.  
**Primary dependencies:** Sections 02–11 and WRITE nodes in 06; forward contracts to 14 evidence, 15 model provenance, and 18 scope.  
**Context:** All existing sections 01–11 read before this section was written. Later references are forward contracts reconciled in the whole-Bible review.  
**Evidence:** [Learning model and research](02-How-Humans-Learn.md); [source register](RESEARCH-REGISTER.md). Numerical targets, budgets, and thresholds below are design hypotheses unless explicitly sourced. No new Tigrinya teaching content or native approval is supplied.

## 1. Writing includes form, language, purpose, and revision

Separate handwriting movement, spelling/form retrieval, written expression, and discourse revision. Tigrinya is left to right in the Ge’ez/Ethiopic script. Correct Unicode rendering, input, line wrapping, and punctuation handling are prerequisites for a fair task, not proof that its teaching is accurate.

The platform must not invent Fidäl stroke order. A font outline does not establish a handwriting model or starting point. A tracing activity without verified sequence data must be labelled shape practice and cannot award a stroke-order score.

## 2. Progression

| Writing mode | Teaching purpose and support | Valid evidence | Main limitation |
| --- | --- | --- | --- |
| Shape exploration | Observe and make marks with an appropriate medium. | Participation/familiarity under stated model. | No stroke-order or literacy claim. |
| Tracing | Follow a verified shape/stroke model where approved. | Supported movement/form practice. | Guide presence prevents free-recall inference. |
| Copying | Reproduce a visible taught form, word, or message. | Copying/visual production, with input method recorded. | Not independent spelling or composition. |
| Guided writing | Construct a purposeful response with reviewed cues/frames. | Supported written expression. | A supplied frame may provide the assessed pattern. |
| Memory writing | Produce a taught form/word before its model. | Specific production retrieval with appropriate evaluation. | Motor error and language error need distinction. |
| Journaling | Express chosen meaning across visits. | Purposeful language use and revision under stated support. | Private content needs careful storage and sharing limits. |
| Creative writing | Create a suitable narrative or other expression. | Coherence, meaning, language choices, and revision. | No single fixed answer key can judge every valid response. |
| Formal writing | Address audience, register, structure, and clarity. | Criterion-based performance and editing. | A correct template is not universal competence. |
| Professional writing | Perform a bounded reviewed work task. | Domain-appropriate language rubric and source use. | No licence, legal authority, or employment promise. |

These modes can overlap and need not be completed in a rigid order. A learner who types can demonstrate written expression while handwriting remains unassessed. A child using paper can participate without precise touchscreen control.

## 3. Verified visual demonstration

For each instructional character, obtain reliable teaching provenance, exact character identity, variant/model, stroke paths, sequence, direction, starting points, and qualified review. Record the asset revision. Do not infer a universal model from Amharic instruction or a visually similar glyph.

When data exists, demonstrate the relevant segment at an understandable pace, provide replay/slow control, and offer a non-animated numbered/static alternative. Honour reduced motion. Let learners observe, trace if useful, then attempt with less instructional support. Necessary input accommodations remain available.

If sources disagree, document scope/variant and obtain a qualified decision. Withhold sequence claims until resolved. This requirement is a content gate, not a request to fabricate coordinates to make a demonstration work.

## 4. Input and text integrity

Use Ethiopic-capable fonts with a tested fallback, `lang="ti"`, and left-to-right text. Preserve text and relevant combining marks; use grapheme-aware selection/counting and an explicit reviewed comparison policy. NFC can support equivalent representation but must not strip distinctions or rewrite source spellings.

Provide actual device/keyboard entry paths and clear focus. Test composition events, pasted text, selection, caret movement, backspace, zoom, line breaks, mixed-language punctuation, and search. Do not claim a specific native keyboard or handwriting recogniser exists unless it is implemented and tested.

The Unit 2 two-grapheme rule applies to candidate content; do not truncate learner input or assume one code point equals one teaching unit. If an entry is invalid for a task, show a useful model and explanation rather than corrupt the text.

## 5. Feedback and rubrics

Choose criteria appropriate to the task: form recognisability under a verified model, relevant spelling, intended meaning, organisation, audience/register, and revision. Descriptive feedback can identify one next improvement without assigning a pseudo-precise score.

For open writing, use qualified rubrics, example anchors with rights, and rater calibration. A model answer is one example, not necessarily the only valid response. Assess interpretation of prompt and supplied vocabulary separately from independent generation. After feedback, revised work is evidence of supported improvement, not a new unassisted baseline.

Do not use stroke speed, pressure, curve similarity, or a recognition confidence number as a language-mastery measure without valid evaluation for the target and input mode. Automated spelling suggestions can reveal the answer; label the support.

## 6. Privacy and learner control

Basic practice should not require a camera, uploaded paper image, or stored personal journal. Optional private work can remain temporary or device-local with explicit saving/deletion boundaries. A shared device needs a clear current context; never silently merge siblings' writing into one profile.

Any future upload, teacher review, or portfolio sharing needs defined relationship permissions, retention/deletion behaviour, and safe rejection of untrusted files. A parent/teacher role label alone grants no access. Do not log raw child text in telemetry or AI prompts.

## 7. Release pathway

MVP may include honest freehand/shape and text practice using existing accurate models; verified stroke teaching remains blocked until sourced. V1 adds approved guided writing and short messages; V2 adds qualified portfolio feedback and longer creation. Professional writing is a separate reviewed domain pathway.

Acceptance requires reliable script rendering/input, truthful model scope, access alternatives, clear feedback, optional storage controls, and separate interpretation of copying, recall, and composition. Test the text behaviours listed above on actual target devices before claiming support. Existing automated checks cannot establish handwriting pedagogy or child usability.

## 8. Qualified answer-comparison fixtures

Before automated written grading, create qualified test pairs for accepted equivalent forms, meaningful non-equivalents, supported variants, combining marks, mixed punctuation, whitespace where relevant, and composed/pasted input. Keep original input and the policy version used for comparison. Distinguish unsupported input, font/rendering failure, and linguistic error. Do not strip marks or over-normalise merely to obtain more matches. Actual target-device checks are still required (RV10).
