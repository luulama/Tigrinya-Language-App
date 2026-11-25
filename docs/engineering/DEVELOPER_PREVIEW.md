# Developer Preview Mode

Temporary inspection for the existing public learning path. This mode changes access in the view; it never awards completion, changes review schedules or bypasses server authorization. Native-review and missing-media labels remain visible.

## Use

From **Learn → Development tools → Enable Developer Preview**, open the word path. On either standalone learning path, **Development tools → Enable Developer Preview** switches the current page in place. Direct URL:

```text
/preview/unit-02-first-words/path.html?developerPreview=1
```

The blue **Developer Preview Mode** banner contains:

- **Inspect lesson:** all 42 Fidäl families plus Gentle review in Unit 1; all 31 lesson/checkpoint nodes from Unit 2 onward.
- **Jump to step:** introductions, each existing practice/check task, writing, recaps and end screens. Preview check tasks use a stable source order so a selected word/step matches the displayed task.
- **Open selected step:** direct navigation without completing earlier tasks or filling in answers.
- **Return to normal gating:** one click, in place. Removes preview URL parameters and restores the normal page's progress, unfinished lesson and notebook references.

Example direct links:

```text
/preview/unit-02-first-words/path.html?developerPreview=1&inspectLesson=u3-01&inspectStep=check:1
/preview/unit-01-fidel-foundations/index.html?developerPreview=1&inspectLesson=ተ&inspectStep=write:6
```

Available phases depend on the selected lesson. Unit 2 onward uses `intro`, `practice:N`, `recap`, `check:N`, `done`; Unit 1 uses `meet:N`, `write:N`, `match:N`, `check:N`, `recap`, `done`. Indices start at zero. Unavailable future lessons expose their authored outline and `outline:N` planned steps. Invalid indices fall back safely within the available task range.

## Data guarantees

`shared/developer-preview.js` keeps its flag in memory and the current URL. There is no localStorage/sessionStorage preference, database unlock or account change. The flag follows links only between the two supported path adapters. Other interactive app links require leaving preview first; source/review documents remain readable. Saving, clearing history and persistent preference controls are suppressed while inspecting.

The word path saves the real history, unfinished run and notebook references on entry, uses a separate inspection history/notebook and restores the originals on exit. Unit 1 similarly isolates its maps, check state and writing notebook. Writer guards independently suppress shared history, family records, pronunciation-card storage, WordPath completion/review/exposure and SRS/session mutations. Exiting restores the view while the writer lock remains active, so merely showing the normal model again does not record a new exposure.

A correct preview answer still provides ordinary task feedback. The end screen explicitly says that no content was marked completed. Existing completed counts remain actual learner counts; no fake passed records are used to open nodes. Direct navigation to an unpractised checkpoint is available only while preview is active.

No backend endpoint, authentication policy, native approval, achievement or curriculum record is modified. This is a content-review convenience, not an authorization mechanism. Protected drafts still require the existing authorized review tools.

## Content limits

There are 27 implemented visual word-path lessons and four future lesson outlines. Preview exposes all 31 nodes and the existing recipes/goals/known source words, including Units 4–5. It cannot supply missing recordings, human pronunciation rubrics or unauthored sentences. Those nodes show their actual missing-material explanation rather than a fabricated playable lesson. Unit 1's normal sequence, content and completion rules remain intact; the explicit preview hooks are reversible in the existing preservation checks.

## Implementation and checks

- Shared mode/banner: `shared/developer-preview.js` and `.css`.
- Fidäl adapter: `unit-01-fidel-foundations/developer-preview.js`, minimal conditional hooks in its page.
- Word-path adapter and write guards: `unit-02-first-words/src/path-app.js`, `path-core.js`, `path-srs.js`; shared history guards in `shared/learning-path.js`.
- Packaging: source shell, generated pages and `scripts/build_site.py`; `prepare_web_preview.py` copies the same checked assets into Next.js.
- `tests/check_developer_preview.cjs` checks real writer APIs remain inert, including during exit, and resume normally afterward.
- `tests/e2e/developer-preview.spec.ts` checks all nodes, direct task/checkpoint navigation, byte-identical nonempty saved progress, no completion, unfinished-work restoration, Unit 1 review locks and cross-unit URL flags at desktop/phone viewports.
- Existing course hashes stay frozen. `tests/helpers/developer-preview-preservation.cjs` reverses only the exact recorded preview hooks before comparing the original source/content hashes; it leaves binary files untouched. It does not replace learning behavior tests.

See [verification](DEVELOPER_PREVIEW_VALIDATION.md) for executed commands and remaining limits. No deployment is part of this work.
