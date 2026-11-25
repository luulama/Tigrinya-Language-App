# Animation reference package

This is runnable, isolated reference code for the proposed motion boundary. It is **not imported by the live Next.js/standalone/mobile app**. No dependency, account, API, child telemetry or microphone permission is added. The lab uses the project's existing original bear posters as a Mele pose study; it supplies no `.riv`, native speech, verified stroke order, pronunciation score or complete authored walk cycle.

## Included behavior

- `motion.ts`: typed ten-state view, stale-session/revision/sequence protection, capture-priority rule, actual-model capability gate, bounded transform/opacity cues, AbortSignal cleanup and reviewed media-clock segment selection.
- `MeleStage.tsx`: semantic result independent of optional artwork/motion, failed-image fallback and a live OS reduced-motion hook. Quiet/Still view cannot hide the result or disable the next action.
- `App.tsx`: explicit pose explorer and synthetic event/capability checks; all fixtures are design data, never approved Tigrinya. It has no speech capture or score pipeline.
- `tokens.css`: generated from [motion tokens](../motion-tokens.json); do not edit its values independently.
- Vitest and Playwright configurations reuse the repository's installed tooling. Production libraries remain unchanged.

## Run and verify

From the repository root, after its documented dependency setup:

```sh
python3 -B docs/animation/reference/check_package.py --write-tokens
bash scripts/tool.sh node node_modules/typescript/bin/tsc -p docs/animation/reference/tsconfig.json
bash scripts/tool.sh node node_modules/vitest/vitest.mjs run --config docs/animation/reference/vitest.config.ts
python3 -B docs/animation/reference/check_package.py
bash scripts/tool.sh node node_modules/@playwright/test/cli.js test --config docs/animation/reference/playwright.config.ts
```

Open the development lab separately:

```sh
bash scripts/tool.sh node node_modules/vite/bin/vite.js --config docs/animation/reference/vite.config.ts
```

Then visit `http://127.0.0.1:4175`. The server binds only loopback, stops with Ctrl-C and does not start the backend/database. Browser tests start/stop their own server on that port and refuse an occupied one. A sandbox can require local socket/browser execution permission. Browser artifacts go to the repository's ignored `.tools/motion-browser-artifacts` directory.

## Build and size checks

Use a new temporary output directory for each command; these builds do not replace the web build:

```sh
bash scripts/tool.sh node node_modules/vite/bin/vite.js build --config docs/animation/reference/vite.config.ts --outDir /private/tmp/YOUR_NEW_MOTION_LAB_OUTPUT
bash scripts/tool.sh node node_modules/vite/bin/vite.js build --config docs/animation/reference/motion-lib.config.ts --outDir /private/tmp/YOUR_NEW_MOTION_CORE_OUTPUT
```

The uppercase paths are instructions to select a fresh local artifact directory, not app configuration or a backend address. Do not reuse an existing directory with valuable files. Report whole-lab JS separately from incremental motion-core JS, and compressed transfer separately from memory. [Validation](../VALIDATION.md) records the exact checks actually completed.

## Adoption boundary

After the documented design/content process, bind the view to existing domain/media events, import tokens into a small client boundary, reuse current content approval gates and keep the static surface. Pass real application feedback text; the reference reducer never marks answers correct or writes progress. `nativeModelReady` and an alignment's `reviewed` flag are view contracts populated by the real verification layer, not client-side evidence of authenticity.

Application intent sequences are scoped monotonic identifiers; retry the same semantic event with the same sequence. Capture scope when registering asynchronous callbacks. Replace the scope on target/version/revocation, abort the old controller and do not give an obsolete callback a fresh sequence in the new task. Actual capture/audio adapters must release their own tracks/contexts; changing a Mele pose cannot perform that cleanup.

Use the existing script/font/IME and writing mechanisms when integrating. Language-bearing assets, native timing and human articulation remain reviewed content. Rive and full catalogue sequences need their own implemented adapters and acceptance tests; no adoption is implied by running this lab.
