# Stories implementation and verification

Date: 2026-11-21. Scope: the independent Stories library and reader. This is a local draft preview, not a learner release or deployment.

## Delivered behavior

- Twenty complete original Tigrinya narratives, eight paragraphs each (160 paragraphs total), with twenty dedicated original local SVG illustrations. These are full texts, not summaries or empty cards.
- A separate **Stories** destination in the web app and standalone home. Opening or finishing a story never unlocks a lesson, records review success or changes course progress.
- A focused LTR Ethiopic reader with readable paragraphs, illustrations, library/previous/next navigation, paragraph position, explicit marked-read state and read-later bookmarks.
- Search, shelves, text sizes, evening view, keyboard controls, reduced-motion support, small-screen layouts and descriptive image-failure recovery.
- In-tab state by default. Optional device saving uses only `tigrinya.stories.v1`. Corrupt/unsupported data is preserved; failed saves keep reading usable and retain the previous saved copy. Changed story revisions retain a bookmark without retaining obsolete completion or paragraph position.
- Future verified recordings can use the null story/paragraph audio slots. No audio, speech synthesis, microphone, tracking, accounts or uploads were added.
- The previous API-backed reviewed collection remains available at `/stories/published`. The new original drafts are not submitted to that API or declared approved.

## Collection and illustration inventory

All titles, paragraphs and visual associations below still require independent fluent Tigrinya review. Each asset is under `stories/assets/`.

| #   | Story title     | Dedicated illustration    |
| --- | --------------- | ------------------------- |
| 1   | ድሙ ኣብ ብርሃን ወርሒ  | `cat-and-moonlight.svg`   |
| 2   | ናይ ወረቐት ጃልባ     | `paper-boat.svg`          |
| 3   | እቲ ዝጠፍአ ኮኾብ     | `lost-star.svg`           |
| 4   | ጤልን ድልድልን       | `goat-and-bridge.svg`     |
| 5   | እቲ ዝዛረብ መጽሓፍ    | `whispering-book.svg`     |
| 6   | ኣብ ትሕቲ ባሕሪ      | `under-the-sea.svg`       |
| 7   | ክንቲት ኣብ ንፋስ     | `feather-in-the-wind.svg` |
| 8   | ሓርማዝን ዑፍን       | `elephant-and-bird.svg`   |
| 9   | እቲ ንእሽቶ ዘርኢ     | `small-seed.svg`          |
| 10  | ጉዕዞ ደበና         | `cloud-journey.svg`       |
| 11  | እቲ ናይ ጎቦ ድምጺ    | `mountain-voice.svg`      |
| 12  | ኣብ ትሕቲ ወርሒ      | `moon-garden.svg`         |
| 13  | መልእኽቲ ኣብ ቅጽሊ    | `leaf-message.svg`        |
| 14  | እቲ ዝደቀሰ ኣንበሳ    | `sleeping-lion.svg`       |
| 15  | እታ ንእሽቶ ደሴት     | `little-island.svg`       |
| 16  | እቲ ናይ ጽላል ቤት    | `shadow-house.svg`        |
| 17  | ወኻርያን ደወልን      | `fox-and-bell.svg`        |
| 18  | እቲ ዝተቐደደ ካርታ    | `torn-map.svg`            |
| 19  | ስግር እቲ ጎቦ       | `beyond-the-hill.svg`     |
| 20  | ናብ ገዛ ዝመርሕ ብርሃን | `light-leading-home.svg`  |

## Files added or changed for Stories

| Area                                       | Files                                                                                                                                                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Original text and review records           | `stories/content/collection.json`, `stories/content/review.json`, `stories/STORY_REVIEW.md`                                                                                               |
| Reader and library                         | `stories/index.html`, `stories/stories.css`, `stories/core.js`, `stories/app.js`, `stories/entry.css`                                                                                     |
| Generated runtime content and original art | `stories/catalog.json`, `stories/data.js`, the twenty SVGs listed above                                                                                                                   |
| Build tools                                | Added `scripts/build_stories.py` and `scripts/build_story_art.py`; integrated Stories into `scripts/build_site.py` and `scripts/check_all.py`                                             |
| Navigation                                 | Added a separate Stories entry in root `index.html`; updated `apps/web/app/stories/page.tsx`; retained the previous published collection in new `apps/web/app/stories/published/page.tsx` |
| Verification                               | `tests/check_stories.cjs`, `tests/e2e/stories.spec.ts`, `tests/fixtures/stories-preservation.json`; added the Stories page to `tests/check_project.py`; this report                       |

