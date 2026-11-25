# Mele character and runtime contract

Mele is the name requested for the existing original cinnamon bear's next identity. Keep its asymmetrical ear tuft, readable muzzle, rounded paws and warm brown/cream palette rather than borrowing a competitor's costume, silhouette or signature acting. The brief selects the name; its cultural suitability still needs review before learner release, and no Tigrinya translation is claimed. The current Neri assets are continuity material; a complete Mele rename must update live text, alt labels, metadata, generated exports, tests and offline bundles together in a later adopted change.

## Acting and transitions

| State | Trigger and meaning | Transition and timing | Exit or fallback |
| --- | --- | --- | --- |
| Idle | A stable place to choose a next action | Still welcoming poster; no periodic blink/breathing loop | New genuine action; Quiet hides the art |
| Walking | Learner chooses the next place; orientation, not reward | MVP: short 180 ms arrival with an existing poster. V2: one authored walk gesture at most 600 ms in a reserved area | Destination ready, cancellation or next action; no blocked navigation or fake progress |
| Talking | Exact eligible model audio actually starts | Still narrator pose immediately. Human articulation guide may follow an independently reviewed media clock; no generic mouth loop | Pause/end/error/seek target change stops timed guide; missing audio stays Teaching |
| Listening | Recorder is actually recording after permission | Attentive still pose; microphone/waveform owns any attention budget | Actual stop/error/background; no cheering or speech over the learner |
| Thinking | An actual eligible hint/evaluation operation is pending | One still thinking pose; honest pending label, no artificial delay | Result, timeout, cancellation; no suggestion that unavailable AI is assessing speech |
| Teaching | A model, example or verified demonstration is actually displayed | Optional pointing gesture at most 280 ms, then still; never cover the target | Learner stops/tries/listens; missing teacher data shows the existing static alternative |
| Celebrating | Existing domain confirms an appropriate practice/lesson outcome | One 480 ms small lift/gesture, optional local particles, settled result already visible | Next action immediately cancels it; no queued repeats or escalating prizes |
| Encouraging | Feedback offers a useful supported retry or honest abstention | Kind stable expression, optional 140 ms reveal | Model/help/retry/continue, with no disappointment or accent judgement |
| Waiting | Real request or asset is pending | Still waiting pose and useful status; after a proposed one-second delay add an honest pending message if still needed | Settled/error/cancel; never infinite moving spinner or fabricated loading percentage |
| Sleeping | Bedtime presentation was selected | Still curled bear outside prose; optional manual change to another still pose | Reader choice; no bedtime pressure, breathing loop or surprise audio |

Transition interpolation normally lasts 140–180 ms. Gesture duration and state lifetime are different: a waiting state may persist while its motion remains zero. A long-lived listening state has no active mascot loop. Accepted result and route state render before any interpolation. Do not delay a correct answer or randomly vary reward timing to create anticipation.

## Event and lifecycle rules

The application supplies typed **view intents**, scoped to `sessionId`, exact `taskRevision` and a monotonic safe-integer sequence. A retry of a semantic event retains its sequence; an obsolete callback cannot create a new event in a newer task. The reference reducer ignores wrong sessions/revisions, old/duplicate sequences and hidden-tab acting. It records no personal history and cannot mutate learning.

Highest priority: disposal/route or policy change → actual recording → active approved demonstration/model transport → specific result/help → optional navigation/celebration. Drop obsolete optional cues rather than replaying a backlog. All visual playback has an AbortController and a finite lifetime. A return from background starts still; resume only on a fresh user/media event. Domain results are retained even if their optional animation was skipped.

The real media adapter owns `play/pause`, permission, recording tracks, AudioContext, decode and error cleanup. A visual reducer cannot stop a microphone by changing a pose. On interruption the adapter must stop/release streams and callbacks, record truthful transport state and notify the motion view. Use transport IDs to reject an old `ended` event after another recording has started. No waveform or pose event is a server assessment.

