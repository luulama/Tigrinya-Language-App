# Local redesign fonts

The web redesign uses Fraunces, Source Sans 3 and Noto Sans Ethiopic. These original Google Fonts WOFF2 files are served from this app's own `/fonts/` directory. No Google Fonts stylesheet, preconnect or runtime font request is needed. `font-display: swap` and the existing system font fallbacks remain available.

The three files total 294,220 bytes. Latin subsets support English and Swedish letters; guides currently use English. The Ethiopic subset supplies the source script. Font availability is not approval of Tigrinya spelling, pronunciation or handwriting instruction. The standalone previews and mobile target retain their existing fonts.

[manifest.json](manifest.json) records exact source URLs, weights, Unicode ranges, byte sizes and SHA-256 hashes, fetched on 26 November 2026. The font binaries are unmodified downloads. The respective SIL Open Font License and copyright notices are included, with line endings and trailing whitespace normalized:

- [Fraunces license](OFL-fraunces.txt), from [google/fonts](https://github.com/google/fonts/tree/main/ofl/fraunces).
- [Source Sans 3 license](OFL-sourcesans3.txt), from [google/fonts](https://github.com/google/fonts/tree/main/ofl/sourcesans3).
- [Noto Sans Ethiopic license](OFL-notosansethiopic.txt), from [google/fonts](https://github.com/google/fonts/tree/main/ofl/notosansethiopic).

No font download or new service is required during build or learner use. Keep each license with its font when packaging the app. Browser regression tests check successful local loading, representative English/Swedish/Ethiopic rendering, absence of external font requests and runtime errors.
