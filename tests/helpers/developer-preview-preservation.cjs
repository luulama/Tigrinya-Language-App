/* Reverse exact owner-requested preview hooks before checking frozen course hashes. */
const assert = require("node:assert/strict");
const patches = require("../fixtures/developer-preview-replacements.json");
module.exports = function withoutDeveloperPreview(file, bytes) {
  const replacements = patches.filter((p) => p.file === file);
  if (!replacements.length) return bytes;
  let text = bytes.toString();
  for (const patch of replacements.reverse()) {
    assert.equal(
      text.split(patch.to).length,
      2,
      "Missing or duplicated preview replacement: " + file,
    );
    text = text.replace(patch.to, patch.from);
  }
  return Buffer.from(text);
};