An enabled native-model boolean in TypeScript is not a native approval. The existing build/runtime content gate verifies the approved target, variety, exact bytes, review and alignment before an adapter can send `model-playing`. The reference tests use labelled synthetic fixtures to test routing only. Revocation or target replacement creates a fresh scope and disables the capability.

## Proposed Rive architecture

Use one `MeleActingV1` state machine and a `MeleMotionV1` View Model. Split body acting, gaze and optional accent details into bounded layers. Keep phonetic teaching in the existing separately reviewed human-guide surface; a bear's muzzle is not a human articulatory model. Author ten stable poses and a small number of transitions, not ninety pairwise animation clips.

| View Model property | Type | Ownership and behavior |
| --- | --- | --- |
| `pose` | Enum: the ten named states | Application coordinator sets the current semantic pose; latest snapshot wins |
| `motionAllowed` | Boolean | OS preference AND in-app policy AND visibility AND renderer quality; false renders the still pose |
| `visible` | Boolean | Route/intersection/lifecycle; stop advancing offscreen; full disposal on unmount |
| `quality` | Enum `static`, `low`, `standard` | Measured device capability/explicit choice; no inferred child profiling |
| `cueSequence` | Number constrained to safe integer | Application event revision; prevents duplicate one-shots within the current scope |

Data Binding is the recommended Rive route for new work; legacy state-machine inputs/events can remain for existing files. Choose renderer/runtime against the actual feature matrix, then pin/test one version. The current official web guide recommends WebGL2 generally, while this app must compare its memory/startup/low-end behavior with Canvas/SVG before adopting it. [Rive Data Binding migration](https://rive.app/docs/editor/data-binding/migration-guide), [property types](https://rive.app/docs/editor/data-binding/property-types), [web runtime](https://rive.app/docs/runtimes/web/web-js)

Rive rendering remains behind a client-only adapter: render the poster first, load the local pinned runtime/WASM/rig only for a visible eligible scene, validate asset/interface version, bind the latest snapshot, resize to reserved bounds and cap pixel ratio. Stale loader resolution checks its generation/AbortSignal; it cannot remount after navigation. On context loss, malformed asset, missing property, unsupported feature or budget breach, dispose and preserve the poster/status/controls. Do not download a different runtime opportunistically.

Rive event callbacks are presentation hints only. Do not honor embedded Open URL, audio, navigation, purchase, score or storage actions. Allowlist any marker names used for developer diagnostics, never arbitrary function dispatch. Disable unneeded authored audio/listeners/scripts; the app's approved player owns speech. Use one active scene instance; do not create a canvas per skill-tree node or glyph. Test repeated mount/disposal and live preference changes with the exact adopted SDK.

No `.riv` rig or Rive runtime is delivered by this specification. A motion artist must author/review the actual file and posters, and an engineer must measure its supported-runtime behavior. The reference SVG lab supplies the acting/transport boundary without pretending to be a completed Rive implementation.

## Asset production and acceptance

Store editable character sources, immutable exports and manifests separately. The manifest must contain rig/interface version, source attribution/rights, SHA-256, artboard/machine/View Model names, ten state/poster mappings, byte/texture budgets, runtime/renderer compatibility and relevant cultural/teaching review. Do not inline licensed audio or unapproved language in a rig export.

Review silhouette at 48, 80 and 150 CSS pixels; facial expressions at high contrast, 200% zoom and narrow layouts; and still frames for every gesture. A waiting pose must not look angry, a sleeping pose must not look ill, and celebration must not hide the next action. Teen/adult presentation uses the same supportive personality with fewer unsolicited gestures, not contemptuous or babyish wording.

Release gate: validated manifest and fallback files; no copied character features; name/cultural/age review; missing/failed/slow renderer tests; stable focus/semantics; no automatic learner-data collection; physical low-end Android/iPhone measurements; and no language-bearing animation without its own exact-version approval.
