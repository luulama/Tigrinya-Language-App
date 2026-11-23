/* Remove only the four explicit optional hooks and five asset tags authorized by
 * the mascot task. Existing baseline hashes remain frozen, not regenerated. */
const hooks = new Set([
  "root.MascotPractice?.stopAudio();",
  "root.MascotPractice?.stop();",
  "root.MascotPractice?.render(host, phase, current(), rating, playback, voiceStatus, audioError);",
  "root.MascotPractice?.audioPlaying(audio, c, slow);",
]);
const tags = new Set([
  '<link rel="stylesheet" href="../shared/mascot/neri.css" />',
  '<script src="../shared/mascot/neri.js"></script> <script src="../shared/mascot/articulation-data.js"></script> <script src="../shared/mascot/articulation-core.js"></script> <script src="../shared/mascot/practice.js"></script>',
]);
module.exports = function withoutMascot(name, bytes) {
  bytes = require("./bear-preservation.cjs")(name, bytes);
  if (
    ![
      "unit-01-fidel-foundations/pronunciation-app.js",
      "unit-01-fidel-foundations/pronunciation.html",
    ].includes(name)
  )
    return bytes;
  return Buffer.from(
    bytes
      .toString()
      .replace(
        /^ +(?:\/\/|<!--) NERI:BEGIN(?: -->)?\n([\s\S]*?)^ +(?:\/\/|<!--) NERI:END(?: -->)?\n/gm,
        (_, body) => {
          const normalized = body
            .trim()
            .replace(/\s+/g, " ")
            .replace(/\(\s+/g, "(")
            .replace(/,\s*\)/g, ")");
          if (!(name.endsWith(".js") ? hooks : tags).has(normalized))
            throw Error("Unexpected mascot preservation exception: " + name);
          return "";
        },
      ),
  );
};
