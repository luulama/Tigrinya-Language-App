# Game Garden: twenty local practice games

Implementation brief, 20 November 2026. These are pending-review visual practice games, not approved language lessons or evidence of mastery. Existing content and artwork are reused without new translations, sounds or stroke sequences. No account, network service, persistent history, timer or reward currency is required.

## Concepts selected before implementation

| Unit | Game | Objective and gameplay loop | Completion / progression | Assets and principal risk |
| --- | --- | --- | --- | --- |
| 1 | Shape Lantern | Compare a model with a small choice of forms. | Find three forms; repeat with a new family. | Existing forms; supported recognition is not reading. |
| 1 | Family Baskets | Place one form at a time into its structural family. | Place four forms. | Source family rows; grouping does not assess pronunciation. |
| 1 | Order Bridge | Reconstruct a seven-form row, one position at a time. | Fill all seven positions. | Basic rows only; printed order is not handwriting order. |
| 1 | Twin Tiles | Turn over cards and remember identical forms. | Find three pairs. | Forms; no timers or penalty for mismatches. |
| 1 | Shape Mosaic | Assemble four printed glyph fragments in a two-by-two frame. | Place four pieces. | Clipped text from the same font; this teaches visual comparison, not strokes. |
| 1 | Stepping Stones | Follow an introduced form sequence through adjacent grid cells. | Reach the end of a short route. | Forms; show the route model again on request. |
| 1 | Pattern Loom | Extend a visible repeating form pattern. | Add three missing tiles. | Shapes only; never imply a grammatical sequence. |
| 1 | Ink Studio | Draw beside/over a printed model, compare, clear or retry. | Compare two drawings; a keyboard dot-pad alternative is available. | Printed forms; no invented stroke guide or automatic writing score. |
| 1 | Family Detective | Identify the one form from a different family. | Solve three family puzzles. | Source rows; model help remains available. |
| 1 | Word Spotlight | Find a taught form inside an existing contextual word. | Locate three forms. | Only existing source contexts containing the form; word meanings remain pending review. |
| 2 | Picture Post | Select a word label, then deliver it to its picture. | Deliver three labels. | Three unique existing picture associations; no ambiguous duplicate house pictures. |
| 2 | Word Forge | Assemble a two-form word from a mixed tray. | Build three source words left-to-right. | Existing two-grapheme arrays; no generated words. |
| 2 | Picture Market | Select a set of word cards for a picture shopping list, then check the basket. | Complete two lists. | Source picture labels; no prices, purchases or time pressure. |
| 2 | Letter Lenses | Locate first and last forms in a two-form word. | Finish four position prompts. | Existing segmentation; positions are visual, not sound claims. |
| 2 | Word Repair | Compare a model with a broken puzzle and replace its marked piece. | Repair three puzzles. | Broken rows are explicitly puzzle pieces, never labelled Tigrinya words. |
| 2 | Word Windows | Find a real word in a letter grid by selecting two adjacent cells in order. | Find three words. | Only the target is labelled a word; surrounding forms are puzzle tiles. |
| 2 | Word Dominoes | Connect three real word cards using identical touching forms. | Build one three-card chain. | Derive a valid source-word chain; equality does not imply equal meanings. |
| 2 | Word Notebook | Copy a real word using native input or an onscreen Fidäl keyboard. | Write three source words. | NFC comparison and composition-aware input; copying is not independent spelling. |
| 2 | Shared Shape | Find the identical form in two different source words. | Mark both occurrences across three pairs. | Source-derived intersections; no invented semantic relationship. |
| 2 | Picture Recall | Try to remember a picture's word, reveal it, then self-report or practise again. | Revisit requested cards and finish three cards. | Explicit self-report, never an automatic reading or speaking score. |

## Common contract

Every game has an introduction/model, concise objective, visible next action, progress through the activity, specific correction and retry, completion and replay. Wrong taps do not lose progress. Each content dependency is validated; unavailable content provides a retry/return path. Loader failure uses an accessible error message. All runtime content is local and generated from the existing source files. Reduced motion has a static alternative. Drawings remain in memory; microphone and speech APIs are not used.

The ten games per unit are discoverable from that unit, the standalone home, and the Next.js app's Games navigation. A shared runtime handles state and accessibility while individual mechanics retain their own interactions. Content review status is not changed by a game or test.

## Verification

See [the completed test record](GAME_GARDEN_TEST_REPORT.md). The required three passes are recorded separately for each game: full functional completion/replay; incorrect/repeated/missing-content and relevant input errors; and launch/navigation/layout at desktop and phone sizes. Browser automation complements, but does not replace, native-language review, observed child usability, physical stylus/IME and assistive-technology testing.
