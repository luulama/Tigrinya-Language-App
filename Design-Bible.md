# Design Bible

**Version:** V2.0-DERIVED — complete handoff specification, owner adoption pending.  
**Date:** 20 November 2026.  
**Sources:** [Product Bible V2.0](Product-Bible/Product-Bible-V2.0.md), [Curriculum Bible](Curriculum-Bible.md), [Technical Bible](Technical-Bible.md), and [source manifest](Product-Bible/V2.0-MANIFEST.json). FINAL_V1 remains the approved vision; other decisions await adoption.  
**Boundary:** Specifies the learner and contributor experience. It does not claim every screen/system is already complete or authorise implementation/publication.

## 1. Experience identity

Build a welcoming, original Tigrinya learning experience with readable Fidäl, warm paper-like surfaces, clear green primary actions, restrained violet exploration accents, generous space, and meaningful reviewed illustrations. These colours are a continuity choice from the existing product, not a requirement to redesign working screens from scratch. Verify actual contrast before use.

The child should understand one relevant action through a clear model, short prompt, and usable guidance. Adults should receive respectful wording and optional depth without being forced through an infantilising presentation. No competitor mascot, copied branding, distinctive screen layout, wording, or exact lesson structure.

Beauty must make the relationship easier to notice. Avoid decorative movement that competes with text/sound, tiny details in meaning-bearing illustrations, and rewards that delay the next useful action.

## 2. Audience and support design

Use PB03's archetypes as hypotheses, not public identity labels. Begin with L1 and enabling C1/C2, include L3 uneven knowledge and relevant access contexts, and provide honest limits for L2 unfamiliar oral meaning. Older/advanced/professional users do not become first-release courses merely because appropriate presentation is possible.

Keep these choices separate: presentation, target meaning, script experience, input/access needs, and saving preference. A colour theme or declared age cannot verify adult authority. A child should not navigate a proficiency catalogue or read English paragraphs to start.

Map help to the shared support categories: access accommodation, interaction guidance, meaning/model help, answer-revealing help, feedback retry, and unknown support. The runtime and adult report must interpret those categories consistently. Necessary access support can remain in an independent task.

## 3. Information architecture

For the primary learner, show a recommended next step, manageable review, and optional exploration/reference. Reveal a library only when suitable approved content exists. Avoid an array of empty systems or disabled “coming soon” choices on a child's home screen.

Adult setup/settings, evidence explanation, and contributor work belong outside the focal learning interaction. A deliberate navigation separation can prevent accidental entry; it is not authentication. Protected data/actions still require the Technical Bible's permissions.

Existing web routes may remain available to developers/adults with honest states. The learner-facing path should not imply that every route represents authored curriculum.

## 4. Screen contracts

| Screen/context | Primary purpose and next action | Supporting actions | Required empty/failure/recovery behaviour |
| --- | --- | --- | --- |
| Landing/home | Explain what can be learned and offer one appropriate start/continue. | Help, review, optional suitable exploration. | Distinguish practice preview from reviewed course; no invented lesson. |
| Entry/setup | Establish only necessary preferences/context. | Demonstration, adult settings, unsaved path. | No compulsory identity/profile questionnaire for basic practice. |
| Learn/model | Show the meaning/relation and a clear model. | Replay, static alternative, pause. | Missing required model blocks that claim or selects another labelled goal. |
| Practice | One response serving the stated objective. | Help, accessible input, stop. | Preserve input; do not score control confusion as language failure. |
| Feedback/retry | Demonstrate the relevant distinction and offer another useful attempt. | Replay or safe exit. | Retry remains supported; no shame or lost lives. |
| Review | Offer a suitable first attempt before answer help. | Help, skip, familiar practice. | Empty queue is welcoming; no backlog pressure. |
| Story library/reader | Open appropriate approved input and preserve coherent segments. | Replay, glossary, text size, pause. | No unapproved story; media failure preserves safe place without a failed score. |
| Speaking/conversation | Explain the purpose/model and response conditions. | Private rehearsal, optional capture, clarification. | No fake responsive partner or required recording; no unvalidated accuracy badge. |
| Listening | Deliver relevant reviewed audio with declared replay/text policy. | Segment/replay/support. | Muted/unavailable/inaccessible audio is unassessed, not wrong. |
| Writing | Provide suitable form/language model and medium. | Copy/trace/free attempt where valid, clear, static model. | No fabricated strokes; no motor score labelled literacy. |
| Progress | Show dated skill-specific evidence and one useful next step. | Explain help/criterion, relevant portfolio if authorised. | “Not assessed” instead of zero; stale evidence invites review, not shame. |
| Profile/settings | Make deliberate choices and describe their scope. | Save/cancel, storage controls, access preferences. | Failed save retains prior settings and says what was not saved. |
| Sign-in | Explain optional connected service and configured authentication. | Back to public practice. | Missing configuration remains explicit; no demo identity or fake success. |
| Parent/teacher | Show only appropriately authorised learner evidence. | Explain interpretation and optional co-learning. | No relationship means no protected records, not a sample child. |
| Content/reviewer | Inspect exact revision, context, sources, assets and decisions. | Protected preview, revisions, scoped review. | Missing scope/rights/model clearly blocks publication; author cannot self-approve. |

These are target contracts, not an instruction to add every screen to MVP. PB18 selects the first deliverable.

## 5. Learning interaction state machine

