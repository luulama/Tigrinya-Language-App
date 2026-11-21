# Say & remember — Unit 1 pronunciation cards

Implemented locally, 21 November 2026. No publication, native approval or efficacy claim is implied.

## Learning goal and loop

Recall a previously taught Fidäl reading, compare against a reviewed Tigrinya model, reflect and revisit after other material. Five initial cards plus at most two separated supported revisits bound a session; this is a design choice, not a measured duration.

The card front hides family/order support, pronunciation guidance and reference playback. The learner speaks, optionally making a private clip, then chooses **I tried · show support**. A complete reviewed-model playback enables **Got it**, **Almost** and **Need to practise**. Normal/slow replay and a supported retry are available. Pause stops capture/playback and deletes the private clip. Completion offers another small set or Unit 1. There is no win/loss judgement or automatic pronunciation score.

There are currently **zero approved models for the 293 existing forms**. The real app clearly offers unscored exploration until recordings arrive. Missing-model visits never become successful pronunciation ratings. Sixth-order forms without reviewed word context invite exploration, not an invented isolated reading. No synthetic or Amharic audio is supplied.

The original Unit 1 family order, lessons, shape checks and writing workshop remain intact. Exactly one link and an isolated storage extension were added to its existing sources. Preservation tests retain the original hashes and remove only these additions in memory before comparison.

## Intended pronunciation and sources

