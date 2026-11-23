/* Reverse only the recorded appearance replacements. Course/content hashes stay frozen. */
const replacements = require("../fixtures/bear-ui-replacements.json");
module.exports = function withoutBear(file, bytes) {
  const patches = replacements.filter((p) => p.files.includes(file));
  if (!patches.length) return bytes;
  let text = bytes.toString();
  for (const patch of patches.reverse()) {
    if (!text.includes(patch.to))
      throw Error("Missing exact bear-only replacement: " + file);
    text = text.replace(patch.to, patch.from);
  }
  return Buffer.from(text);
};
