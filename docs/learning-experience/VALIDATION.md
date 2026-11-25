# Learning entry systems — verification record

Checked locally on **25 November 2026**, from clean repository baseline `c1b716c`. The [specification](README.md) maps all fifteen requested deliverables to the implemented increment and explicitly separates future release work. No live database migration, deployment, Apple submission or content approval occurred.

This records the original entry-system checkpoint. The subsequent [Developer Preview verification](../engineering/DEVELOPER_PREVIEW_VALIDATION.md) completes the formerly blocked mascot browser checks and rechecks the API/entry systems. Its explicitly requested temporary Unit 1 hooks preserve the original normal sequence and content; the original byte-level preservation statement below describes the earlier checkpoint.

## Completed checks

| Command/check | Actual result and scope |
| --- | --- |
| `bash scripts/tool.sh npm test` | **PASS: 35 tests in 9 files.** Existing package/web tests plus first-practice transitions, independent skill axes, honest visit recap, pause/focus, keyboard alternative, real playing-event bookkeeping, media failure, delayed-load race, optional memory failure and deferred parent queries. Synthetic media fixtures are not native recordings. |
| `bash scripts/tool.sh npm run typecheck` | **PASS.** Web TypeScript with the repository configuration. |
| `bash scripts/tool.sh npm run build` | **PASS.** Next.js 16.4.6 production build, TypeScript, 22 static pages and the existing dynamic `/learn/[id]` route. Final build includes compact phone layout and larger quiet control. No dynamic whole-project file-tracing warning remains. |
| `bash scripts/tool.sh dotnet test PolyglotCore.sln --no-restore --disable-build-servers -m:1` | **PASS: 23 tests, 0 skipped.** Compiles the .NET solution; local SQLite/API suite includes five new preference/privacy/summary tests. |
| `bash scripts/tool.sh npm run test:postgres` | **PASS: 23 tests.** Fresh isolated PostgreSQL 16 cluster; migrations, draft import, relational/API checks. Test-only generated credentials; no existing database or `.env` used. Cluster stopped by the harness. These are the same 23 tests on another database, not 23 additional distinct tests. |
| EF `migrations script --idempotent` | **PASS.** Generated `infrastructure/database/migrations.sql` with the additive preferences table. Design-only connection has port 1; generation does not connect/apply a migration. The real application test above applies it only in a disposable test cluster. |
| `python3 -B tests/check_first_lesson.py` | **PASS: 4 tests.** Current pending data, wrong language/script/direction, exact-byte integrity, review/provenance requirements, remote/traversal rejection. Synthetic fixtures do not change review records. |
| `python3 scripts/build_first_lesson.py --check` | **PASS: pending.** Generated manifest matches the current source. Separate Node SHA-256 check confirms Python/JavaScript serialization revisions agree. No playable native audio was enabled. |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 PLAYWRIGHT_CHANNEL=chrome bash scripts/tool.sh node node_modules/@playwright/test/cli.js test tests/e2e/entry-systems.spec.ts tests/e2e/learner.spec.ts --output .tools/entry-browser-artifacts --workers 1` | **PASS: 22 checks.** Eight new cases plus three existing cases, each in desktop Chrome and iPhone-sized Chromium. Covers real start/feedback/recap/parent SPA flow, no anonymous API/localStorage activity, reload clearing, pointer cancellation/drawing/undo/text alternative, independent heritage choices, quiet/reduced motion/break, memory failure, keyboard/back, familiar-reader word navigation and 320px no-overflow/visible-next action. Viewport emulation is not a physical iPhone test. |
| `bash scripts/tool.sh node unit-01-fidel-foundations/check_unit1.cjs` | **PASS: 16 existing flow checks**, including all 42 sourced activities, introduction, matching, family checks, corrections and writing. |
| `bash scripts/tool.sh node tests/check_fidal.cjs` | **PASS: 22 existing checks**, 293 forms, Unicode/graphemes/input/search, writing/cancellation, reviewed guide/audio gates. |
| `bash scripts/tool.sh node tests/check_mascot.cjs` | **PASS: 14 existing groups**, nine bear expressions, media/guide gates, reduced motion, original-source preservation. |
| `python3 -B tests/check_project.py` | **PASS.** Existing standalone HTML/local links/assets/ARIA/privacy/style guards. These source checks are not an accessibility audit of the new React screens. |
| `python3 -B scripts/check_product_spec.py` | **PASS.** Existing schemas, curriculum graph, relational examples, invalid-record guards and references. |
| `python3 -B docs/production/reference/check_package.py` | **PASS.** Existing twenty-deliverable blueprint and locked vision digest. |
| `python3 -B docs/animation/reference/check_package.py` | **PASS.** Existing animation contracts/tokens/local links and locked vision digest. |
| Prettier on changed web TypeScript/TSX/CSS/manifest and browser tests | **PASS**, scoped formatting only; no repository lint command exists. C# compilation is covered by the solution tests. |
| Git preservation | **PASS:** `git diff --quiet c1b716c -- unit-01-fidel-foundations unit-02-first-words shared/content-review Product-Bible`; no tracked changes in those trees. Locked vision SHA-256 remains `8dc45861ef7edcd1f20db25ac07a29372659e854b261f88a2b2b6fbdccf865af`. |
| Visual inspection | Actual desktop starting-plan and phone writing screenshots inspected. Reduced phone header/padding and bounded drawing area; controls remain readable. Full-page screenshots taken after scrolling can include the offscreen fixed skip-link capture; this is not evidence of a completed AT audit. |

The local production web server is left at `http://127.0.0.1:3000`; first practice is `/first-lesson`. This starts only Next.js, not the ASP.NET service or a database. Browser artifacts and test logs stay under ignored `.tools/` paths.

