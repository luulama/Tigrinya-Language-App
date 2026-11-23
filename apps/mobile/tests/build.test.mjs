import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { build, mobile, sha } from "../scripts/build.mjs";

test("an invalid build fails before replacing the previous checked bundle", async () => {
  const file = join(mobile, "www/mobile/build-manifest.json");
  const before = sha(await readFile(file));
  await assert.rejects(
    build({
      MOBILE_ENV: "production",
      MOBILE_API_URL: "http://127.0.0.1:5080",
    }),
  );
  assert.equal(sha(await readFile(file)), before);
});

test("release readiness fails explicitly for the current pending preview", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/check.mjs", "--release"],
    { cwd: mobile, encoding: "utf8" },
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /RELEASE BLOCKED/);
  assert.match(result.stderr, /content\/audio review is pending/);
});
