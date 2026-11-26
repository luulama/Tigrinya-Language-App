# Tigrinya Language App

## Scope and source of truth

The official company vision is `Product-Bible/01-Vision.md` (FINAL_V1). Preserve its frozen baseline under `Product-Bible/versions/`; do not silently revise approved commitments. A successor requires explicit owner approval and recorded rationale. Use the brief and specifications for compatible operational detail; surface conflicts before changing the vision.

Follow the owner's Product Bible workflow in `Product-Bible/README.md`. Read approved prior sections and relevant dependencies before drafting the requested section; distinguish draft context from approved authority. Respect the documented effort tiers and do not advance to another section without a request. Complete the full-Bible review, approved Version 2.0, and Curriculum, Technical, and Design Bibles before further app implementation unless the owner explicitly changes this sequence. Preserve existing code and functionality; do not treat prior implementation as completion of the new documentation gate.

These instructions apply to this complete app and every unit beneath this folder. Read `PROJECT_BRIEF.md` for the owner's full vision and task-specific output formats. Read `shared/content-review/CONTENT_REVIEW.md` before changing learner-facing content.

This is the master app folder. Unit 1 is Fidel Foundations; Unit 2 is First Words. Keep unit-specific work separate and shared assets and review records under `shared/`. Check whether a task-workspace prototype is newer before replacing either copy. Do not assume a file with the same name is the latest version.

## Product and learning

- Design first for children ages 4–8, then diaspora families, parents and beginning learners.
- Prioritize literacy, authentic content, accessibility, cultural suitability and learning outcomes over engagement.
- Teach before testing: introduce, demonstrate, reinforce and review before asking for recall.
- Present one concept at a time with large, clear pictures and minimal child-facing text. Put detailed explanations and transliterations in adult or reviewer views unless needed for the specific lesson.
- Design lessons for roughly 3–5 minutes and games for under 3 minutes, without adding countdowns or pressure. These are design targets, not validated completion-time claims.
- Keep the learning goal visible through a short label and visual model. Provide repeatable demonstrations and calm recovery after a wrong tap.
- Do not add guilt, punitive lives, gambling, manipulative rewards, forced waiting, streak pressure, ads or social features before the learning experience works.
- Preserve the earlier Unit 2 requirement: learner word candidates must contain exactly two Ethiopic letter graphemes. Do not count transliteration characters, truncate words or manufacture examples to fit.

## Authenticity and release gates

- Never invent Tigrinya words, phrases, transliterations, pronunciation or example sentences. Preserve provenance and label uncertainty.
- Dictionary evidence provides candidates, not native approval. Retain original forms, sense distinctions, source links and required attribution.
- When no natural verified example exists, recommend shape recognition, pattern matching or tracing. Sound activities require reviewed audio.
- Every learner-facing spelling, meaning, transliteration, example, prompt, visual association and audio asset requires qualified native Tigrinya review before learner release.
- Review spelling, pronunciation, cultural correctness, child suitability, modern usage, context and regional variation. Record reviewer identity, decision, date, revision notes and the exact content or asset being approved.
- AI may assist with pre-review and flag issues; it must not impersonate a native speaker, invent reviewer credentials, or issue native APPROVED status without an actual qualified review record. Use the owner's APPROVED / REQUIRES REVISION format only when reporting an evidenced reviewer decision; otherwise state awaiting qualified native review.
- Keep draft prototypes explicitly marked pending. Completing a game, saving a picture or passing a code test never approves content or proves literacy, pronunciation or mastery.
- Native audio must be clear, child-friendly and licensed for the intended commercial use. Do not substitute synthetic pronunciation for missing approved native recordings or show a working speaker control without usable audio.
- Do not describe a silent prototype as an independently usable language course. Missing reviewed recordings and spoken directions remain explicit release gaps.

## Engineering and privacy

