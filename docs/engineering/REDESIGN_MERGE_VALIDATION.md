# Redesign merge validation

Date: 2026-11-26. Scope: merge PR [#8](https://github.com/luulama/Tigrinya-Language-App/pull/8), `redesign/world-class-ux` at `c9f438535f0845509ff28e5105a67d56d5a205f8`, into `main` at `fdc4511471d611c9c1584cdf36192e0dadd69dd0`. Preserve both histories; unrelated dependency branches are outside this merge.

## Integration

- Retain the incoming warm visual system, responsive navigation, learning-path presentation, onboarding, first practice, Mele companion, parent summaries and reusable icons.
- Resolve the `learning.tsx` conflict by retaining main's opt-in published-library loading and search state inside the redesigned page. Preserve main's preview preparation and tool-wrapper fixes.
- Reproduce the incoming branch's phone navigation failure: Next.js's development corner indicator intercepts the bottom Learn tab. Set `devIndicators: false`; development compilation/runtime error overlays remain enabled. Tests use ordinary clicks, without forced interactions.
- Prevent Strict Mode's initial effect replay from moving keyboard focus in onboarding and first practice. Focus headings only when the actual step or pause state changes. Add root Strict Mode regression coverage for both components.
- Self-host the redesign's Fraunces, Source Sans 3 and Noto Sans Ethiopic WOFF2 files, with upstream SIL OFL licenses and a source/hash manifest. No live Google Fonts request or build-time font fetch is needed. The three assets total 294,220 bytes. Declared Unicode ranges cover all 293 source forms; this is not an exhaustive glyph or typography certification.
- Reuse the existing bear SVG as the site icon, fixing an observed favicon 404. Clarify that guide-language selection is a visit preference and that guides currently use English. Correct the path's group count and chapter labels without changing curriculum content.

## Validation performed

Commands run from the repository root using the repository's Node/.NET tool wrapper:

| Check | Result |
| --- | --- |
| `bash scripts/tool.sh npm run typecheck` | Passed |
| `bash scripts/tool.sh npm run test` | 37 passed in 9 files |
| `bash scripts/tool.sh npm run build` | Passed; Next.js production build, dynamic `/learn/[id]` retained |
| `bash scripts/tool.sh dotnet test PolyglotCore.sln --no-restore` | 23 passed; no production database used |
| `bash scripts/tool.sh python3 scripts/check_all.py --node node` | Passed |
| `python3 docs/learning-path/build_inventory.py --check` | Passed |
| Targeted development browser checks, repeated three times at desktop and phone sizes | 24 passed |
| Full production browser suite at desktop and phone sizes | 318 passed, 4.9 minutes |

Development command:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3007 PLAYWRIGHT_CHANNEL=chrome \
  bash scripts/tool.sh npm run test:e2e -- \
  tests/e2e/learner.spec.ts tests/e2e/entry-systems.spec.ts \
  --grep 'learner can reach|keyboard next action|redesign fonts|visual path' \
  --repeat-each=3 --workers=2 \
  --output=/private/tmp/tigrinya-redesign-dev-final
```

Production command, against `PORT=3005 bash scripts/tool.sh npm run start --workspace @polyglot/web`:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3005 PLAYWRIGHT_CHANNEL=chrome \
  bash scripts/tool.sh npm run test:e2e -- --workers=2 \
  --output=/private/tmp/tigrinya-redesign-merge-production
```

The suite includes all 20 games, the 27 existing path lessons, review/resume, consent-controlled storage, blocked media, keyboard/reduced-motion flows and new navigation/font regressions. New tests verify local font loading, no Google Fonts requests, no console/page errors on the tested entry flow, preserved source links and locked future content. This does not establish absence of errors on every possible route or environment.

Manually inspected the running production Learn page and first lesson in Safari. Completed the visual drawing alternative, an incorrect answer, retry, recognition, hidden-model recall and truthful recap. Inspected saved desktop/phone test screenshots, including the phone path and drawing controls. These are engineering checks and viewport emulation, not child usability research or physical iPhone testing.

## Preservation and limits

- SHA-256 comparison against the pre-merge baseline: all 270 tracked files under `unit-01-fidel-foundations`, `unit-02-first-words`, `shared`, `stories/content`, `stories/assets`, `Product-Bible`, `apps/api` and `apps/mobile` are unchanged.
- No learner data migration, fabricated completion, content approval, new account, tracking or production API/database connection is introduced. Pending native-speaker review, recordings, pronunciation scoring and stroke-order approval remain pending.
- There is no root lint script; TypeScript, tests, content checks and whitespace checks provide the available validation. Production database integration, physical devices and learning effectiveness are not certified by this merge.
- GitHub CI must evaluate the pushed merge independently. Local passing results do not assert that remote CI has completed. Deployment remains a separate manual workflow and is not requested by this merge.