The target is the Tigrinya **syllabic form**, not an English consonant name. The existing curriculum and [Harvard ELIAS Tigrinya alphabet unit](https://elias.fas.harvard.edu/languages/tigrinya/Beginning/1/Unit-1-Alphabets) organise forms by vowel orders. The [BGN/PCGN reference](https://assets.publishing.service.gov.uk/media/634e725ed3bf7f618eda950c/ROMANIZATION_OF_TIGRINYA_22.pdf) describes left-to-right consonant-vowel units and context-dependent sixth-order readings. Its geographical-name romanization is structural evidence, not a child pronunciation guide or native audio.

Every playable model needs an explicit qualified native decision identifying target reading and variety. Sixth-order targets require an approved existing word context and a recording of that word; the word is then part of the attempt cue. Unicode names, character count, transliteration and Amharic forms are never used to infer a pronunciation. Family/order support is structural information, not an approved phonetic hint.

## Review policy and evidence

A first **Got it** schedules one day. Qualifying due self-ratings in distinct sessions expand to 3, 7, 14, 30 and 60 days. Expansion requires 24 hours since the previous attempt and model, no supported retry, and an attempt captured before the new reference playback. Hearing a model without rating still records exposure. Same-day repetitions do not create delayed evidence.

**Need to practise** resets expansion and schedules ten minutes or three actual card advances. **Almost** resets expansion and schedules twelve hours or five advances. When enough work remains, at most two supported revisits return after two/three other cards respectively. Insufficient room defers the revisit. **Got it** also has a twelve-card fallback. Selection prioritises due forms, then unseen ones, and can interleave source families. No unverified confusion pairs are encoded. A one-card inventory cannot create artificial spacing.

Records include attempts, each rating, model exposure, calendar/card due points, expansion step, recent outcomes (12), deduplication IDs (32) and a bounded session window (24). Sessions renew after thirty minutes idle. Counts are explicitly self-reported reflection, not measured pronunciation, retention probability or mastery. This is a heuristic scheduler, not FSRS or a validated memory predictor.

## Persistence and optional microphone

The existing opt-in `tigrinya.practice.v1` profile stores a separate `pronunciation` property. Visual checks, families, preferences, other keys and Unit 2 path progress are preserved. Existing stop-saving/clear behavior applies to that same local profile. Default practice remains in the current page; reopen persistence requires explicit device saving. Shared-device users share history. No account or cloud is added.

The optional microphone holds one current-card clip in memory, with no upload or persistent voice storage. Capture stops after eight seconds, without a countdown or penalty. Continue, skip, retry, pause, page exit and hidden-page pause stop tracks, discard chunks and revoke object URLs. A late permission response is stopped if its request was cancelled. Denied permission, absent/busy devices and unsupported browsers preserve speaking aloud and unscored continuation.

[MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) informed explicit permission and secure-context handling. [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) informed capability/MIME detection, recording events and local playback. Permission is requested only after **Record my try**.

Automatic recognition/scoring is disabled. [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) documents limited compatibility and potential server processing. [The Web Speech specification](https://w3c.github.io/speech-api/) and [on-device explainer](https://github.com/WebAudio/web-speech-api/blob/main/explainers/on-device-speech-recognition.md) describe language-pack availability, not guaranteed Tigrinya accuracy. Reliable Tigrinya isolated-Fidäl support was not established; setting `lang="ti"` cannot establish it. No recognition, synthesis or language-pack call is made.

## Supplying real recordings without changing game logic

All cards currently need qualified native recording/review; no JSON approval was invented. A recording/import UI is not used as a substitute for content review.

1. Use the existing forms in `shared/content-review/fidal-writing.json`. Obtain clear, licensed normal and deliberately slow native recordings. Record speaker identity, recording date, variety and the exact intended target in source evidence. Slow playback uses a separate reviewed recording, not electronically distorted phonetics.
2. Put files under `shared/assets/`. Complete the existing form audio record with `status: approved`, `language: ti`, `normal`, `slow`, identified `reviewer`, ISO `reviewedAt`, `rights`, HTTPS `sourceUrl` and precise `sourceLocator`.
3. Add an explicit target in `shared/content-review/pronunciation-cards.json`: `character`, `kind` (`syllabic-form` or `contextual-word`), `variety`, the same provenance/review fields and optional reviewed `guide`. Contextual targets also require `text` matching an approved existing context. Sixth-order targets must use this kind. Evidence must identify the actual audio and reading approved.
4. Run `python3 scripts/build_pronunciation_cards.py`, checks and preview packaging. Unknown/duplicate targets, invalid sixth-order contexts and missing reviewed files fail the build. Runtime gates independently check review metadata, local paths and target type. Referenced reviewed files are included in the runtime package.
5. Verify each actual recording in browsers and with the reviewer. Metadata alone does not establish linguistic correctness or rights.

## Research decisions

- [Karpicke & Roediger (2008)](https://doi.org/10.1126/science.1152408): preserve retrieval after initial success; self-confidence is not objective accuracy. Their adult vocabulary experiment does not validate this children's pronunciation game.
- [IES learning guide](https://ies.ed.gov/ncee/WWC/PracticeGuide/1/Published): spaced encounters, active retrieval and model/feedback-informed practice. Answers stay hidden before the attempt, with comparison afterwards.
- [Serrano (2022), L2 distribution-of-practice review](https://doi.org/10.14746/ssllt.2022.12.3.2): spacing depends on task and learner. Exact day/card intervals and family mixing are initial product decisions requiring evaluation, not universally optimal settings.
- [Carpenter & Mueller (2013), pronunciation experiment](https://doi.org/10.3758/s13421-012-0291-4): blocked practice outperformed interleaving in their French-word task. Mixing is not automatically better for every pronunciation target. The game therefore begins with one family; mixed-family practice is an optional set, and no unreviewed confusion-pair training is asserted to be effective.

## Remaining verification

Qualified native approval is still required for all forms, targets, contexts, support instructions, variety and recordings. Physical mobile microphone/stylus/IME behavior, screen readers, independent child usability and longitudinal effectiveness need direct evaluation. Browser tests using labelled synthetic tones validate playback mechanics only; they never validate Tigrinya speech.

Implementation files are `pronunciation.html`, `pronunciation.css`, `pronunciation-content.js`, `pronunciation-core.js` and `pronunciation-app.js` under Unit 1, the content generator/review manifest, and the small existing-history extension. Checks and actual results are recorded in `docs/engineering/PRONUNCIATION_CARDS_TEST_REPORT.md`.
