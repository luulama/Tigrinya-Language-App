# Learning sequence choreography

## Fidäl tap sequence

Treat every character as a Tigrinya Fidäl form within a family/order/context. Use one reusable renderer keyed by a source content/version record. Do not author 293 independent player implementations or derive handwriting from the visual font outline. Current approval status leaves the teacher/audio stages unavailable; the normal character exploration/writing experience remains usable.

1. **Select:** pointer/keyboard selection immediately displays the exact DOM glyph, selected border and a named action. A reserved focus frame may enlarge at most 1.03 over 180 ms; the glyph's own shape is not morphed. No network or animation delay before selection is visible.
2. **Check capability:** resolve the existing source-backed record, rights, style, native/teaching approval, stroke sequence and normal/slow audio gates. Missing metadata does not create guessed arrows, an empty Play button or a synthetic voice. Say which mode is available through the existing pending-review UI.
3. **Demonstrate when requested:** for verified data, show a starting point/number, draw each reviewed point path in order, and reveal its approved direction/instruction. Precompute cumulative path lengths once; animate one active stroke's dash offset. Use reviewed centerline points, not a glyph's filled contour. The teacher surface remains a static labelled SVG between steps.
4. **Control pace:** Replay, Slow, Stop, Previous/Next stroke and still panels are accessible. A one-shot automatic segment is bounded by the 12-second proposed budget; a longer example offers explicit next steps rather than racing. Slower mode changes trace pacing while preserving order/directions. Respect user stop immediately and do not clear their drawing to replay a model.
5. **Hear the model:** an eligible model may play from an explicit request and actual transport start. Do not automatically open a microphone. Browser gesture restrictions can reject delayed playback after a trace; catch the play promise and offer a normal Play button without showing a talking state. A missing slow recording is not relabelled as native slow speech; a tested pitch-preserving rate must be labelled as such.
6. **Try:** invite reading/repetition or writing only when the corresponding content/model is supported. Local self-comparison is not a pronunciation grade. Retain the existing drawing/text-entry/IME behavior and honest evidence semantics. Interrupted optional motion never consumes the attempt.

Static order panels are the normal reduced-motion alternative. If the learner explicitly requests a motion demonstration, give a clear opt-in for that bounded essential teaching sequence only; do not globally override their reduced-motion setting or start other gestures. No new reviewed teacher strokes are supplied here.

## Vocabulary sequence

Content inputs are exact word sense/revision, reviewed Tigrinya form, approved image association/alt description, variety, normal/slow recording hashes, and optional reviewed alignment. The example `ውሻ` from the request has no reviewed match in this project. It remains excluded from released examples; choose a reviewed repository target when one becomes available rather than guessing its language, meaning or pronunciation.

Order: stable written word → meaningful illustration reveal (180 ms) → approved model on user request → restrained highlight only for reviewed orthographic spans → explicit practice. Keep only one attention-bearing action active. If the picture is essential to meaning, show it immediately instead of waiting for its cosmetic entrance. Mele gestures toward the target then settles; it never moves over the word.

Fidäl glyphs are not automatically one phone or a verified spoken syllable each. Segment data references grapheme/span IDs and exact reviewed audio times; it is not generated from character counts, romanization or equal-duration division. Pulse means a restrained emphasis/underline, with no glyph scaling, flashing or loss of legibility. Whole-word playback still works without alignment, with no claimed syllable synchronization.

Use `HTMLMediaElement.currentTime` as the clock. On seeking, speed change, buffering, pause and end, recompute the active reviewed segment; do not advance an independent `setInterval` phoneme timer. Normal and separately recorded slow media need separately reviewed timelines. Browser time precision and buffering are not evidence of bad pronunciation. [Media clock documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime)

The reference `segmentAt` helper validates exact binding and ordered half-open ranges. The existing review gate must establish actual reviewer credentials, rights and content authenticity first. A waveform amplitude or matching transcript cannot manufacture pronunciation confidence.

## Interactive Stories

Keep the existing separate Stories library/reader and prose/content source. A story is an interaction graph of reviewed pages/turns, not an autoplay video. Node payload: versioned prose, speaker/actor IDs, reviewed illustration, optional sound/gesture, allowed responses, next branches and reviewed feedback. Validate reachability, safe ending/back navigation, missing-media alternatives, maximum gesture/turn counts and versioned dependencies before release.

Entrances clarify who is present. Gestures demonstrate a relevant action/object only on request or at a suitable new-turn boundary. Reactions clarify a chosen consequence and never punish the reader. The default reading interval is still. Tap Next advances; the actor's animation cannot advance the plot, submit a response or choose a branch. Content remains visible even when a renderer is loading or broken.

Bedtime presentation chooses static art and the sleeping bear outside prose. Readers control available audio and can stop independently of animation. Avoid parallax, camera shakes, zooming prose, forced page dwell, moving word-by-word text or background particles. Preserve larger text, selectable Fidäl, captions, focus, scene descriptions and a still branch recap.

Load only the active scene and a bounded next-scene dependency set. Retain bookmarks/progress through current approved saving behavior; the animation runtime owns no story history. Abort prior scene callbacks on Back/Next, hash/version change, offline asset failure or unmount. No telemetry or new persistent child storage is added by this specification.

## Skill-tree progression

The existing learning path/domain decides the ordered lessons, prerequisites, locks, completed status and recommended next step. Render an ordered, keyboard-operable list as the semantic foundation; a decorative SVG connector illustrates relationships beside it. A view-only animation never changes `locked`, awards credit or bypasses Unit 1.

On a real completion, show the stable result/next node immediately. Animate at most the newly eligible connection for 280 ms, then one 180 ms node emphasis if helpful. Optional particles stay near that node, maximum eight/480 ms, and vanish immediately on navigation/Still/Quiet. Do not animate a travelling mascot across an entire scrollable map or auto-scroll the reader to an offscreen node.

Use stable IDs and reserved node bounds. Keep labels/lock reasons in the DOM; avoid a giant canvas-only path. Virtualize a large visual tree only with an equivalent complete navigation list/search. A history replay or API retry cannot rerun every prior unlock. Offline provisional practice must not be dressed as confirmed service mastery; retain the existing sync state distinction.

## Pronunciation and recording visualization

States: unavailable → permission requested by the learner → ready → recording → stopped → optional local playback/compare → eligible evaluation pending → valid result or not assessed. The browser/native media adapter owns permission, focus and exact transport. Do not ask for microphone permission on lesson load or use a pulsing mic before capture starts.

During actual capture show a stable microphone indicator, elapsed time, clear Stop and a bounded live waveform if available. Reuse one Float32Array/Uint8Array and at most 64 bins, one canvas and at most 30 draws/sec; cap pixel ratio and release RAF, media tracks and AudioContext on stop/background/unmount. Do not update React state per sample, persist waveforms, send voice to analytics or treat louder speech as better speech. The existing local recorder's eight-second limit remains unless a separately approved capture feature changes it.

Static mode shows Recording/Stopped and low-frequency elapsed/level text rather than a moving waveform. A failed analyser does not break capture controls; a failed capture provides non-voice practice. No live server-confidence gauge runs while someone is speaking. Self-confidence, technical signal quality and evaluated pronunciation are distinct measures and labels.

Only a qualified human or validated eligible model may provide Correct/Close/Needs improvement and scoped confidence. Show source/rubric/date and specific reviewed help; otherwise use Not assessed. A stable uncertainty interval/category can be accompanied by a short reveal, never a rolling percentage that suggests more precision than exists. This repository has no validated pronunciation scorer to connect today.
