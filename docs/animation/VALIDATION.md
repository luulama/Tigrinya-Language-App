# Animation design validation

Checked on 25 November 2026 against repository baseline `491719f`. This update adds a twelve-part specification, 32-item animation catalogue, Mele/Rive strategy, tokens, typed reference code and an isolated lab. The only existing-document change is a link from the production blueprint. It changes no live lesson, mascot asset, Next.js component, mobile configuration, review record, backend or database.

Historical scope note: the later [entry-systems increment](../learning-experience/README.md) adopts Mele's name in the Next.js app. The tests below describe the original animation package, not that later implementation or a complete Rive adoption.

## Completed checks

| Check | Result and actual scope |
| --- | --- |
| Reference TypeScript | **PASS:** `bash scripts/tool.sh node node_modules/typescript/bin/tsc -p docs/animation/reference/tsconfig.json` |
| Formatting | **PASS:** Prettier check of the new TypeScript/TSX, lab CSS/HTML and token JSON; generated token CSS checked against its source |
| Reference Vitest | **PASS, 21 tests:** `bash scripts/tool.sh node node_modules/vitest/vitest.mjs run --config docs/animation/reference/vitest.config.ts`; session/revision/sequence handling, capture priority, media gates, cancellation, missing renderer, reviewed clock ranges, static/semantic fallback and live OS preference |
| Existing root tests | **PASS, 18 tests:** `bash scripts/tool.sh npm test`; existing package/web checks remain passing |
| Browser lab matrix | **PASS, 21 checks:** `bash scripts/tool.sh node node_modules/@playwright/test/cli.js test --config docs/animation/reference/playwright.config.ts`; seven cases each in desktop Chrome 1280×850, phone-sized Chrome 390×844 and phone-sized WebKit 390×844 on this Mac |
| Additional diagnostics/previews | **PASS, six targeted reruns:** same browser command with `--grep 'all ten\|collect local'`; added screenshot, synthetic latency and resource capture. These are repeats of existing cases, not six new unique feature tests |
| Independent builds | **PASS:** final Vite production builds of the standalone lab and exported motion core into fresh `/private/tmp/tigrinya-motion-final-den8jgnq`; no web build output replaced |
| Visual inspection | Desktop Chrome and phone-sized WebKit full-page lab screenshots inspected: readable layout, all controls, bear poster, no horizontal clipping; this is not a full accessibility audit |
| Native review source | Existing writing JSON still has 293 pending form, audio and handwriting records; no approval was added or inferred |
| Package/content guards | **PASS:** animation package links/tokens/SVG checks, `scripts/check_product_spec.py`, `docs/production/reference/check_package.py` and 14 existing `tests/check_mascot.cjs` groups |

Final package check: `python3 -B docs/animation/reference/check_package.py`. It validates the twelve numbered deliverables, ten state names, 32 catalogue IDs, generated token CSS, local links, the eight reused lab SVG posters and the locked vision's SHA-256. Existing product/production specification checks are also run before synchronization. No approved Bible is revised.

## Local performance observations

The final independent build measured 4,592 raw / 1,723 gzip bytes for `motion-core.js`; the lab's React-host JavaScript was 231,274 raw / 71,631 gzip bytes. The nine existing bear SVG posters total 39,342 raw / 13,135 gzip bytes when compressed independently. The lab reuses eight of them, and bundling may inline small assets. These are byte measurements with Python gzip, **not measured CDN transfer, resident memory, the full production client increment or Rive cost**. Use a fresh output directory or traverse only the current asset manifest when measuring; stale chunks from an earlier incremental build must not be counted as current dependencies.

The browser diagnostic repeatedly acknowledges a synthetic practice event while sampling 120 RAF intervals. Initial p95 intervals: desktop Chrome 16.7 ms, phone-sized Chrome 16.7 ms, phone-sized WebKit 23 ms. The targeted rerun gave 16.7, 16.7 and 29 ms respectively. WebKit's initial maximum was 58 ms; the rerun maximum was 33 ms. These diagnostics do **not** establish a stable 60 FPS budget, particularly for WebKit, and include no real Rive, teacher-stroke, microphone or phonetic rendering load.

The added synthetic click-to-second-RAF probe takes twelve samples per project, with p95 33.5 ms desktop Chrome, 35.1 ms phone-sized Chrome and 45 ms phone-sized WebKit. It includes a two-frame wait and is **not INP or physical touch latency**. Resource Timing entries are captured by the test for local lab resources; the development-server environment is not a cold production network benchmark. Do not select only the best run or present desktop viewport emulation as a low-end phone result.

The static baseline remains the release fallback. Physical-device profiling and the [acceptance matrix](PERFORMANCE_AND_ACCESS.md) must establish frame, interaction, memory, transfer/decode and battery/thermal budgets before full-motion rollout. A reference build's small JS file cannot prove those properties.

## Limits and remaining release work

- The current app remains Neri and retains its existing behavior. The requested name **Mele** is used in this design and lab; a complete live migration is separate adoption work, including captions, metadata, generated assets, tests and offline bundles.
- The lab's walking/talking states are pose/arrival studies using existing posters. It supplies no full walking rig, speech animation, `.riv` asset or invented human articulation. Rive's runtime is not installed or tested here.
- No new Tigrinya word, translation, native audio, stroke path or review approval is created. The supplied `ውሻ` example is not treated as reviewed Tigrinya; the future flow requires the project's actual approved content.
- No live pronunciation evaluator/confidence meter, XP/streak system, skill-tree unlock, story graph or complete learning-sequence choreography is implemented by these examples. Their domain, content and device gates remain required.
- The browser checks cover already loaded-page offline interaction and missing-asset recovery. They do not prove cold offline reload, authenticated sync or production bundle revocation.
- Microphone permission/capture, physical Android/iPhone, Capacitor audio focus, real stylus/IME, VoiceOver/TalkBack, full 200% zoom/contrast audit, Rive lifecycle/GPU memory and learner studies remain unverified for this proposed system. Existing app checks are not relabelled as tests of new features.
- No retention, dopamine, course-completion or competitor-superiority effect is claimed. Any study/telemetry needs its appropriate privacy process; this package adds no child analytics, accounts or external service.

## Repository handling

The development server had regenerated Next's tracked route-type imports while opening the app. That generated-only difference was restored to the inspected Git baseline; no application change belongs in this documentation commit. Screenshots/browser traces/builds remain local ignored/temporary artifacts. Inspect staged files and recognized secret patterns, then follow the repository's existing automatic commit/push rule. Deployment is not part of synchronization.
