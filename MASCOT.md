# Neri — the cinnamon bear

Neri is an original living animal companion for this Tigrinya app. The invented working name is a brand name, not a Tigrinya translation. Its design and prompts await cultural, fluent-speaker and age-suitability review; human articulation diagrams also need phonetics review before learner release.

25 November 2026 adoption note: the Next.js wrapper now calls this original bear **Mele** and supports controlled quiet preferences for the [learning entry systems](docs/learning-experience/README.md). The standalone previews, source API and SVG filenames keep Neri; no asset, lip timeline or native review status was rewritten. The character description below records the original asset identity.

## Character and design

The owner requested a warm bear to replace the previous object character. Neri now has a cinnamon coat, cream muzzle and chest tuft, rounded ears, a small crown tuft, a lighter patch at one ear and broad animal paws. It sits on its haunches, raises a forepaw, listens with a tilted head or curls up to rest. It has no clothing, shoes, human hands or object-shaped body. No claim is made that this fictional bear is a local species, cultural symbol or traditional character.

A new bear reference sheet was explored with the built-in imagegen tool. The exact prompt and reference board are in `docs/design/mascot/`. The final app uses original editable SVG drawing code, with **nine bear expression assets and nine separate human lip-step assets** exported from the live renderer. The reference bitmap is documentation, not a large runtime dependency. Colors match the existing warm cream, brown, ink and teal interface.

## Expressions and screens

`Neri.create(host, options)` retains the existing reusable API. Its states are idle/welcoming, listening, thinking, encouraging, celebrating, kind/gently correcting, demonstrating, resting and **sleepy**. Eyes, head tilt, muzzle and forepaw/body poses carry the expression. Sleepy is a genuinely curled animal pose. Celebrations acknowledge a practice step, not proven language mastery.

The bear is integrated into the main app's welcome, learning, question feedback and progress views; standalone Fidäl activities, picture-word help/completion, the word path, Game Garden and pronunciation cards; and the separate Stories library/reader. Captions explain its actions, Quiet view hides decorative art, and reduced-motion preferences preserve static poses. No animation loops or forced waiting are introduced. Bedtime reading uses a still sleepy bear outside the prose, without a voice feature.

The standalone companion is an optional view adapter observing screen markers. It does not mutate answers, unlocks, review evidence, learner history or writing data. Its image fallback works without the animation module, and a failed image leaves captions and activity controls usable. The React wrapper uses the same exported SVG assets and keeps quiet mode while its feedback state changes.

## A bear guide, with a human articulation close-up

A bear's muzzle is not presented as human speech anatomy. The expressive animal may open or close its mouth as character acting, while the **explicitly labelled schematic human lip guide** shows the source-backed articulatory contact. The close-up keeps the existing geometry and evidence limits for lip closure/release, upper-teeth/lower-lip contact and schematic nasal airflow. No new Tigrinya words, translations, pronunciations or unsourced sound-to-pose mappings were added.

## What the lip guides teach

The activity's target remains the existing **Fidäl syllabic form**. The current guides teach only a named consonant component, not its vowel, full syllable, voicing contrast or word-context realization. They are source-supported schematic drafts, not native-approved pronunciation models.

| Component                 | Visible sequence                                               | Existing forms offered |
| ------------------------- | -------------------------------------------------------------- | ---------------------- |
| /b/ bilabial stop         | Lips approach, meet, then separate                             | በ ቡ ቢ ባ ቤ ቦ            |
| /m/ bilabial nasal        | Lips approach, remain closed; schematic nasal airflow is shown | መ ሙ ሚ ማ ሜ ሞ            |
| /f/ labiodental fricative | Upper teeth approach and contact the lower lip, then separate  | ፈ ፉ ፊ ፋ ፌ ፎ            |

Only these **18 exact bindings** are offered. Sixth-order readings, contextual words, labialized forms and every other family show a clear unavailable-guide message. No default pose is substituted for an unsupported sound. In particular, /b/ has context- and variety-dependent spirantization, and a lip-only view cannot establish the /b/–/m/ sound contrast. No tongue position is invented. The dotted nasal lines are schematic flow cues, not measured anatomy or a recording.