The shared states are loading → ready → model/demonstration → response → submitting → feedback → supported retry or complete, with pause, unavailable, and recoverable failure paths. A previously taught review can begin at response when eligible; do not force a model that invalidates the intended condition.

Each transition has a clear continuation and predictable back/exit. Prevent repeated taps from creating new attempts. Focus moves to the relevant heading or feedback; announce a result once through appropriate assistive technology. Preserve the first answer and distinguish correction input from the original response.

If a network submission is uncertain, retain the same event identity and offer retry. Do not let the learner change an already committed answer invisibly or pretend the server saved it. A safe exit communicates actual persistence, not a blanket promise that progress is always stored.

## 6. Meaning, script, and text

Use reviewed pictures to clarify the intended sense. A picture can also leak an answer; learning mode may display it while an independent reading check uses appropriate cue control. Do not let decorative context change the meaning without review.

Use Ethiopic-capable fonts with tested fallback and sufficient glyph size/line height. Tigrinya content uses `lang="ti"` and left-to-right direction. Mixed-language spans retain their own metadata/direction rather than reversing the entire app. Do not present transliteration as the default answer to a script-reading task.

A practical initial design hypothesis is body text around 18 CSS pixels in child presentation and a substantially larger focal Fidäl model, adaptable to viewport and zoom. These are design starting points, not developmental evidence. Test actual glyphs, wrapping, selection, caret, input composition/paste, and punctuation on target devices.

## 7. Accessibility and comfort

Target [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) and test complete flows before a conformance claim. Preserve semantic controls, headings, meaningful names, visible focus, readable contrast, text alternatives, keyboard operation, zoom/reflow, and usable pointer paths. Do not communicate correctness through colour alone.

Use an internal target of at least 48 CSS pixels for primary touch controls where practical, distinct from the standard's actual minimum and exceptions. Provide select/tap and keyboard alternatives for drag/reorder activities. Freehand writing may use a different accessible objective rather than falsely equating typing with handwriting.

Honour reduced motion, offer static verified writing models, avoid surprise autoplay or loud failure effects, and let replay/pacing be controlled. Captions/transcripts support access but their effect on a listening-only inference must remain clear. A quiet visual alternative is a different honest task when audio is essential to the original goal.

Test with actual assistive technology and relevant users. A responsive screenshot or automated scan cannot establish comfortable child use or universal access.

## 8. Feedback and motivation

Feedback should identify or demonstrate the relevant distinction and give a feasible next action. Keep encouragement specific and modest. Use a visible model or contextual correction rather than a scolding sound, disappointed character, or merely “wrong.” All learner-facing Tigrinya wording and associations require native review.

Games can offer curiosity, meaningful construction, story consequence, and optional collections. They cannot make randomness, speed, or currency more important than the learning purpose. A reward does not unlock a mastery claim. Allow stopping after a coherent step without guilt, waiting, or purchase pressure.

A learner who requests help is making a legitimate choice. The report may describe the attempt as supported; the interface should not depict the learner as less worthy or erase an earlier achievement.

## 9. Privacy and shared use

Basic practice should not ask for a child's name, exact birth date, location, belief, face, or voice. Optional saving must state whether it is device-only or connected, who can access it, what can be cleared/exported, and which history may be unavailable in guest mode.

A shared device must not silently mix people’s evidence. Use explicit context choices only where implemented; otherwise offer unsaved practice with honest scope. Do not create cloud profiles automatically. Parent navigation and adult-looking presentation do not replace verified permissions.

Optional microphone use must be explained at the moment needed, with a safe decline path. Keeping, deleting, uploading, or sharing a recording are separate choices and scopes. Do not log raw private work to improve an experience metric.

## 10. Design production and evaluation

For each proposed interaction, provide objective/skill, intended learner/context, required reviewed assets, support policy, response and feedback states, access alternatives, network/content failures, persistence scope, and evaluation questions. Work from the simplest flow before adding a new game wrapper.

Observe primary children with different oral/script knowledge, caregiver language support, and access contexts. Separate navigation coaching, instructional help, access support, and answer provision. Include frustration, refusal, and leaving; do not coach participants solely to achieve completion.

Evaluate understanding and later task performance separately from enjoyment and usability. A neat prototype and an 8-of-10 formative trigger cannot establish efficacy. Preserve the distinction between a reviewed design, a functioning implementation, native content approval, and observed learning.

## 11. Handoff and acceptance

| Design requirement | Source | Acceptance evidence |
| --- | --- | --- |
| One comprehensible next action | PB01/03/07/18 | Observed start, help, recovery, and stop under stated support. |
| Correct modality/evidence | PB02/04/06/10–14; Curriculum Bible | Task conditions match the claimed skill and criterion. |
| Accurate language/media | PB05/09/12/13/15 | Exact-version qualified approval and rights. |
| Truthful state/persistence | PB14/15; Technical Bible | Tested idempotency, failure, privacy and save boundaries. |
| Access without false scores | PB02/03/07/12; Technical Bible | Appropriate target-device/input/assistive flows. |
| Scope discipline | PB16–20 | MVP path omits speculative systems and unsupported claims. |

Owner adoption and G0–G5 remain the implementation/release gates. Any screen that changes the learning goal, criterion, data scope, or publication rule must return to the corresponding governing contract; a visual refinement cannot silently change educational or privacy authority.
