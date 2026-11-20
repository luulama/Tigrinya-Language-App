# Product and experience specification

## Product foundation

### Product vision

The product develops usable language through understandable input, supported rehearsal, independent communication and later retrieval. The first release teaches Tigrinya literacy accurately; the long-term course supports pre-literacy through advanced academic and professional communication. “Near-native” is not a promised outcome or a scored identity. Advanced objectives describe observable performance in particular contexts.

The learner-facing identity is Tigrinya with a small-step visual language: warm paper, green for primary actions, violet for optional exploration, generous spacing and expressive original illustrations. There is no competitor mascot, copied lesson layout or imitation terminology. The home screen answers three questions: what can I practise, what should I do next, and how can I stop or get help?

### Binding decisions

| Decision | Reason | Learning benefit | Tradeoff and acceptance |
| --- | --- | --- | --- |
| Separate language ability, literacy and presentation | Age and script familiarity do not establish oral proficiency | Heritage learners practise the missing skill | More placement logic; changing appearance must never reset evidence or change a proficiency label |
| Teach meaning before asking for recall | An unfamiliar symbol is not yet a meaningful learning target | Makes retrieval interpretable | Fewer questions per minute; independent prompts reference previously taught objectives |
| Move from models to unfamiliar communication | Repeating a displayed answer cannot establish transfer | Tests flexible use | Requires parallel content; every unit contains one unseen transfer task |
| Use Tigrinya Fidäl as an abugida in Ethiopic script | A Latin alphabet model misrepresents the script | Connects family, vowel order, sound and word | Requires language-specific content; no universal seven-column assumption for every form group |
| Keep stage gates per skill | Learners have uneven abilities | Prevents unnecessary reteaching | No single attractive proficiency number; progress shows evidence by modality |
| Release a narrow reviewed course before breadth | A large unreviewed catalogue cannot teach reliably | Protects accuracy | Slower expansion; pending material cannot enter approved learner bundles |
| Local-first and optional persistence | A child should not need an account to start | Reduces access barriers | Shared devices need explicit profile handling; no cross-device recovery without a future opt-in service |
| Let people pause, repeat or skip a test | Anxiety and inaccessible tasks distort evidence | Preserves agency | Missing evidence stays missing rather than becoming a failure |
| Require qualified human language approval | Automated plausibility is not correctness | Preserves authentic use and variants | Content production is the main scaling constraint |

### Learning science foundation

The course uses spacing, retrieval and worked models followed by practice. These mechanisms have research support; interval lengths, pass thresholds and session mixes below are product hypotheses to validate, not established Tigrinya norms. The IES guide supports spacing and using quizzes to revisit content; it also distinguishes evidence strength among its recommendations. [IES learning guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1)

A single lesson contains one main objective. Across a week the programme supplies meaningful listening/reading, speaking/writing, focused language work and fluent reuse of familiar material. It does not split every three-minute lesson into four equal fragments. Illustrations clarify meaning; decorative motion is never required to answer. Beginners receive more models and shorter input; advancing learners receive less support, broader contexts and longer communication.

### Personas and routing

| Persona | Entry decision | Default activity | Success criterion |
| --- | --- | --- | --- |
| Child learning to read | Caregiver selects child presentation; optional oral familiarity check | Picture and approved spoken prompt, followed by a short sound/form activity | Completes the first task without reading English instructions |
| Complete beginner | Starts language and literacy at introductory objectives | A meaningful spoken expression with a pictured situation | Understands and responds to the taught situation |
| Heritage speaker | Optional listening and oral sample separate from Fidäl check | Literacy and register gaps | Advances in reading without repeating already demonstrated oral basics |
| Teen learner | Topic and goal selection, optional placement | Short story, dialogue or creation task | Uses language for a chosen school/community purpose |
| Intermediate adult | Separate skill placement | New input plus a communication task | Transfers a pattern into an unfamiliar response |
| Advanced adult | Portfolio and task-based placement | Long-form input, discussion and revision | Meets a specialist task rubric with human review |

### Success metrics

Primary learning outcome is change on parallel, unseen tasks at baseline, immediately after a teaching sequence, and after 7 and 30 days. Record comprehension accuracy, functional speaking/writing rubric results and support used separately. Report denominators and missing follow-up; do not count missing follow-up as either success or failure. An opt-in pilot uses explicit consent and a separate research protocol; no pilot data collection is enabled by this specification.

Product acceptance requires at least 8 of 10 observed target learners in a formative usability round to start and complete a first activity with no navigation coaching. That is an internal usability release threshold, not a statistically established learning effect. Native reviewers must approve 100% of released language/media associations. Every critical learner path must complete without fatal runtime errors; all persistent-data controls must pass blocked-storage, shared-device and recovery checks.