After **I tried · show support**, open **Watch the lips with Neri**. Choose Start, Middle or End, or play the silent movement once. Slow doubles the visual tutorial's duration, not the speed of speech. The 2.4/4.8-second teaching durations are product choices, not phonetic measurements. Revealing these cues never awards a pronunciation success; the existing supported-retry and self-rating gates remain in control.

## Audio synchronization and privacy

Currently the repository has **zero approved native pronunciation models and zero reviewed lip timelines**. The live app therefore provides silent component demonstrations and unscored card practice. It does not generate speech, infer a reading from a Latin label or pretend that animation is synchronized to missing audio.

The synchronization adapter requires the existing approved Tigrinya card/audio gate plus a separate reviewed alignment for the exact character, target kind, variety, normal/slow asset path and recording hash. Frames have reviewed absolute millisecond timestamps and a named component segment within that recording. The builder verifies the real asset bytes; the player checks recording duration and follows `audio.currentTime`, including seeks, buffering, pauses and errors. Outside the reviewed consonant segment Neri rests its mouth rather than improvising the vowel. A reviewed recording without reviewed timing plays with an explicit no-lip-sync explanation. Normal and slow recordings require separate timelines.

The guide also needs its own qualified review before synchronized use: record `language: ti`, identified reviewer, date, variety, rights and precise evidence in its profile review, and copy the exact generated profile `revision` into `review.revision`. That hash binds the guide's source prompts and the actual SVG drawing code. A drawing or prompt change invalidates the previous approval for synchronization; the builder never silently renews it.

To add a real timeline, enter a qualified review in `shared/content-review/articulation.json` under `alignments`, with `status: approved`, `scope: consonant-component`, character/profile, `targetKind: syllabic-form`, matching variety, `speed`, `audioPath`, SHA-256, recording `durationMs`, identified reviewer, ISO review date, rights and precise source evidence. Frames must be ordered and bounded, with `atMs`, stage 0–2 and bounded `open`, `contact` and `nasal` pose values. Obtain the existing card and recording approval separately. The builder and runtime reject mismatches. Do not mark an alignment approved just to enable animation.

The mascot requests no microphone, recognition, synthesis, external service or storage. Existing optional private recording is retained unchanged, including denial/unavailable handling and track/clip cleanup. No attempt is automatically graded. Quiet/static choices last only in the page. The bear appears outside story prose; Stories remains separate from course progress and has no added voice reading.

## Sources and design consequences

- [Harvard ELIAS Tigrinya alphabet unit](https://elias.fas.harvard.edu/languages/tigrinya/Beginning/1/Unit-1-Alphabets), Table 1.1: binds the existing B/M/F forms to their actual families and vowel orders; no English letter-name reading is inferred.
- [Maria Bulakh, Tigrinya (2019)](https://joverfelt.net/wp-content/uploads/2023/09/bulakh-2019-tigrinya.pdf), §3.1, Table 8.2, printed pp. 176–177: consonant inventory and context/variety changes, particularly non-geminated /b/. Guides remain component-only and exclude contextual targets.
- [International Phonetic Association chart](https://www.internationalphoneticassociation.org/IPAcharts/common_files/pdfs/pdfs_IPA_charts_E/IPA_unitipa.pdf): articulatory classes for /b/, /m/ and /f/. This supports the broad lip-contact and nasal distinction; it does not verify a new cartoon, teaching sequence or Tigrinya audio.
- [University of Glasgow Seeing Speech](https://www.seeingspeech.ac.uk/ipa-charts/): articulatory visualization as a model for showing relevant structure. No source videos, speech or drawings were imported.
- [Castro-Alonso et al. (2021), pedagogical-agent meta-analysis](https://doi.org/10.1007/s10648-020-09587-1): evidence does not establish that more animation is better. Neri directs attention only when requested; no learning-efficacy claim is made for this character or age group.
- [W3C C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html) and [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html): a static baseline, OS motion preference, explicit playback/stop and still pictures rather than compulsory movement.
- [MDN `currentTime`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime) and [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame): use the media clock for reviewed synchronization, cancel animation on cleanup and keep visual pacing separate from speech timing.

The artwork and animations were created for this project. No competitor character, costume, voice, signature animation, cultural stereotype or claimed traditional character was used. No new Tigrinya words or translations were authored for this task. A qualified reviewer must still check cultural suitability, name, prompts, physical contact depiction, scope, flow cues, chosen variety and any future recordings/timings.
