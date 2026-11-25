# Motion performance and accessibility acceptance

## Runtime budgets

Budgets below are proposed admission criteria, not device results. Measure the actual adopted release build and asset graph. Dependencies shipped for one feature count toward that feature; do not exclude WASM, JSON, embedded textures or offscreen canvases from the total.

| Measure | Initial target | Recovery if exceeded |
| --- | --- | --- |
| Shared incremental coordinator/tokens JS | At most 10 KiB gzip, excluding React already in the host app | Remove abstraction/unused code before adding another runtime |
| Shared initial posters | At most 30 KiB gzip total; active lesson only | Optimize vectors and defer noncurrent poses; preserve text fallback |
| Optional rig/runtime transfer | Separately approved target of 500 KiB compressed including WASM and dependencies | Retain SVG if the real renderer cannot meet target; budget changes need measured justification |
| Frame budget on a 60 Hz test device | Approximately 16.7 ms total; record median/p95, long frames and missed refreshes | Reduce quality, stop particles, lower waveform rate or use still mode |
| Visual input response | Stable selected/result state in the next usable paint; lab synthetic p95 under 100 ms is a proposal | Remove JS/layout contention; no fake optimistic saved state |
| Foreground sequences | One; capture waveform/model teaching wins over optional character acting | Drop obsolete optional cues; no growing queue |
| Canvas/waveform | One active canvas, 64 bins, at most 30 draws/sec, low-end pixel ratio at most 1.5 | Static recording status/elapsed text; never break Stop |
| Memory/lifecycle | No monotonic retained-instance/listener/RAF growth across 50 scene changes | Dispose renderer/resources, correct stale loader/handler ownership |
| Teacher demonstration | One active bounded SVG segment; default automatic segment at most 12 seconds | Manual next/previous verified panels and explicit slower replay |

The 10 KiB target concerns incremental motion code, not the entire React design lab. The browser lab includes its own React host only so it can run independently. Do not claim that its whole bundle is the same as production's incremental cost. Gzip sizes do not equal resident CPU/GPU memory or decode cost.

## Device and measurement protocol

Before release, name real low-end Android and iPhone models/OS/browser/WebView versions and their supported access modes. Include at least one 60 Hz Android with constrained CPU/RAM, a smaller iPhone, Safari/Chrome desktop, and the actual Capacitor container. Emulated viewport and desktop CPU throttling are useful diagnostics; they do not establish thermal, GPU, touch, audio-focus or memory performance on a phone.

Use a pinned production build, declared cold/warm cache, battery/power/thermal condition, network profile and test script. Profile these scenarios: first lesson open; 30 rapid selections/retries; reviewed stroke playback and speed/stop; audio seek/buffering; capture with analyser failure; repeated scene mount/unmount; skill unlock; offline asset miss; reduced-motion toggled mid-gesture; background/return. Keep raw QA traces locally and disclose what was simulated.

Record:

- **Frame distribution:** `requestAnimationFrame` interval samples during a defined active sequence, excluding setup/background. Report median/p95/max and estimated missed refresh intervals against the measured display refresh. Do not describe a page's idle RAF mean as evidence that Rive/strokes/audio stay at 60 FPS.
- **Interaction latency:** Event Timing/INP where supported, plus direct input-to-stable-render/next-paint samples for the exact task. Separate network/approval delay from visual response; record p50/p95 and sample counts, not only the fastest click.
- **Asset performance:** actual compressed/transferred bytes, resource timing, decode/runtime instantiation time, cache state and fallback activation. Cross-origin timing gaps are not zero load cost.
- **Memory and lifecycle:** retained DOM/canvas/renderer/listener counts, heap trend and browser/device memory pressure over repeated transitions. Test hidden-tab/offscreen suspension and renderer context loss. A resolved loader must not resurrect an old screen.

Use an optional development-quality governor: normal → fewer effects → still. Downgrade at a task boundary or immediately for safety; do not repeatedly flap quality while reading. Selection may use current measured frame behavior and explicit user choice, not a persistent device fingerprint. Quality changes never change the learning evidence or omit important content.

## Motion policy and semantic access

