# Word-routine validation

Local implementation checked on 25 November 2026 against `fcce293`. See the [audit and rationale](LEARNING_VARIETY.md). No commit, push, publication, deployment or Apple submission is part of this task.

| Check | Actual result |
| --- | --- |
| `bash scripts/tool.sh node tests/check_word_routine.cjs` | **PASS, 7 groups.** Teaching/building precedes hidden-model tasks; targets vary where possible; all sixteen introductions retain exact source focus; objectives/prerequisites exist; source objects/approval status are not mutated; missing/altered/duplicate/oversized source groups and unsupported modalities are blocked. |
| `bash scripts/tool.sh python3 scripts/check_all.py` | **PASS.** Full standalone build, content/HTML/local-link guards, syntax checks and existing behavior/preservation checks, plus the new routine checks. This includes normal Unit 1 behavior, review scheduling, Stories and mascot source baselines. |
| `bash scripts/tool.sh npm test` | **PASS, 35 tests in 9 files.** Existing web and package tests. |
| `bash scripts/tool.sh npm run typecheck` | **PASS.** Existing web TypeScript configuration. |
| `bash scripts/tool.sh npm run build` | **PASS.** Final Next.js production build, including its existing dynamic lesson route. |
| `bash scripts/tool.sh python3 scripts/prepare_web_preview.py` | **PASS.** Packages 102 existing/new runtime and review files, checks links and copies them into the web preview. No content approval added. |
| Browser matrix below | **PASS, 48 checks.** Four new routine cases and twenty existing word-path/SRS/developer-preview cases, each in desktop Chrome and phone-sized Chromium. Includes playing all 27 normal lessons, unlock/replay/review behavior, hints, save failures and preserved developer-mode isolation. |
| Formatting / preservation | **PASS:** scoped Prettier, documentation links and diff whitespace checks; pre-edit hashes verify **227 tracked protected files** unchanged. Unit 1/shared assets, review data, canonical curriculum, source versions, scheduler, backend and mobile files remain byte-for-byte unchanged. |

Browser command:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 PLAYWRIGHT_CHANNEL=chrome \
  bash scripts/tool.sh node node_modules/@playwright/test/cli.js test \
  tests/e2e/word-routine.spec.ts tests/e2e/word-path.spec.ts \
  tests/e2e/path-srs.spec.ts tests/e2e/developer-preview.spec.ts \
  --output .tools/word-routine-final-artifacts --workers 2
```

The new cases cover the real model → build → read → entry flow, wrong construction/reading/text responses, stable key positions, specific correction, partially typed resume, keyboard Enter, native composition guards, form-key access, missing-module reload recovery, future content blocks, unchanged check gates and no delayed-retention credit for same-visit entry. Developer inspection performs the same task without changing saved progress. **A final focused rerun passed all 8 routine checks**, explicitly using touch taps in the phone project and keyboard activation on desktop, against the restarted completed build. These repeat the routine cases above; they are not eight additional unique cases.

Actual desktop and phone recall screenshots were inspected: Ethiopic text renders, feedback remains readable, controls fit without horizontal overflow and keyboard focus is visible. These are browser/viewport checks on this Mac, not physical iPhone/Android, VoiceOver/TalkBack, a complete contrast/zoom audit or observed learner testing.

## Issues caught during verification

- The first proposed retrieval ordering revisited the same target in adjacent responses. The pure sequence check caught it; reading and entry now use separate rounds so multiple-word groups revisit other targets first.
- A new browser assertion ambiguously selected both the next-action button and the corresponding lesson node. The assertion now selects the path node; the actual flow had completed correctly.
- One final focused run was interrupted by building into the directory used by the local test server. The test runner/server were stopped and restarted from the completed build before repeating verification. This was test orchestration, not learner progress loss.

## Remaining limits / owner input

The 31 dictionary-derived word/picture candidates remain pending qualified native Tigrinya review. Reviewed native recordings and spoken directions, phonetic/scoring criteria, teacher stroke data/rights and native-authored sentence/dialogue content are still missing. Listening, speaking evaluation, grammar and communication activities remain blocked rather than silently replaced with visual success.

The additional steps may increase session length or input demands. A native reviewer and observed beginner/heritage-learner pilot should establish content suitability, instruction comprehension, support needs and delayed transfer before efficacy or independent child-use claims. No retention improvement, validated placement or child-usability result is claimed. Backend/database tests were not repeated because no backend or schema file changed; no live service was started. Cold offline reload and physical assistive-technology checks remain unverified.

Test artifacts and protected-file snapshots remain under ignored `.tools/`. Source files are left local and uncommitted as requested.
