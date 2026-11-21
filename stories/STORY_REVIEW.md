# Stories — text, art and review register

All 20 texts are complete original AI-assisted story drafts, not summaries or copied stories. They are readable in the local Stories preview, but **none has fluent-speaker approval**. Do not describe them as native-verified or release-ready. There are 160 paragraphs; each story has eight paragraphs and its own original SVG illustration.

## Titles and editorial intent

The English titles below describe authorial intent for reviewers. They are not learner translations or certified equivalents.

| # | Tigrinya title | Editorial intent | Native review |
| --- | --- | --- | --- |
| 1 | ድሙ ኣብ ብርሃን ወርሒ | The cat and the moonlit puddle | Pending |
| 2 | ናይ ወረቐት ጃልባ | The paper boat's small voyage | Pending |
| 3 | እቲ ዝጠፍአ ኮኾብ | The star looking for its place | Pending |
| 4 | ጤልን ድልድልን | The goat's patient crossing | Pending |
| 5 | እቲ ዝዛረብ መጽሓፍ | The book that whispered a journey | Pending |
| 6 | ኣብ ትሕቲ ባሕሪ | A fish follows the blue stone home | Pending |
| 7 | ክንቲት ኣብ ንፋስ | The feather's quiet route | Pending |
| 8 | ሓርማዝን ዑፍን | A large friend and a small guide | Pending |
| 9 | እቲ ንእሽቶ ዘርኢ | The seed that needed time | Pending |
| 10 | ጉዕዞ ደበና | The cloud's last little shower | Pending |
| 11 | እቲ ናይ ጎቦ ድምጺ | A hello answered by the hillside | Pending |
| 12 | ኣብ ትሕቲ ወርሒ | A garden that opened in a dream | Pending |
| 13 | መልእኽቲ ኣብ ቅጽሊ | A thank-you carried on a leaf | Pending |
| 14 | እቲ ዝደቀሰ ኣንበሳ | The friends who made a quiet path | Pending |
| 15 | እታ ንእሽቶ ደሴት | The island in a bedtime dream | Pending |
| 16 | እቲ ናይ ጽላል ቤት | A house made of friendly shadows | Pending |
| 17 | ወኻርያን ደወልን | The fox and the wandering bell | Pending |
| 18 | እቲ ዝተቐደደ ካርታ | The map with a missing corner | Pending |
| 19 | ስግር እቲ ጎቦ | The light beyond the hill | Pending |
| 20 | ናብ ገዛ ዝመርሕ ብርሃን | The light that led the dream home | Pending |

## Mandatory review checklist

For every title and paragraph, a qualified fluent Tigrinya editor must verify meaning, narrative coherence, natural phrasing, canonical spelling, punctuation, gender and agreement, verb forms, pronoun reference, register, dialect/variety, and age suitability. Verify every illustration against its actual scene and character descriptions. Check gentle endings, safe real-world behavior and the distinction between dream/magical fiction and factual explanation. Check any language-demands label separately; increasing word count does not establish a proficiency level.

All nine checks in `stories/content/review.json` are pending, with no invented reviewer, date, variety or approval. The current version hash in `stories/catalog.json` binds the source text, editorial metadata and artwork. A real reviewer must identify the exact reviewed revision and record corrections before any approval is recognized. Native approval does not automatically publish a story or turn a read marker into learning evidence.

## Originality, rights and illustration provenance

The plots and wording were written for this project. No contemporary story, public-domain tale, folklore adaptation or translated story text was imported. Talking animals, a star riding a cloud, and a moon garden are explicitly fiction or dreams, not cultural or scientific claims.

All 20 illustrations are original code-drawn SVG scenes generated from `scripts/build_story_art.py`; no website images, emojis, remote assets, external fonts or competitor characters are used. Their local SVG files include descriptive title/description metadata. They share a muted picture-book palette and recurring original characters, with distinct compositions and story-specific objects. Source SVGs remain editable. No third-party image reuse permission is needed for these project-created assets. No independent cultural or artistic review is claimed.

## Language references consulted

- [Harvard ELIAS Tigrinya alphabet unit](https://elias.fas.harvard.edu/languages/tigrinya/Beginning/1/Unit-1-Alphabets): script/family context; not evidence that the newly authored sentences are approved.
- [Universal Dependencies Tigrinya documentation](https://universaldependencies.org/ti/): agreement, attached prepositions/possessives, coordination and punctuation; reference material, not a native proofread of these stories.
- [The project's existing Kaikki/Wiktionary dictionary snapshot](https://kaikki.org/dictionary/Tigrinya/index.html): existing headwords such as star, cloud, goat, fox, book, bed and elephant. No dictionary glosses or story passages were copied into the narratives.
- Geez Experience Tigrinya entries for [moon](https://www.geezexperience.com/?dr=0&searchkey=moon), [boat](https://www.geezexperience.com/?dr=0&searchkey=boat), [tree](https://www.geezexperience.com/?dr=1&searchkey=%E1%8C%88%E1%88%A8%E1%89%A1) and [bell](https://geezexperience.com/?dr=0&searchkey=bell): lexical cross-checks only. Crowdsourced example sentences were not copied or treated as native approval.
- [Goethe-Verlag Tigrinya animal vocabulary](https://www.goethe-verlag.com/book2/_VOCAB/EM/EMTI/02.HTM): feather/animal headword cross-checks; no imagery or recordings reused.
- [The America Team for Displaced Eritreans picture dictionary](https://eritreanrefugees.org/wp-content/uploads/2014/11/Tigrinya-EnglishDictionary-V1-6-1UseOnComputer.pdf): everyday vocabulary, including wind. No scanned images or example passages reused.
- [UK PCGN Eritrea factfile](https://assets.publishing.service.gov.uk/media/6672f1e9c087fbe40855ce76/Eritrea_Toponymic_Factfile.pdf): the lexical form for island/sea; no historical or geographical claims from it enter the fiction.
- [W3C Ethiopic layout requirements](https://www.w3.org/TR/ethi-lreq/): LTR rendering; the reading UI never applies RTL to Tigrinya.

References support individual checks, not all newly composed inflections or idioms. All newly authored wording, including these titles, remains explicitly pending a fluent speaker's review. The local collection is a draft-reading preview separate from the API's published reviewed collection. No native reviewer was impersonated.

## Reader and data behavior

Stories are separate from Units 1–2 and never unlock lessons, add a review success or claim comprehension. Read-later bookmarks, marked-read state, text size, evening view and a paragraph position use their own `tigrinya.stories.v1` profile. They stay in the current tab unless device saving is explicitly chosen. No names, recordings, accounts, trackers or uploads are added. Shared-device readers share this local profile. Stopping saving affects only this key; course progress is untouched.

When source text or art changes, a revision mismatch preserves the bookmark but resets the old reading position and marked-read state for that changed story. Invalid/unknown saved data remains untouched with a recovery explanation. Storage failures leave in-tab reading usable and the previous saved copy intact.

Each story and paragraph has an unused null audio field for future verified recordings. No audio playback, synthesis, microphone or inactive audio control is implemented. Reading time and CEFR claims are omitted because neither has been measured or reviewed. The first group averages shorter texts than later groups; native editing must assess the actual learning progression.