Use time-on-task only to investigate burden. Do not optimise screen time, daily return frequency or purchase conversion as proxies for learning. An optional future aggregate report can measure error categories and task completion after privacy review; raw speech and free writing never enter analytics logs by default.

## Feature contracts

MVP is a reviewed foundation slice, V1 expands everyday beginner communication, V2 expands intermediate and advanced breadth and supervised services. Each row is a deliverable with a testable boundary. High effort includes linguistic/media work. Missing content keeps an activity unpublished; it does not justify a fake working control.

| System | Required behaviour and learning purpose | Phase | Effort and primary risk | Acceptance condition |
| --- | --- | --- | --- | --- |
| Script learning | Show families, orders, sound and real-word connections using language-pack data | MVP | High; inaccurate mappings | Existing 293 forms render; reviewed sounds gate sound tasks |
| Pronunciation | Offer approved models, private rehearsal and optional local playback | V1 | High; unreliable scoring | No score until Tigrinya intelligibility evaluation passes |
| Vocabulary | Store separate senses; teach meaning then contextual recall | MVP | Medium; ambiguous pictures | Alternatives are taught, distinct and meaning-compatible |
| Reading | Progress from taught forms to controlled text and independent reading | V1 | High; decoding gaps | Every early-reader form has an introduced prerequisite |
| Listening | Segment replay, normal recording, optional reviewed slower take | V1 | High; unavailable audio | Transcript alignment and comprehension item review pass |
| Speaking | Rehearsal then increasingly open functional tasks | V1 | High; false fluency claims | Reading aloud and spontaneous production have separate evidence |
| Writing | Model, optional tracing, copying, recall, typing, connected writing | MVP forms; V1 text | High; unsupported stroke order | Pending guides cannot display instructional starts/directions |
| Stories | Serve licensed, levelled narratives with recycled targets | V1 | High; uncontrolled difficulty | Human editorial level review and prerequisite coverage pass |
| Dialogues | Model exchanges with goals, branching rehearsal and transfer | V1 | High; unnatural language | More than selecting the next visible line is required for independent evidence |
| Culture | Link contextual sources to language use and variation | V1 | High; stereotypes | Community and language reviewers approve the exact version |
| Review | Select due skill-target pairs; collect cold evidence before correction | MVP next increment | Medium; overstated retention | Scheduler replay is deterministic and assistance never inflates retention |
| Assessment | Parallel prompts, explicit rubric, optional accommodations | V1 | High; invalid level assignment | Criterion-level evidence and assessor identity remain visible |
| AI tutor | Explain only within approved material and clearly identify uncertainty | V2 | High; hallucination | Unsupported questions fall back to approved explanations |
| AI conversation | Bounded roleplay with verified scenario goals | V2 | High; language quality and child privacy | Language evaluation and privacy gates pass before provider activation |
| Parent dashboard | Local settings, child evidence and optional co-learning tasks | MVP controls; V1 profiles | Medium; shared-device confusion | Active local profile is visible and no secret PIN claim is made |
| Teacher dashboard | Review assignments and evidence only for linked learners | V2 | High; authorisation | Cross-class and revoked-access tests deny access |
| Progress | Separate oral, listening, reading, writing and script evidence | MVP visual evidence; V1 full profile | Medium; misleading aggregate | No proficiency label appears without valid assessment evidence |
| Achievements | Recognise independently demonstrated tasks | V1 | Low; rewards substitute for teaching | No achievement comes from elapsed time or spending |
| Collections | Save chosen words, stories and personal work | MVP memory; V1 optional local storage | Medium; sensitive free text | Deletion/export scope is explicit and private work stays local |
| Reporting | Show evidence, support, missing assessments and next objectives | V1 | Medium; false precision | Report identifies what was assessed and when |
| Analytics | Local diagnostic counters first; optional aggregates later | V2 | High; unnecessary surveillance | Disabled by default; no raw learner content or identifying event stream |
| Placement | Short branching skill samples with uncertain outcomes | V1 | High; age/heritage bias | Learner can correct placement and skip unsupported modalities |
| Offline packs | Cache approved assets by immutable release manifest | V1 | Medium; stale/revoked content | Failed download preserves previous working pack; revoked assets are blocked |
| Multi-language packs | Supply script, segmentation, direction, content and evaluation adapters | V2 | High; English assumptions | Test fixtures include LTR abugida, RTL text and mixed-direction punctuation |
| Subscriptions | Optional adult-owned entitlement, never part of lesson feedback | V2 after business decision | High; child purchasing | No payment service, trial or paywall is enabled in MVP |

## Child mode

