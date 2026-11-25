# Developer Preview verification

Local checks on 25 November 2026. The working tree already contained the earlier learning-entry systems; this verification also checks those changes before the repository's automatic synchronization. No real learner database, content approval or deployment was changed.

## Executed checks

| Command/check | Result |
| --- | --- |
| `bash scripts/tool.sh node tests/check_developer_preview.cjs` | **PASS, 2 groups.** Lesson/review/family/pronunciation/SRS/session writers are inert, including the exit transition; normal saving and completion resume afterward. |
| `bash scripts/tool.sh python3 scripts/check_all.py` | **PASS.** Full standalone builds, content/HTML/source checks, JavaScript syntax and existing behavior tests, including the new preview guards. Frozen course hashes remain unchanged after reversing only the recorded preview hooks. |
| `bash scripts/tool.sh npm test` | **PASS, 35 tests in 9 files.** Current web/package and earlier entry-system tests. |
| `bash scripts/tool.sh npm run typecheck` | **PASS.** Web TypeScript. |
| `bash scripts/tool.sh npm run build` | **PASS.** Next.js production build, including web entry link and existing dynamic lesson route. The final preview-only public asset was subsequently refreshed by the packaging command and checked in the browser. |
| `bash scripts/tool.sh python3 scripts/prepare_web_preview.py` | **PASS.** Builds checked public runtime/review files and copies them into the Next.js preview. Generates no native approvals. |
| `bash scripts/tool.sh dotnet test PolyglotCore.sln --no-restore --disable-build-servers -m:1` | **PASS, 23 tests.** Rechecks the earlier unsynchronized preference/parent APIs; preview introduces no API or schema change. |
| `bash scripts/tool.sh npm run test:postgres` | **PASS, 23 tests** on an isolated PostgreSQL 16 cluster, including migrations and draft import. No live database used. These repeat the API cases on PostgreSQL, not 23 new distinct tests. |
| Browser matrix | **PASS, 78 checks** across desktop Chrome and phone-sized Chromium. Includes all 27 normal playable word-path lessons, 10 preview checks and existing SRS, companion and entry-system journeys. |
| Final layout rerun | **PASS, 10 preview checks**, repeated after the phone selector sizing adjustment. These repeat the preview cases above; they are not ten additional unique cases. |

Browser command:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 PLAYWRIGHT_CHANNEL=chrome \
  bash scripts/tool.sh node node_modules/@playwright/test/cli.js test \
  tests/e2e/developer-preview.spec.ts tests/e2e/word-path.spec.ts \
  tests/e2e/path-srs.spec.ts tests/e2e/bear-redesign.spec.ts \
  tests/e2e/entry-systems.spec.ts tests/e2e/learner.spec.ts \
  --output .tools/developer-final-browser-artifacts --workers 2
```

The new preview cases visit every one of the 31 word-path nodes, inspect 42 Fidäl families plus Gentle review in the selector, directly open tasks/writing/checkpoints and missing-content outlines, finish a preview checkpoint, compare nonempty saved progress byte for byte, preserve an unrelated storage key and unfinished normal lesson, restore real locks and check cross-unit flag navigation. Existing browser cases cover normal gated progression, spaced reviews, saving failures, companion behavior and account-free entry flows. Desktop Chrome and phone-sized Chromium are tested; no physical iPhone or assistive-technology certification is claimed.

Desktop and phone preview screenshots were inspected. A final scoped `box-sizing` adjustment keeps the phone selectors inside their panel. Normal course content, review records and media approval statuses are unchanged.

## Problems caught

- The initial loading banner discarded the requested deep-link lesson before the real catalogue was registered. It now preserves the requested ID until choices exist. Both affected desktop/phone cases passed a targeted rerun before the final full matrix.
- Existing source-preservation checks rejected the new, explicitly requested Unit 1/shared hooks. Original content hashes were kept frozen; an exact reversible fixture records only these preview changes, including the generated inline history-library copy. Binary assets pass through untouched. Normal Unit 1 and word-path behavior tests still run independently.
- Pure VM harnesses do not provide browser URL/DOM APIs. The optional preview controller safely declines initialization there, while actual browser behavior is tested separately.

## Boundaries

The flag is temporary and URL-scoped. Exiting removes it; no completed record or permanent unlock is manufactured. This is public path inspection, not a backend permission bypass. Units needing recordings, rubrics or native-authored sentences expose their real outlines and missing-content notices; they do not become invented language lessons.

Reviewed audio, authentic stroke instruction and other source-material gaps remain unchanged. Real-device/VoiceOver/TalkBack validation remains separate. Browser screenshots/traces and test logs stay in ignored `.tools/` directories. The app remains local at port 3000; neither deployment nor Apple submission is part of this task.