OS `prefers-reduced-motion` is observed live. In-app Still view can request less motion; it never requests more than the OS allows. Quiet hides decorative character art. Preserve the chosen preference through existing approved settings only; the example lab keeps it in memory and adds no child persistence. Every WAAPI/Rive/SVG/timer owner cancels on a stricter policy or disposal; CSS alone cannot stop JS/WASM loops.

The semantic state is available independently of animation: result text, lock reason, input error, pending/saved/device-only status and next action. Keep focus on the meaningful input/next heading, not a particle/canvas. Do not put every waveform frame, character pose or changing percentage into a live region. Announce a meaningful result once through polite status; avoid duplicate art alt/caption announcements.

Meet the project's AA target, and voluntarily disable nonessential interaction motion under AAA 2.3.3. No surprise flash or audio. A pause/stop/hide affordance is needed for covered auto-moving or auto-updating material; stopping a decorative effect cannot block the lesson. Motion essential to a reviewed demonstration also needs controllable still steps and replay. [W3C motion criterion](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [W3C pause criterion](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)

Fidäl remains actual `lang=ti`, left-to-right DOM text with grapheme-safe spans, appropriate local fonts, clear contrast and no clipping at 200% zoom. Canvas/SVG is enhancement, not the only reading surface. Check IME/paste/native input, selection, wrapping and focus under the existing writing tests before integration. Never create an RTL layout just because Ethiopic is non-Latin.

## Acceptance matrix

| Surface | Functional/error cases | Access/lifecycle cases |
| --- | --- | --- |
| Mele | All ten named states; unavailable/failed poster/runtime; duplicate/late events | Static/Quiet, live OS preference, background, unmount, no stale loader/loop |
| Character/writing | Exact-version gate, missing/rejected strokes/audio, replay/slow/stop | Still verified panels, pointer cancellation, native input/IME, no invented handwriting grade |
| Vocabulary | Sense/image/audio match, missing alignment, seek/rate/pause/end | Stable DOM word, transcript support classified honestly, no layout bounce |
| Stories | Branch/Back/Next, unavailable actor/voice, ending/replay | Prose available immediately, no video autoplay, bedtime still, focus and offline restore |
| Path/rewards | Real lock/unlock, duplicate completion receipt, provisional sync | Ordered DOM route, clear lock reasons, no forced wait/scroll/streak pressure |
| Recording/feedback | Permission denied, silence, stop/error, analyser failure, unavailable grader | Named stable state, no required waveform, released streams, qualified uncertainty only |

Automate reducer/contract/cancellation/component tests and browser viewport/keyboard/reduced-motion/error/offline checks. Then run VoiceOver/TalkBack, physical touch/microphone/audio-focus tests and moderated formative learner observation. No automated test approves native Tigrinya or proves retention. [Current validation](VALIDATION.md) distinguishes the checks performed for the reference package from those still required for live features.

## Benchmark and learning evaluation

Treat the requested products as design questions, not copied screens/assets or evidence that a mechanic works for this population:

| Benchmark brief | Question for this app |
| --- | --- |
| Duolingo | Is the submitted action acknowledged and the next action obvious without compulsory celebration? |
| Khan Academy Kids | Can a guide demonstrate an unfamiliar interaction and offer a useful hint without adult explanation? |
| Lingokids | Does an action meaningfully reinforce the language objective rather than consume attention? |
| Pokémon learning apps | Is character acting/silhouette readable and memorable? No specific title was supplied; no feature or efficacy claim is inferred |
| Headspace | Can the learner control pacing, quiet and stopping comfortably? |
| Disney Interactive | Does a bounded character reaction clarify a story consequence without turning reading into passive video? |

Khan's own guidance describes a guide that demonstrates interaction and offers hints; that is a useful comparison question, not permission to copy Kodi or proof of Mele's efficacy. [Khan Academy Kids guidance](https://sites.google.com/khanacademy.org/khanacademykids/getting-students-into-the-app/three-ways-to-play)

Prespecify equal-content static/limited/full-motion comparisons with appropriate consent, age/access support and native-reviewed tasks. Primary outcome: independent performance on taught/parallel items after an agreed delay. Also record next-action understanding, useful completion, voluntary return, discomfort, errors and caregiver orchestration. Report uncertainty/attrition and avoid mixing recognition with pronunciation/fluency. A longer session or more daily taps is not automatically success; dopamine is not measured by this design. Optional research/product telemetry remains off until explicitly adopted through the project's privacy process.
