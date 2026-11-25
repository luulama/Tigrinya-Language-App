# Animation catalogue

Each row is a required behavior contract, not proof of a released asset or learning benefit. **T** = compositor-oriented transform/opacity; **P** = bounded SVG/canvas paint; **S** = static/no per-frame work. All durations are proposed. The common exit rule is cancellation on target/route change, backgrounding, preference change or disposal, without losing semantic state or delaying an action.

## Feedback, progress and discovery

| ID and state | Why it exists and educational purpose | Trigger and timing | Cost / performance limit | Accessible alternative and content gate |
| --- | --- | --- | --- | --- |
| A01 Success acknowledgement | Confirms the actual submitted action and points to the next task | Accepted practice result; check reveal 140 ms, optional Mele cheer 480 ms | T; one foreground cue; repeated receipt cannot replay it | Persistent specific text/icon; no motion required; practice is not mastery |
| A02 Helpful correction | Shows the target feature to compare, then allows a supported retry | Confirmed mismatch; stable outline/approved model, optional 140 ms reveal | T/S; no shake, flash, buzzer or lost life | Text and visual model, Help/Retry/Continue available; log actual support in learning domain |
| A03 Progress update | Makes completed versus remaining work understandable | Authoritative step update; connection 280 ms | T/P; only the changed local connection, no full-tree redraw | Numeric/text state updates immediately; no global fluency percentage |
| A04 Unlock | Explains which prerequisite opened the next action | Domain unlock; node highlight 180 ms, optional connection 280 ms sequentially | T/P; one active edge; no camera pan or auto-scroll | Named enabled button and prerequisite explanation; no animation-created unlock |
| A05 Discovery | Directs attention to one newly available useful affordance | First relevant encounter; one 180 ms outline/arrival | T; no repeated pulsing prompt | Visible label/description; no reward for random taps |
| A06 Model learning | Makes a demonstrated relationship visible before recall | Reviewed model shown; 180 ms arrival followed by still inspection | T; no mascot movement competing with model | Selectable Fidäl/meaning and still model; existing approval gates apply |
| A07 Review reminder | Explains a useful revisit without debt or guilt | Learner opens review; one stable due/ready state, optional 140 ms reveal | S/T; no background nagging or countdown | Named review action and permission to stop; supported retries do not become delayed recall |

## Character, vocabulary and story

| ID and state | Why it exists and educational purpose | Trigger and timing | Cost / performance limit | Accessible alternative and content gate |
| --- | --- | --- | --- | --- |
| A08 Character focus | Shows which Fidäl form is active | Tap/focus; 180 ms, scale at most 1.03 in a reserved frame | T; keep exact glyph geometry, baseline and legibility | Static border/label; keyboard selection and `lang=ti dir=ltr` text |
| A09 Teacher stroke | Demonstrates verified handwriting sequence/direction | Explicit Play; reviewed stroke timing, Replay/Slow/Stop, bounded automatic segment | P; one SVG trace, cumulative lengths computed once, no per-frame React state | Reviewed numbered still steps and next/previous; unavailable for all current pending records |
| A10 Learner ink replay | Lets the learner compare their own action with the model | Explicit Replay my writing; existing owned path pacing | P; one surface; release frame callbacks on Stop | Still drawing and undo; never label learner marks as correct teacher order |
| A11 Word and illustration reveal | Establishes one reviewed sense–image association | Model presentation; image arrives in 180 ms, then holds | T; reserve image bounds; no image over the script | Text/alt association, still image; sense/visual/native review required |
| A12 Word-segment highlight | Connects a heard segment to reviewed orthographic spans | Actual approved playback clock; restrained static emphasis per reviewed segment | T/P; update only when segment changes, no bounce/resizing text | Whole-word audio/transcript and selectable word; no guessed segmentation or phoneme claim |
| A13 Story entrance | Indicates who is present and relevant to the current turn | Learner advances; one actor entrance 180 ms | T; active scene only, no automatic page progression | Still illustration, actor label and complete prose available immediately |
| A14 Story gesture | Makes a reviewed action/referent easier to interpret | Learner requests scene/model; one bounded gesture up to 600 ms | T/P; actor is subordinate to prose/audio | Still keyframe plus description; no random movement while reading |
| A15 Story reaction | Shows a meaningful consequence of the selected branch | Accepted reviewed response; reaction up to 280 ms | T; one reaction, no reaction-triggered grading | Reviewed consequence text; no shame/anger at mistakes |
| A16 Story progression | Maintains place during an explicit page/branch change | Next/Back; 140 ms exit or 180 ms arrival, not both if it delays access | T; old/new content never both focusable | New heading/focus and page position; bedtime defaults still |