For ages 4–8, the activity screen has one focal illustration or character, one short instruction, an always-reachable demonstration and one main continuation action. The spoken prompt uses an approved recording. Each new interaction is demonstrated with a non-scored example. Non-readers can replay the instruction without leaving the task; labels remain available for adults and assistive technology.

The default lesson lasts approximately one small objective, not an enforced number of minutes. A wrong answer shows the relevant model, gives one specific cue and permits a retry. The next independent prompt occurs after another activity or on a later visit. No lost lives, audible failure buzzer, confetti requirement or reward countdown is permitted. Ending an activity saves eligible evidence when the caregiver has enabled saving and offers a calm stopping point.

The parent entry is a deliberate two-step navigation separation. It is not authentication. Local-only mode needs no child name, exact birth date, microphone or network access. A future account mode requires verified relationship/permission controls before sharing evidence. The dashboard can turn saving off, clear one profile, manage packs and choose presentation language. Browser security remains the protection against another person using the same unlocked device.

The literacy pathway combines oral comprehension, sound awareness, verified sound–Fidäl relationships, words, connected reading and meaningful writing. Children who already speak Tigrinya receive oral-rich stories while learning Fidäl. The current silent preview remains labelled as a prototype until spoken directions and target recordings pass review.

## Teen mode

Ages 9–12 receive school, family and community tasks; ages 13–18 can choose age-reviewed academic, media and work-exploration topics. Both use the same evidence model and accessible interaction patterns. Optional projects include a private illustrated story, a presentation or a comparison of two reviewed sources. Progress displays communication goals and constructive revisions rather than class rankings.

Study mode lets the learner choose a goal, available time and one recommended task. It offers explanations without requiring a child mascot. Performance reports distinguish correct recognition from speaking and writing evidence. A learner may practise privately before sharing work.

Social functionality in V2 is restricted to teacher-organised, consented groups with named moderation responsibility, closed invitations, reporting, removal and no direct messaging or public discovery. The first implementation uses assignment feedback only. No social feed, follower counts or algorithmic recommendations are included. A disabled social tab must not appear in the learner interface.

## Adult pathways

| Path | Placement and content decision | Required demonstration |
| --- | --- | --- |
| Complete beginner | Start oral communication and Fidäl as separate beginner strands | Understand a simple exchange and produce a relevant response |
| Heritage | Place each modality separately; prioritise reading, writing and register gaps | Complete a literacy task without being retested on established oral ability |
| Traveller | Select approved travel scenarios across relevant beginner objectives | Handle a changed detail or request clarification in a scenario |
| Professional | Require established general-language prerequisites; choose domain | Deliver a meeting contribution, message and presentation with feedback |
| Academic | Combine extended input, source comparison and argument writing | Explain a position, distinguish sources and revise a structured response |

Path choice changes the recommendation order, not assessment standards. Adult learners can browse appropriate material and challenge a placement. They receive concise optional grammar explanations and can turn transliteration off; transliteration never becomes the stored answer in a script-reading assessment.

## Motivation and learner control

Progress reflects objectives demonstrated with evidence. An achievement names a capability, includes assessment context, and remains separate from collecting a picture. Collections are selected by the learner; completing a collection never blocks learning. Optional weekly plans have no consecutive-day counter and no penalty for absence. The return screen recommends a manageable review rather than displaying a backlog warning.

## Screen contracts

| Screen | Default content and primary action | Supporting interactions | Empty, unavailable and recovery states |
| --- | --- | --- | --- |
| Home | One next objective with a meaningful picture; Begin or Continue | Review entry, current local profile, settings | First visit starts without setup; unavailable content is omitted; unsaved mode states its scope |
| Learn | One task, objective, progress within this activity; Continue | Replay model, show help, pause | Wrong answer retains input and shows a specific cue; asset error offers an equivalent task or safe exit |
| Review | One eligible cold prompt; Answer, then Continue | Skip without penalty, request model | Empty queue offers familiar practice; revealing a model records support; no backlog pressure |
| Story Library | Age/level-appropriate approved titles; Open recommended story | Topic, length and modality filters | Missing audio leaves readable mode only where that teaches the stated objective; unapproved stories stay absent |
| Story reader | Current passage and optional illustration; Next passage | Replay segment, glossary, text size, save place | Offline missing segment returns to last safe position; glossary use is visible in evidence |
| Conversation Hub | Approved scenario with purpose and roles; Rehearse | Model exchange, local record, human task | AI unavailable falls back to fixed reviewed prompts; no fake responsive partner |
| Progress | Separate skill cards with evidenced objectives; Practise suggested gap | Evidence date, support and portfolio | “Not assessed” replaces a zero; stale evidence recommends a check without deleting achievement |
| Profile | Presentation, learning goals, language variety and storage preference; Save changes | Optional local alias, export and clear profile | Guest works without account; failed persistence leaves existing data intact |
| Parents | Active child profile, learning evidence and settings; Continue co-learning | Pack management, consent and local data controls | Relationship not verified means no cloud child data is shown |
| Teachers | Authorised roster, assignments and rubric queue; Review next submission | Reassign, accommodate, return feedback | No class enrolment means an empty roster; revoked enrolment removes access immediately |

