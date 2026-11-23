# Silent audio transport fixture

`synthetic-silence.m4a` contains one tenth of a second of generated silence, encoded locally with Apple's `afconvert` from a zero-filled, mono 44.1 kHz PCM WAV. It is test data, not speech, a native recording or approved language content. It is never copied into `www` or the iOS app.

The browser transport test uses it to verify that a valid MP4/AAC clip can reach the playback controls without a decoding error. Real microphone capture, permission UI, playback volume and audio interruptions still require a physical iPhone.