## Problems found and corrected

- A no-preferences GET returned a 200 response with no JSON body. It now returns literal JSON `null`, so optional loading and API clients can handle the empty state.
- A dynamic media-file lookup made Next.js trace too broad a server output. A deterministic build-time media manifest now checks actual allowed bytes, provenance and source revision; the runtime uses static imports and fails closed on mismatch.
- Concurrent API test factories raced when seeding the same language row in PostgreSQL. Test-only initialization now serializes the shared seed; the complete PostgreSQL suite was rerun successfully.
- An account load could overwrite choices changed while waiting. Newer visit choices are preserved; unmounted requests are aborted and version conflicts remain recoverable.
- Familiar readers' default pace previously sent them back to first-form practice regardless of the recommendation. The primary link now follows the chosen reading/word starting point without awarding proficiency.
- Phone writing had unnecessary scrolling. Scoped entry layout now uses a compact header, smaller companion and bounded pad, with readable controls and ordinary scrolling retained.

## Remaining checks and release gates

- At the original checkpoint, an additional `tests/e2e/bear-redesign.spec.ts` run was blocked by automatic approval review due to an account usage limit. **It has since passed in both browser projects** as part of the later 78-check matrix. Its web-only label is Mele; standalone assertions retain Neri.
- The original checkpoint left the changes local. Subsequent checks and the repository's required synchronization are recorded with the Developer Preview work; use Git history for the actual commit/push status.
- The current source still has 293 pending form/audio/handwriting records and no approved native recordings. The new flow is an explicitly limited visual preview. Qualified Tigrinya review, licensed audio, spoken directions and physical media QA are required for an independently usable first pronunciation lesson.
- No teacher stroke sequence, handwriting quality score, calibrated placement exam, speech-production assessment or AI relationship system is implemented or claimed.
- Live Entra sign-in, real verified-family data, child consent operations, legal/privacy review, retention/export/deletion operations and cloud browser journeys remain unverified. API tests use isolated identities and fixtures, never real children.
- Physical iPhone/Android, Safari/WebKit for these new flows, stylus, real Ethiopic IME, VoiceOver/TalkBack, full zoom/contrast/accessibility audit and observed child/adult usability remain to be tested.
- The tests do not establish a universal 60-second duration, learning retention, fluent reading, pronunciation improvement or long-term emotional benefit. Proposed pilot targets in the specification are not measured results.

No dependency, tracking collector, paid service, live backend URL, production identity or native approval was invented. Other IDE projects and their environment files were left untouched.
