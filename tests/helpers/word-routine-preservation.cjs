/* Exact Unit 2-only hooks; normalize before the frozen earlier baselines. */
const assert = require("node:assert/strict");
const patches = require("../fixtures/word-routine-replacements.json");
module.exports = (file, bytes) => {
  const changes = patches.filter((p) => p.file === file);
  if (!changes.length) return bytes;
  let text = bytes.toString();
  for (const patch of changes.reverse()) {
    assert.equal(
      text.split(patch.to).length,
      2,
      "Missing or duplicated word-routine hook: " + file,
    );
    text = text.replace(patch.to, patch.from);
  }
  return Buffer.from(text);
};
