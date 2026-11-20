# Testing strategy

Domain tests exercise workflow transitions, scope completeness, self-approval rejection, immutable published snapshots, payload validation and scheduling semantics. API tests run through WebApplicationFactory and a relational provider, checking authentication/roles, private evidence isolation, real content workflows, server-side answer grading, replay fingerprints and database constraints. A test-only authentication handler exists only in the test assembly and cannot be selected by production configuration.

By default tests use SQLite in memory with real foreign keys and indexes. Set POLYGLOT_TEST_POSTGRES only for an explicitly dedicated database ending in _test. The local PostgreSQL harness creates a fresh PostgreSQL 16 cluster, applies EF migrations, imports all sourced drafts, runs the API tests and stops the cluster. CI uses a separate PostgreSQL service. Neither path uses a production database or invents approved learner seed data.

Vitest exercises SM-2 and the actual FSRS library, version isolation, assistance, same-day repetitions, queue eligibility, Unicode segmentation, safe asset paths, approval predicates and answer/retry components. Component test mocks isolate network responses only; they are not product implementations. Playwright checks actual desktop/phone pages, the existing Fidäl journey, consent-controlled preference persistence, keyboard dialog behaviour and unavailable-account recovery.

The existing Python/CJS suite still checks all corpus, review, writing, navigation and product-contract invariants. Keep it passing when editing the new monorepo. Test a code defect at the layer where it occurred, then rerun affected integration checks. Do not describe a passing build as native language review, a validated retention model or a full accessibility certification.

Game Garden adds twenty offline source-backed activities. `tests/check_game_garden.cjs` validates all twenty content contracts and 35 configurations per game. `tests/e2e/game-garden.spec.ts` runs separate functional, edge-case and integration cases for every game in both browser projects. Functional cases complete and replay each game; edge cases check corrections/repeated attempts, missing source data and recovery, plus drawing/keyboard and composing-input conditions where relevant. Integration cases launch through the actual unit, check layout bounds, touch targets, keyboard entry, model help and return navigation. This is 120 game-pass cases plus four shared navigation/load-error cases across desktop and phone emulation.

To test a separately started local production build without reusing the server on port 3000:

```sh
python3 scripts/prepare_web_preview.py
bash scripts/tool.sh npm run build
PORT=3003 bash scripts/tool.sh npm run start --workspace @polyglot/web
# In another terminal; omit PLAYWRIGHT_CHANNEL when using Playwright's installed Chromium.
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3003 PLAYWRIGHT_CHANNEL=chrome bash scripts/tool.sh npm run test:e2e
```

`PLAYWRIGHT_BASE_URL` selects an already running test server and disables Playwright's automatic dev-server startup. Without it the original port-3000 development workflow is unchanged. The game content is always pending-review preview material. Tests do not promote it, create accounts or write child practice histories.

Before production learner release, perform real Entra sign-in/role testing, Blob upload/read/hash tests against the configured service, image builds, private Azure PostgreSQL connectivity, migration/backup recovery, real IME/VoiceOver/stylus tests, observed child/adult usability and qualified content/media review. These remain meaningful external-environment checks, not assertions that can be made true by adding test fixtures.