Existing uncommitted learning-path, spaced-repetition and pronunciation-card work was preserved. The Stories-specific snapshot verifies all 34 existing Unit 1, shared and learning-path source files byte for byte. No Unit 1 source or lesson behavior was changed for Stories. No dependencies were added. Nothing was staged, committed, pushed, opened as a PR or deployed.

## Commands and checks

Run commands from the repository root. `scripts/tool.sh` selects the local toolchain.

| Command/check                                                                                                                                                    | Result                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bash scripts/tool.sh python3 scripts/check_all.py`                                                                                                              | Passed: content/builders, HTML/link checks, JavaScript syntax and behavior; includes twelve Stories contract checks and all 34 preservation hashes. |
| `bash scripts/tool.sh python3 scripts/prepare_web_preview.py`                                                                                                    | Passed: packages the standalone preview, including all twenty local illustrations.                                                                  |
| `bash scripts/tool.sh npm run build`                                                                                                                             | Passed: standard Next.js production build, including `/stories` and `/stories/published`.                                                           |
| `bash scripts/tool.sh npm run typecheck`                                                                                                                         | Passed.                                                                                                                                             |
| `bash scripts/tool.sh npm test`                                                                                                                                  | Passed: 16 tests in 6 files.                                                                                                                        |
| `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3006 PLAYWRIGHT_CHANNEL=chrome bash scripts/tool.sh npm run test:e2e -- tests/e2e/stories.spec.ts --workers=2 --trace=off` | Passed: all 56 Stories cases, with 28 scenarios each on desktop and phone layouts.                                                                  |
| Prettier check on new editable Stories HTML, CSS, JavaScript, source JSON, Next routes and tests                                                                 | Passed.                                                                                                                                             |
| `git diff --check`                                                                                                                                               | Passed.                                                                                                                                             |

The full production-browser regression command also passed:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3007 PLAYWRIGHT_CHANNEL=chrome \
  bash scripts/tool.sh npm run test:e2e -- --workers=2 --trace=off
```

Result: **244 passed in 2.4 minutes**, including all 56 Stories cases and the existing game, Unit 1, learning-path, spaced-repetition, pronunciation-card and regression scenarios. The local production server was started with `PORT=3007 bash scripts/tool.sh npm run start --workspace @polyglot/web`. It is bound to `127.0.0.1`; starting it did not deploy the app.

There is no configured lint command. Formatting, TypeScript, JavaScript syntax and project validators were run instead; no lint result is claimed.

The Stories browser checks open every narrative, compare every rendered paragraph with its source, load each real SVG, mark it read and navigate back. Additional checks cover route separation, Ethiopic title search, empty shelves, bookmark removal, opt-in persistence/resume, course-key isolation, previous/next/browser-back navigation, missing images, missing runtime data, corrupt storage, write failures, keyboard controls, reduced motion, evening view and 32px text at 320px width.

Visual inspection covered the desktop gallery with all twenty loaded illustrations, desktop reader, phone library/reader and reading settings. The images render distinctly and the inspected Ethiopic text wraps without clipping. Automated phone tests use Chromium device emulation; physical iOS/Android devices, real screen readers and observed child usability have not been tested.

Initial browser attempts encountered low disk space/Chrome failures, and a sandboxed Chrome run could not launch. After environment recovery, browser checks were rerun with permission to launch isolated Chrome outside the sandbox. A resume test was corrected to scroll the intended paragraph to the viewport start rather than assuming a centered paragraph was the saved top-of-page checkpoint. The final passing counts above refer to the completed reruns, not those failed attempts.

## Content limits and next review

The twenty original AI-assisted texts are complete drafts, **not certified natural/fluent Tigrinya**. All nine checks per story in the review register remain pending, with no invented reviewer, date, variety or approval. A qualified fluent editor must verify all titles and paragraphs for spelling, phrasing, inflection/agreement, intended meaning, narrative coherence, variety/register, accessible reading demand, bedtime/age suitability and illustration alignment. A code test cannot establish these qualities.

The plots are original fiction/dreams, not presented as traditional folklore or factual cultural accounts. No third-party story text or website imagery was imported. Art is generated from project-owned SVG drawing code. Detailed lexical references, editorial intentions, art provenance and the exact review process are recorded in [the Stories review guide](../../stories/STORY_REVIEW.md). References support limited lexical/script checks, not approval of newly authored prose. Reading time and proficiency-level claims are intentionally absent because they have not been validated.
