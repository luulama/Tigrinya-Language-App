# Engineering workflow and application validation

**26 November 2026 · starting commit `96d6896` · scoped maintenance and verification.**

## What was changed

- Saved the owner's engineering workflow in the root agent instructions: inspect first, reproduce root causes, run typecheck/tests/build, start and inspect the app, report accurately, then commit/push verified work.
- Added root `predev` and `prebuild` hooks using the existing preview-preparation command. Normal development and production builds now prepare the source-bound standalone learning assets automatically.
- Changed the mascot export subprocess to use the existing workspace tool wrapper. Direct Python preview preparation now works on this Mac without global Node on `PATH`.
- Disabled the optional published-library query while its Learn-page disclosure is closed. Opening it enables the existing query; closing/reopening preserves search text and cached component state. Other library screens retain their existing default behavior.
- Extended the existing learner browser suite with a regression that checks request timing, actual disclosure use, successful empty-library rendering, preserved search, console/runtime errors and default no-storage behavior.

## Why it was changed

Two issues were reproduced before their fixes.

1. **Environment/build:** the documented `python3 scripts/prepare_web_preview.py` failed with `FileNotFoundError: node` inside mascot export. Node is available through the repository's existing `scripts/tool.sh` selection, not this shell's global path. Reusing that wrapper fixes the subprocess boundary; changing the mascot artwork or the web framework would not address the cause. Automatic preparation also prevents a normal root build from silently omitting or serving stale learning previews.
2. **Data/request timing:** visiting `/learn` fetched `/api/lessons` even while Published lessons was closed. The mounted query did not know whether the optional disclosure was open. The new test failed against the previous production build with an unexpected initial API request, then passed after the query was explicitly enabled by the disclosure state. The component remains mounted so closing it does not discard the learner's search text.

The locked vision, Unit 1, standalone unit/shared files, source language/review records, progress formats, scheduler, backend and mobile code remain unchanged. No dependency, account, tracking service, database migration, pronunciation model or content approval was added.

## Files modified

| File | Purpose |
| --- | --- |
| [AGENTS.md](../../AGENTS.md) | Durable engineering verification and reporting instructions |
| [package.json](../../package.json) | Reuse preview preparation before root dev/build |
| [build_mascot.py](../../scripts/build_mascot.py) | Resolve Node through the existing tool wrapper |
| [learning.tsx](../../apps/web/components/learning.tsx) | Enable the published-library query only while explicitly open |
| [learner.spec.ts](../../tests/e2e/learner.spec.ts) | Actual desktop/phone request, interaction, state, console and privacy regression |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Explain automatic preparation and direct Python use |
| This validation record | Results, limitations and next actions |

## Tests and runtime verification

Commands ran from the repository root. The wrapper selects the installed workspace Node 24 and .NET 10 tools. Required local process/socket access was used for Next.js compilation, .NET tests and browser/server processes; no production database or external account was started.

| Check | Result |
| --- | --- |
| `bash scripts/tool.sh npm run typecheck` | Pass |
| `bash scripts/tool.sh npm run test` | Pass: 35 tests in nine files |
| `bash scripts/tool.sh npm run build` | Pass: automatic preparation, optimized Next.js compilation, TypeScript and all generated routes; `/learn/[id]` retains dynamic rendering |
| `bash scripts/tool.sh dotnet test PolyglotCore.sln --no-restore` | Pass: 23 tests, using the default isolated test setup; no live PostgreSQL run |
| `bash scripts/tool.sh python3 scripts/check_all.py --node node` | Pass: full standalone generation, content/source gates, Unicode, privacy/storage, writing, scheduler, progression, game, mascot and story checks |
| `python3 tests/check_first_lesson.py` | Pass: four first-practice content/media-contract tests |
| `python3 docs/learning-path/build_inventory.py --check` | Pass: existing design inventory and audited source identities remain valid |
| Direct Python preparation with `PATH=/usr/bin:/bin:/usr/sbin:/sbin` | Pass after explicitly confirming no global Node exists on that path; all 102 packaged runtime/review files and their HTML targets resolve |
| `PORT=3006 bash scripts/tool.sh npm run dev` | Pass: predev preparation and development startup; server stopped after targeted verification |
| Targeted new browser test against development server | Pass on desktop and emulated phone; no initial library request, successful explicit loading, search retained, no browser console errors or uncaught page errors in that tested flow, no local storage writes |
| `PORT=3005 bash scripts/tool.sh npm run start --workspace @polyglot/web` | Pass: loopback-only production server started and served the built app |
| Full production browser command below | Pass: **314 tests**, desktop and emulated iPhone, zero failures in the final sequential run |
| Python syntax, JSON scripts, formatting and `git diff --check` | Pass |