- Preserve the existing standalone HTML, CSS, JavaScript and content-file architecture. The owner explicitly requested the Polyglot Core monorepo under `apps/` and `packages/`; use its Next.js/.NET/PostgreSQL stack there and read `docs/engineering/README.md`. Keep the standalone preview intact and avoid unrelated rewrites.
- Do not introduce React, databases, user accounts, cloud services or Azure infrastructure merely because the brief describes how to design them when requested.
- Use mobile-first layouts, clear visual hierarchy, readable text, touch targets, keyboard support, appropriate accessible names and reduced-motion behavior.
- Keep source content reusable and separate from activity state. Do not invent progress metrics or imply that picture matching measures language mastery.
- Preserve the current no-account, no-analytics, no-persistent-child-storage behavior unless a specifically scoped feature changes it with appropriate privacy review.
- When promoting a checked unit prototype into this master folder, carry its required assets, content data, review documents and relative-link targets with it. Do not replace unrelated unit work.
- Test the changed behavior first, preserve corpus and review checks, and report any unperformed browser, accessibility or child-usability validation honestly.
- Do not publish learner-facing content or spend on infrastructure as an incidental step in a local prototype task.

## Required engineering verification

For each engineering task, inspect the current architecture, dependencies, routes, build/test setup and Git status before editing. Search for existing implementations, duplicate logic and dead code; reuse working solutions and fix a reproduced root cause rather than a symptom. Keep refactors and maintenance scoped to the task.

After the final change, run all three commands from the repository root, using `bash scripts/tool.sh` when this machine needs its workspace-local tools:

```sh
npm run typecheck
npm run test
npm run build
```

Fix failures and rerun affected checks, then complete the full validation before committing or pushing. Run additional content, backend and browser tests when relevant. The root dev/build commands prepare the standalone learning assets; do not replace their build steps with a second packaging implementation.

Start the resulting app locally with the detected project command. Check the affected learner flow, relevant onboarding/path/lesson/motion states, mobile layout, keyboard/access behavior and browser console. Verify the intended change in the running app. A successful file edit or build alone does not establish implementation. Record which checks were automated, which UI interactions were inspected and any access or environment blocker; do not claim an unperformed check passed.

Finish with what changed, why, modified files, test/build/runtime results, risks and recommended next actions. Preserve privacy, native-content approval and existing learner data. Commit and push only verified work, following the secret-file exclusions below; do not deploy implicitly.

## Automatic GitHub sync after verified changes

Every time you finish creating or modifying files and verify there are no syntax errors, automatically stage all changes (`git add .`), commit them with a clear short message (`git commit -m "..."`), and push them to GitHub (`git push`).

Never commit `.env` or secret files. Keep environment files, credentials, tokens, private keys and other secret-bearing files excluded in `.gitignore`. Before committing, inspect the staged file list and check for secrets, including in files already tracked by Git: `.gitignore` does not protect tracked files. If a secret-bearing file is staged, unstage it without deleting the local file and exclude it before continuing. Never print secret values in logs or reports.

Run the relevant syntax, type and test checks for the changes before syncing. Do not commit a change with failing syntax checks. Use the current branch and its configured upstream; never force-push, rewrite history or deploy as part of this sync. If a commit or push fails, preserve the local work and report the exact blocking reason without claiming that GitHub was updated.

## Requested output formats

For recommendations use RECOMMENDATION, WHY, RISKS, BETTER ALTERNATIVE when one exists, and NEXT ACTION. Classify feature ideas as MVP, V1, V2 or Future with impact, effort, risk and the simplest implementation.

Use the task-specific formats in `PROJECT_BRIEF.md` for lessons, Fidel packs, educational reviews, games, stories, database or Azure designs, image prompts, audio plans, code reviews, prototype reviews and QA. Do not treat the list of conditional roles as a request to build every future feature.

When reviewing prototypes, a numeric design score is a provisional assessment, not a substitute for observed child usability or native review. Keep verified facts, design judgments and untested assumptions distinct.
