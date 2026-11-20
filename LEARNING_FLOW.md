# Learning flow and validation

## Project and scope

A local HTML/CSS/JavaScript Tigrinya literacy prototype with English instructions, existing artwork, no backend, accounts or tracking. Unit 1 contains 35 basic families, six labialized families and a separate additional-form group, with 293 source-defined forms and source-word contexts where available. Unit 2 contains 32 provisional picture candidates and the complete 142-headword dictionary review bank. No language or image association is approved for learner release; native recordings are absent.

## Reusable complete activity

Both units follow **purpose → teaching → guided practice → recap → check → outcome/next step**. The shared unit-journey.js module holds goals, everyday contexts, planning estimates, panel rendering and check state. Shared unit-journey.css supplies responsive styles. Unit 1 loads them locally and Unit 2 embeds them during its standalone build. No dependencies were added.

**Unit 1:** Meet a Fidäl form within its seven-order family, see it highlighted in existing words where available, and optionally use Write it for freehand/model practice, replay or native text input. Find the matching form among introduced alternatives. After the group’s forms, recap them. A worked example demonstrates two identical forms and a different one. A cumulative check covers each introduced form through difference-spotting, with help, explanations and another attempt later for supported items. Finish with an honest outcome and the next family or picture words. All 42 visible activities offer the whole journey. Unprepared families have no interactive placeholder lessons. The በ-family picture/form review opens after its check.

**Unit 2:** Start with the existing house, water and cat candidates. Look at picture, script, two shapes and the existing English concept. Make it using a model, Find it among introduced words, then revisit the pictures in pair play. Recap all activity words before a cumulative picture-word check. That check initially hides the model; Show me or a mistake supplies it and highlights the matching word, with another answer still required. Supported items return once later without the model. Finish with Next words, optional Keep pictures and a count of responses completed with/without help. All 32 candidates remain reachable through this format.

A single gallery picture retains a short complete activity; a one-option check is classified as guided, never as an independent answer. Same-art headwords never compete as alternatives. Later activities normally mix one familiar and two new candidates; the last group may be shorter. Review rotates through practised candidates.

## Progress and recovery

Home/Continue preserves partial assembly, recognition hints, pair-board state, recap and check state within a unit. Wrong answers do not erase practice, cost lives or prevent eventual completion. Supported questions return at most once, preventing endless loops. Their original encounter remains reported as supported even if the later attempt succeeds without help. Opening a family or picture never counts as completion. A family is checked only after guided activities and its check; a word session finishes after recap and its check.

Practice and Keep remain separate. Counts describe activity behavior, not reading, pronunciation, retention or mastery. State is memory-only by default. Explicit Save practice on this device stores completed checks and presentation/time preferences under one versioned browser key, without names, drawings, recordings or uploads. Saved completed checks restore across pages on the same origin; unfinished activities and collections do not. Stop saving removes only that key while retaining in-tab history; Clear history resets this app’s saved and in-tab check history. Blocked or unavailable storage falls back to memory. Due visual activities take priority, using a provisional 1/3/7/14/30/60-day schedule. These are re-teaching activities before a check, not validated tests of retention. Same-day repeats cannot establish later-day evidence or increase review spacing.

## Accessibility

The Fidäl writing revision adds seven-order labels, character-in-word highlighting, an actual freehand surface with per-character undo/history, learner replay and keyboard/onscreen Fidäl text entry. Native sound labels are not guessed from Latin text. Teacher strokes remain gated on sourced Tigrinya review records. See [current Fidäl writing behavior and validation](FIDAL_WRITING.md); earlier references to finger-following alone describe the prior revision.

Short prompts, large native buttons, explicit actions, visible focus, polite feedback and a persistent announcement region support the checks. Ethiopic text uses local font fallbacks, with Tigrinya and left-to-right metadata on key elements. Tap/keyboard activation replaces mandatory dragging. Reduced-motion and forced-colors styles are included. Missing audio is status text, not an inactive playback control. New button, body, helper, metadata and result color pairs are numerically checked at 4.5:1 or better, without claiming whole-app WCAG conformance.

## Research, assumptions and validation

[Research notes](RESEARCH_NOTES.md) compare IES learning guidance, CEFR principles, W3C guidance, UNICEF RITEC and GOV.UK interaction patterns. These informed design decisions; they do not validate this app's learning effectiveness or ages 4–8 usability. No competitor branding or lesson content is copied.

Scope follows available source content: Fidäl family/order comparison, writing practice and supported word recognition. Dialogue, grammar, pronunciation and cultural instruction were not invented. 45 of 293 forms have existing word contexts; 248 need suitable reviewed examples. Freehand feedback invites comparison and does not grade handwriting or establish correct stroke order. About 3–5 minutes per activity is an unvalidated planning estimate, not an enforced duration.

The check runner builds the Fidäl review module and Unit 2, then verifies source completeness, pending status, two-character counting, source/module/style parity, links/assets, IDs, ARIA references, audio status, contrast, JavaScript syntax and 88 behaviors including writing/Unicode/gating. Flow tests use a VM and lightweight DOM stub; they now execute actual HTML scripts in document order, but still do not prove rendered layout or assistive-technology output. Chrome checks on 20 November cover Unit 1 startup/writing and its first match, an emulated 390-pixel home/lesson view, and the complete default Unit 2 journey including error recovery and revisit. See [the debugging report](QA_REPORT.md) for the fixes and remaining physical-device, IME, VoiceOver and usability checks. Earlier screenshots depict prior versions; the font specimen is a diagnostic, not an app screenshot.

Before learner release, qualified native Tigrinya reviewers must approve exact forms, vocabulary, meanings, transliterations, picture associations and exercise prompts. Licensed natural/slow recordings and short spoken directions are needed for reliable pronunciation and independent use by non-readers. Test approved flows at 320, 390 and 768 pixels, 200% zoom, keyboard-only, reduced motion and with VoiceOver, then observe children and adult beginners. Work remains local, without deployment or publication.

## Presentation and time preferences

The new home plan recommends a next unit; unit home screens retain one existing Start/Continue action. Child/teen/adult preferences change presentation, not language level. Three minutes selects a one-word guided activity; 5/10/15/30 minutes retain up to three words and suggest multiple activities for longer availability. There are no countdowns or promised fluency outcomes. One-option checks remain supported. A short-session planner prioritises due material, then a fresh word, avoiding a loop of repeating the familiar first word.