Final complete browser run:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3005 PLAYWRIGHT_CHANNEL=chrome \
  bash scripts/tool.sh npm run test:e2e -- --workers=2 \
  --output=/private/tmp/tigrinya-engineering-final
```

The suite exercises onboarding, first practice, all 27 playable path lessons and unlock/revisit behavior, opt-in storage, review, text input/composition, drawing alternatives, blocked media/content, Mele/reduced motion, Stories and the 20 games' functional/error/integration cases in both browser projects. Test-only approved-content/audio/stream fixtures remain isolated tests; they do not approve or replace learner content.

Manual desktop review used native Safari: the production home rendered, the first lesson completed through the visual alternative, a deliberately incorrect answer, correction, retry and a truthful supported-practice recap; onboarding screens and Mele rendered; the development Learn page kept its existing navigation and explicitly opened the published-library panel. The actual missing-backend request was not claimed as a successful live-library response. Successful library data/error-free console behavior was checked through the isolated browser regression response, not a configured live service.

Phone onboarding and writing screenshots from the final production test run were visually inspected. The browser assertions additionally check narrow layouts, keyboard controls and reduced motion. This is phone emulation and screenshot review, not physical iPhone/Android, VoiceOver/TalkBack or observed child-usability validation. The new console assertion covers the changed Learn flow; it is not a claim that every optional live-service route has a clean console without its required services.

### Failures distinguished from application defects

- The first sandboxed Next.js build and .NET run were denied local worker sockets. The .NET tests passed with the required process/socket access. Turbopack had also retained the failed evaluation in its generated cache: after confirming loopback binding worked, that cache was preserved under `/private/tmp/tigrinya-turbopack-cache-20261126034828`, and a fresh build passed. No bundler replacement, authentication change or learner-data deletion was used.
- An initial browser run reported 310 passes and two missing trace-file errors because a concurrent targeted run reused its output directory. That test orchestration mistake was corrected by running the final suite sequentially with a dedicated output directory. All 314 final cases passed; the failed artifact run is not counted as a pass.
- The new published-library regression genuinely failed on the earlier application behavior before the query fix. It subsequently passed on development and in the final production suite.

## Risks

- Root dev/build now run the existing Python/Bash preparation step; both are already documented project prerequisites. Preparation failure intentionally stops startup/build instead of silently shipping missing assets.
- The new query default remains enabled for existing library callers. Only Learn's optional disclosure controls its own query. A request already started before closing may finish normally; no cancellation or new persistence contract is claimed.
- Live sign-in, published backend libraries, service credentials, PostgreSQL production behavior and physical-device media/assistive technology were not configured or certified. Intentional access to an unavailable service can still produce its existing network/recovery state.
- Some phone onboarding action labels wrap over several lines. Existing touch targets remain usable in automated checks, but this deserves a focused layout/co-use review. No unrelated redesign is included here.
- All pending Tigrinya content, native audio, teacher stroke instructions and cultural review gates remain pending. Passing software checks does not establish pronunciation accuracy, independent child use or learning effectiveness.

## Recommended next actions

**RECOMMENDATION — MVP:** use the root dev/build commands and the recorded verification workflow for subsequent changes. **WHY:** they now package the working learning experience and require runtime evidence. **RISKS:** bypassing lifecycle hooks by invoking a workspace command directly can omit preparation on a clean checkout. **NEXT ACTION:** keep the existing CI/content checks and run browser suites sequentially or with distinct output directories.

**RECOMMENDATION — MVP:** complete one native-reviewed oral-to-literacy pilot before broadening course claims. **WHY:** reviewed recordings and writing models remain the primary educational release gap. **RISKS:** more software does not supply valid language evidence. **BETTER ALTERNATIVE:** a smaller fully reviewed target set rather than more unreviewed lessons. **NEXT ACTION:** assign qualified reviewers and recording/handwriting contributors to the [bounded learning-path design](../learning-path/README.md).

**RECOMMENDATION — V1:** evaluate the wrapped mobile actions with intended learners, then simplify the specific responsive layout. **WHY:** a shorter visible next action may reduce scrolling and reading demands. **RISKS:** changing shared layout without checks could disturb protected previews. **NEXT ACTION:** scope the entry-screen change separately, preserve Unit 1 and verify real phone/keyboard access and learner interpretation.

No deployment, app-store submission, service activation, secret-file change or learner-data deletion was performed.