All screens retain logical heading order, language metadata, visible focus and predictable back navigation. A primary action uses a 48 CSS-pixel minimum target; body text starts at 18 CSS pixels in child mode and remains zoomable. Text contrast targets WCAG 2.2 AA, with an internal 48-pixel touch convention. Reflow at 320 CSS pixels, 200% text zoom, keyboard-only operation, reduced motion, no colour-only answers and screen-reader names are release tests. These are requirements, not a present conformance claim. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

Tigrinya content uses lang="ti" and left-to-right direction. Script runs use Ethiopic-capable fonts; mixed-language spans preserve their own direction. Input, search and answer comparison use NFC and grapheme-aware segmentation without stripping Ethiopic combining marks. No language pack may assume one character equals one Latin letter. Future RTL packs change reading direction per content span and test cursor movement; they do not reverse unrelated controls or images.

## Delivery acceptance

MVP closes with one complete reviewed foundation sequence, usable spoken directions, keyboard and phone validation, correct optional saving and a small delayed-learning pilot. V1 closes with a connected everyday-language sequence, stories, genuine oral/reading/writing evidence and local profile isolation. V2 closes with sustained intermediate/advanced tasks, validated placement, teacher services and any separately approved AI integrations. C1/C2-oriented breadth is delivered by reviewed content increments within V2, not by relabelling beginner exercises.

The developer owns runtime, storage and gates; the designer owns interaction prototypes and observed usability; the content creator owns drafts, sources and asset coordination. Qualified language reviewers approve exact language/media versions. A content creator may fill that role only with the relevant expertise; authors do not self-approve their own work. No calendar promise overrides a failed content or safety gate.

## Session and interaction contract

The target session planner offers the following allocations. They are optional planning estimates; leaving early records only completed evidence. A long activity may replace several short prompts. No screen displays a countdown or requires the learner to exhaust a review queue.

| Available time | Sequence | Intended result |
| --- | --- | --- |
| 3 minutes | 1 minute familiar cold retrieval; 1 minute model/correction; 1 minute familiar use | Refresh a narrow existing target |
| 5 minutes | 1 minute review; 1 minute meaningful model; 2 minutes practice; 1 minute independent attempt | Introduce or consolidate one small objective |
| 10 minutes | 2 minutes review; 3 minutes story/dialogue input; 3 minutes guided practice; 2 minutes production | Understand and use one connected target |
| 15 minutes | 3 minutes review; 4 minutes input; 4 minutes focused practice; 3 minutes communication; 1 minute reflection | Complete one modest communicative task |
| 30 minutes | 5 minutes review; 8 minutes input; 5 minutes focused practice; 8 minutes speaking/writing; 4 minutes feedback/retry | Produce and improve a meaningful extended response |

The existing runtime supports a smaller scope: three minutes selects one picture word; other choices use up to three words and allow additional activities. The target timed allocations require the reviewed input/output tasks specified here and must not be advertised as currently implemented.

| State | Entry condition | Visible interaction | Exit and evidence |
| --- | --- | --- | --- |
| Introduce | Approved target and required media resolve | Picture/context, model and one next action | Continue records exposure only |
| Demonstrate | New interaction type or requested help | Non-scored worked example with replay/static alternative | Continue enters supported practice |
| Practise | Target introduced | One response, optional help and specific feedback | Correct/helped attempts remain practice evidence |
| Cold review | Previously introduced target is due and independent prompt is eligible | Answer before any model, or request help | First response records evidence; a model changes it to supported |
| Correct and retry | Incorrect answer or help request | Correct model, one cue and another attempt | Retry does not create new independent evidence |
| Transfer | Prerequisites satisfied and parallel task available | New context with no answer displayed | Approved key or human rubric records transfer evidence |
| Finish | Activity's required steps complete or learner chooses to stop | What was practised, help used, next activity or stop | Persist only eligible records if saving enabled |

Every transition validates the current activity ID and state; repeated taps are idempotent. Focus moves to the next screen's heading, and answer feedback is announced once through a polite live region. Incorrect input remains available for comparison. A media failure cannot silently turn a listening assessment into a reading assessment: an equivalent reviewed task is selected with its own skill tag, or the activity exits without a scored result.
