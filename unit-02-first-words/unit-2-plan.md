# Unit 2: Two little letters

## Current design

This revision responds to the user's request for an app children ages 4–8 can navigate themselves, with very little reading. The same standalone HTML now opens on a picture map and one clear Play button. The dictionary and detailed explanations are in a separate grown-up area.

The goal is a more suitable experience for these children, not an untested claim to outperform another app in every respect. [Duolingo ABC](https://abc.duolingo.com/) and [Duolingo's learning path](https://blog.duolingo.com/new-duolingo-home-screen-design/) were comparison references. The guide character, map, illustrations and interaction design here are original or retained from this project's own prototype.

**Every Tigrinya word, transliteration, meaning, two-letter display, picture association, prompt and future audio is awaiting qualified native Tigrinya review. No item has been approved for learner release.**

## What the child sees

- A friendly little lion, a picture map, and Play.
- Four picture worlds labelled Home, Food, Animals and Me.
- Up to four large picture cards at a time. English definitions and transliterations are not shown on child cards.
- Three short activity labels: Look, Make it, Find it.
- A six-card Find pairs game after a three-picture session, showing only the pictures and draft words just explored.
- A large Next button, a visual hint button, and an always-available exit.
- A quiet finish with All done, Keep and Home.
- Compact Native review pending and Audio pending labels instead of adult paragraphs.

At the checked phone size, the home content has eight visible words, excluding the brand and required review/audio utility labels. Child-facing activity directions are one or two words. Full status descriptions remain available to assistive technology and in grown-up settings.

## The play loop

**Look:** A large picture, its draft whole word, and its two letter shapes. Tapping the picture gives a small visual response. A hand demonstrates the first interaction. The child can proceed with Next; exposure to the teaching card always precedes the question.

**Make it:** The model stays visible above two empty letter places. The child taps letter tokens to fit the two-letter shape sequence. Dragging is not required. A mismatch shows the needed shape and points to a suitable token; it does not erase progress. The next token or Next receives keyboard focus as appropriate. Completion says It fits, not that a word has been mastered.

**Find it:** After seeing the picture/word and assembling its letters, the child chooses the printed word for the picture. The first example offers one choice and a visible model; subsequent pictures offer two, then three introduced words. Untaught words never become distractors, and same-art alternative headwords are not competing answers. The lion or a wrong choice reveals the word model and a visual cue without a penalty. A correct choice reveals the model again and says Found it, not that reading has been mastered. Positions vary, and Next becomes available after matching.

**Find pairs:** After the three pictures, the child turns two cards to find matching pictures. Each revealed card includes the same picture and draft two-letter word shown in the preceding activities. A mismatch stays visible until the next card tap, so there is no forced waiting, countdown or penalty. The lion can point to the next matching card without turning it. Matched cards stay visible, and small picture markers show which pairs have been found. Next becomes available once all three pairs are matched. This is visual memory play, not a test or claim of Tigrinya reading or pronunciation.

If a session includes two headwords using the same picture, only one is used in Find pairs. This avoids asking children to distinguish identical images by an unreviewed spelling. A two-picture board uses four cards; a session with only one distinct picture retains the short finish flow.

Play initially offers house, water and cat in a three-picture session followed by Find pairs. A picture chosen from a world can also be played on its own, retaining the original short finish flow without a one-pair board. An unfinished session, including its pair-card order, revealed cards and matched pairs, resumes when the child returns to Play. Only Keep saves completed-session pictures to the in-tab collection.

The hint animations run a small finite number of times. The hand and outline remain useful without movement, and a reduced-motion stylesheet disables animation.

## Independent interaction versus independent language learning

The implemented navigation, picture matching and shape fitting do not ask the child to read a paragraph, understand a transliteration or obtain a grown-up's explanation of a task. Visual models and repeatable visual hints carry the interaction.

This silent prototype is **not yet a complete independent Tigrinya language course**. Reliable pronunciation cannot be taught by silent letter shapes. Before releasing independent language lessons, qualified native speakers and reviewers must approve word choice, spelling, meaning, the image association, short spoken directions, natural and slow word recordings, and the exact files and recording usage rights.

No synthetic Tigrinya pronunciation, copied source audio, microphone access, or fake working speaker button has been added. The audio button is explicitly unavailable. No review approval can be granted through play or settings.

## Grown-up area and complete word bank

A settings icon followed by a separate Open action leads to the grown-up area. Back or Escape returns without opening it. This two-tap separation prevents an accidental single tap from dumping the dictionary into the child flow; it is not authentication or a security gate.

All 142 distinct two-letter dictionary headwords remain included. The full bank has Tigrinya / English / transliteration search, all-entry and 32 / 110 placement filters, original sense tags, pending review labels, source links, and downloadable data. The 32 provisional picture candidates are unchanged:

| World | Candidates |
| --- | --- |
| Home | 7: two house headwords, shoe, trousers, rug, pail, gift |
| Food | 9: water, banana, bread, milk, rice, salt, pumpkin, coconut, fruit |
| Animals | 10: cat, fish, bird, tree, cow, goat, bear, ant, sand, stream |
| Me | 6: father, mother, hand / arm, tooth, face, heart |

These are provisional editorial choices, not approval of child suitability or linguistic accuracy. The other 110 entries remain review-bank material rather than automatic child activities.

## Dictionary scope and counting

The source is the [Kaikki.org Tigrinya dictionary](https://kaikki.org/dictionary/Tigrinya/index.html), extracted from English Wiktionary. All 942 records, covering 917 distinct headwords, were scanned. There are 148 matching records grouped into 142 distinct two-letter headwords, all retained.

Count exactly two Ethiopic syllable-letter graphemes in the normalized dictionary headword. Attached combining marks do not add letters. Do not remove spaces or affix markers, truncate longer words, or count English transliteration characters instead. Same-spelling senses are grouped; alternative headwords remain separate. The three-letter sheep candidate remains excluded.

This is complete for the downloaded snapshot, not every two-letter word in Tigrinya. Inflected forms embedded inside entries are not extra headwords. Retrieval was 17 November 2026; the source index reports extraction on 30 October 2026 from the 1 October 2026 dump. The review JSON retains the source checksum, original sense IDs, transliterations, canonical spellings, entry URLs and contributor-history links.

Dictionary-derived content is attributed to English Wiktionary contributors and Kaikki.org / Wiktextract under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Attribution is present in the grown-up panel and the complete downloadable bank. Source images, quotations and recordings are not copied.

## Respecting childhood

No child accounts, analytics, advertisements, purchases, streaks, countdowns, competitive rewards, hearts to lose, or persistent learner storage are used. Session state, pair cards, demonstrations already seen, and explicitly kept pictures exist only in memory for this tab. Reloading clears them. Saving or finishing does not imply native approval, reading ability, pronunciation accuracy or mastery.

Stopping is always available. The map worlds are available without earning access. Hints teach what to do and never require payment or waiting.

## Earlier browser validation

The browser checks below describe the picture-map and Look / Find it / Make it revision tested on 17 November. They do not establish browser verification of the new Find pairs screen.

- Corpus checks pass: all 142 matching headwords exactly once; all 148 source records and their senses represented; source transliterations and checksum preserved; all approval and audio fields remain empty and pending.
- Counting checks cover two-letter words, three-letter exclusions, combining marks, spaces, affix markers and numbers.
- The embedded data equals the review JSON. The inline app matches the checked working source, and JavaScript syntax passes.
- Browser checks cover the complete house / water / cat play session, picture mismatches, wrong-first-letter recovery, fitting both letters, explicit Keep, and a three-picture saved collection.
- An unfinished activity resumes after exit. Keyboard navigation reaches Play, activates the activity, and supports the letter buttons. The grown-up dialog closes with Escape.
- All 32 picture candidates were checked across all gallery pages: exactly two displayed letters, no more than four cards visible at once, and pending-review associations.
- The grown-up bank retains all 142 rows and source links; Tigrinya search and placement filters work.
- Home checks pass at 320 x 640, 390 x 844, 768 x 1024, 1024 x 768 and the normal 1280 x 720 desktop viewport. All map buttons and review labels remain visible without horizontal overflow.
- Look and Make it fit on the checked 320 x 640 phone and the 1280 x 720 desktop without scrolling to reach Next or the review status. No duplicate element IDs or browser log errors were found.
- A reduced-motion style and keyboard focus states are implemented. Screen-reader combinations and children's real-world independent use still need user testing.

## Find pairs update — 19 November 2026

- Added the picture-pair screen, shuffled card positions, repeatable visual hints, calm mismatch recovery, and in-tab resume without adding accounts, external requests, audio, tracking or persistent storage.
- All 14 focused JavaScript checks pass: deck integrity, session transition, duplicate taps, mismatch handling, already-matched cards, hints, resume, completion gating, explicit Keep, single-picture play, new-session reset, same-art headwords, and invalid card IDs.
- Existing corpus checks pass for all 142 headwords, all 148 source records, 32 picture candidates, source attribution, two-letter counting, embedded data and script parity. Every language/image/audio review field remains pending.
- JavaScript syntax passes. The standalone page is rebuilt from the working shell, pair-screen markup, pair styles, existing SVG sprite, unchanged review JSON and application script with `work/build_unit2.py`.
- A loopback-only preview returned HTTP 200. Visual/browser QA of this update could not run: no browser automation surface was available, and native Chrome access reported that Computer Use permissions were not granted. Mobile fit, real keyboard focus and screen-reader behavior on the pair screen still require browser verification.
- Existing screenshot files illustrate the earlier map, gallery and letter activity; there is no new pair-game screenshot yet.

## Picture-to-print update — 19 November 2026

This MVP refinement replaces identical-picture copying with supported printed-word recognition. The order is now Look → Make it → Find it, followed by the existing pair game. The completed assembly provides a whole-word/picture comparison before recognition. The first recognition step is a guided example, and later alternatives are restricted to words already introduced in the same session. No new vocabulary, pronunciation, persistent progress or review approvals are added.

The [first-lesson review brief](lesson-01-review-brief.md) records the learning goal, three sourced candidates, adult teacher notes, activities, reinforcement, review, required assets and reviewer risks. The 3–5 minute lesson target and under-three-minute game target still need observation with children; there are no enforced timers.

Validation: 12 new literacy-flow checks and all 14 existing pair-game checks pass, along with corpus, source-parity and JavaScript syntax checks. Browser QA could not run because no browser-control surface was available and native Chrome access reported that Computer Use permissions were not granted. New mobile layout and actual keyboard/screen-reader behavior remain unverified; older screenshots are not evidence for this new screen.

## What must be validated next

After native review and recordings, test with children across the intended age range. Observe whether a child starts a picture session, understands a visual hint, recovers from a wrong tap, fits two letters and returns home without adult instructions. Then evaluate actual word recognition, listening and pronunciation with qualified Tigrinya educators. These results, not a visual resemblance to a competitor, should guide claims about learning quality and independent use.

## Deliverables

The Git-ready master copy uses `index.html` as its standalone demo. Editable UI files and the SVG sprite are in `src/`, build and dictionary-extraction scripts are in `scripts/`, automated checks and the original dictionary fixture are in `tests/`, and earlier screenshots are in `previews/`. The original dated workspace is retained separately; its older `work/` and `outputs/` paths below describe that workspace, not the repository layout.

- `tigrinya-unit-2-first-words.html`: current standalone child-first app; earlier file links remain valid.
- `unit-2-content-review.json`: complete source and review data; all 142 entries remain pending.
- `unit-2-two-letter-words.md`: complete sourced word bank.
- `unit-2-preview.png`: current picture-map preview.
- `unit-2-two-letter-cards.png`: current four-picture gallery preview.
- `unit-2-play-preview.png`: current phone letter-fitting activity preview.