## Achievements and learning path

| ID and state | Why it exists and educational purpose | Trigger and timing | Cost / performance limit | Accessible alternative and content gate |
| --- | --- | --- | --- | --- |
| A17 XP acknowledgement | Optionally names completed practice effort | Real deduplicated practice award; text appears immediately, optional 140 ms reveal | T; fixed bounded acknowledgement, no coin shower/counting loop | Plain effort label; XP feature is proposed and never evidence of mastery |
| A18 Lesson complete | Recaps what was actually practised and offers a useful next step | Actual lesson completion; optional 480 ms local cheer | T; Continue/Review/Stop are immediately usable | Stable recap with assistance/independence preserved |
| A19 Calendar celebration | Optionally acknowledges an adult-selected practice period | Opt-in adult calendar goal; 480 ms at most, no surprise sound | T; no loss effect, rescue purchase or variable reward | Neutral period count and stop option; not added to child defaults |
| A20 Skill-tree connection | Explains prerequisite and current route | Eligible domain progression; 280 ms on active edge | P; maximum one changed connection, virtualize larger trees | Ordered DOM lesson list, names/lock reasons; no color-only meaning |
| A21 Goal complete | Confirms a learner-chosen useful action | Actual goal receipt; local 140 ms icon + optional 480 ms cue | T; goal does not create linguistic correctness | Text recap and next choice; no demand to extend the session |
| A22 Celebration particles | Briefly frames a meaningful completion without competing with content | Optional after completion; maximum eight particles, 480 ms, local bounds | T; fixed reusable nodes, no physics engine or fullscreen overlay | Omit entirely in Still/Quiet/low-power modes; text result remains sufficient |

## Speaking and interaction

| ID and state | Why it exists and educational purpose | Trigger and timing | Cost / performance limit | Accessible alternative and content gate |
| --- | --- | --- | --- | --- |
| A23 Microphone state | Distinguishes permission pending, actual recording and stopped | Actual capture lifecycle; stable icon; brief 140 ms state change | S/T; no continuous pulse; mic must not imply remote listening | Visible Recording/Stopped, duration/Stop; denial leaves local non-voice task |
| A24 Live waveform | Shows that usable signal is arriving, not that speech is correct | Explicit recording; at most 30 draws/sec, 64 bins | P; one canvas, typed buffers reused, no React-per-frame updates | Static level/elapsed text updated at most once/sec; no raw waveform persistence/upload |
| A25 Confidence | Communicates calibrated evaluation uncertainty only when valid | Validated result; stable labelled interval/category, optional 140 ms reveal | S/T; no animated precision dial | Evaluator/rubric/date/uncertainty text; absent for self-comparison and unavailable evaluation |
| A26 Speaking result | Offers one useful, reviewed contrast or honest abstention | Qualified result; A01/A02 rules, no extra score show | S/T; never animate a waveform into a correctness badge | Correct/Close/Needs improvement only with valid evidence; otherwise Not assessed |
| A27 Button response | Confirms input while preserving task focus | Pointer/keyboard action; 80 ms press, no repeat loop | T; no transform in reduced motion | Native button, focus ring, disabled/busy reason; no target movement while aiming |
| A28 Card selection | Preserves choice identity and reveals one detail | Selection; 140 ms outline/opacity change | T; stable DOM order/height, no compulsory 3D flip | `aria-pressed`/selection semantics and visible label; do not leak answer before recall |
| A29 Lesson selection | Shows active lesson and next route | Choice; 180 ms arrival only if useful | T; no movement of every lesson node | Focus/heading/route announcement; navigation never waits for completion |
| A30 Review card reveal | Separates an unaided attempt from later model help | Learner requests model; 140 ms reveal, not an auto-timer | T; mask is visual only, assessment answer keys remain protected | Revealed model/text and recorded assistance; no hidden keyboard/screen-reader answer before reveal |
| A31 Menus and navigation | Makes the new location/control group understandable | Open/close; 140–180 ms | T; abort on route change, no forced spatial travel | Correct dialog/menu semantics, Escape/focus return, stable heading |
| A32 Notifications and saving | Distinguishes saved, pending, failed and device-only states | Real service/local status; stable text, optional 140 ms reveal | S/T; dedupe notices, no shaking toast stack | Persistent recoverable error and polite single announcement; never say saved before confirmation |

Mele's ten acting states are specified separately so a long-lived semantic state is not confused with an endless animation. Story/character/speaking rows remain gated by the exact content and feature capability. The lab exercises the reusable boundary; it does not claim every catalogue sequence has been authored or integrated.
