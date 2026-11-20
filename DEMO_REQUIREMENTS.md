# Demo requirements and coverage

The demo uses the same runtime and content as the app. It is not a separate three-family sample. This audit covers the owner's project brief, the complete-unit prompts and the Fidäl/writing requirements.

| Requirement | Working demo behavior | Remaining evidence/content |
|---|---|---|
| Full Fidäl coverage | 35 basic seven-order families, six five-order labialized families and 18 additional fourth-order forms; 293 forms in 42 complete activities | Qualified native review of teaching priority and usage |
| Small, visual steps | Meet, optional writing, matching, recap, check, outcome and next activity for every group | Child usability observations and licensed spoken directions |
| Family/order relationships | Basic rows retain seven orders; labialized rows retain orders 1, 3, 4, 5, 6; additional forms are explicitly a group | Native review |
| Real words and meanings | Existing sourced picture-word contexts highlight the current form; no invented filler where a word is absent | More suitable word/image examples for forms without contexts |
| Writing and entry | Actual drawing, model toggle, per-character undo/clear, normal/slow learner replay, still alternative, native/onscreen Fidäl input | Physical stylus/touch, real IME and assistive-technology matrix |
| Teacher stroke demonstration | The implemented provider supports sourced ordered paths, starts, directions, speed and static steps; pending records do not expose teacher buttons | Licensed Tigrinya-specific handwriting data, reliable source locators and qualified review |
| Two-character words | All 142 dictionary matches remain in Unit 2's searchable review bank; 32 existing picture candidates have complete activities | The other 110 entries have no child-suitability/image approval; they are not silently promoted to child vocabulary |
| Complete word journey | Look, build, recognition, picture pairs, recap, cumulative check and result; familiar/new mixing, review and optional collection | Native language/image review |
| Gentle correction and memory | Models and retry after mistakes; helped items return once later; honest supported/independent results | Provisional cross-day visual re-practice now implemented; learning effectiveness still needs delayed assessment |
| Progress and recovery | Continue, recommended next action, optional device-saved completed checks and due review; all groups remain accessible | Saving is opt-in; unfinished activities, drawings and collections reset; no placement or proficiency level |
| Accessibility and script | Tigrinya metadata, LTR, local Ethiopic fonts, touch targets, keyboard controls, focus and live feedback, reduced motion | Full VoiceOver/device/zoom testing |
| Sound | Native/slow-audio provider and review gates implemented | Licensed, reviewed recordings and spoken prompts; no synthetic substitute |
| Privacy and architecture | Standalone HTML/CSS/JS; no accounts, tracking, payments or APIs; optional device-only check history | None added |

The brief labels Stories, Conversation, Culture and Pronunciation as **future units**, and its React/database/Azure sections are conditional guidance. There is no supplied reviewed curriculum for those units. They are not represented by dead lesson buttons or fabricated sentences. Those curriculum and service projects remain outside the two implemented units, rather than being claimed as finished.

## Inventory provenance

The basic and extended character rows are transcribed from the [BGN/PCGN Tigrinya reference, pages 1–3](https://assets.publishing.service.gov.uk/media/634e725ed3bf7f618eda950c/ROMANIZATION_OF_TIGRINYA_22.pdf). [Harvard ELIAS](https://elias.fas.harvard.edu/languages/tigrinya/Beginning/1/Unit-1-Alphabets) corroborates common basic families. The reference includes declining-use rows; a native reviewer must determine their curriculum priority. Geographical romanization is not treated as recorded pronunciation or handwriting evidence.

`scripts/expand_fidal.py` records the explicit sourced rows and preserves existing contexts/review records. `shared/content-review/fidal-writing.json` remains canonical. New contextual words only reuse existing picture candidates and their exact dictionary provenance. No review was changed to approved.
