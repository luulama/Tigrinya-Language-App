import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readMobileConfig, placeholderId } from "../scripts/config.mjs";

async function withIdentity(value, run) {
  const folder = await mkdtemp(join(tmpdir(), "tigrinya-device-config-test-"));
  const file = join(folder, "device.local.json");
  try {
    if (value !== undefined)
      await writeFile(
        file,
        typeof value === "string" ? value : JSON.stringify(value),
      );
    await run(file);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
}
const identity = {
  appId: "org.fixtureowner.language",
  appName: "Fixture name",
};
test("missing local identity keeps the offline placeholder build available", async () => {
  await withIdentity(undefined, async (file) => {
    const config = await readMobileConfig({}, file);
    assert.equal(config.appId, placeholderId);
    assert.equal(config.apiUrl, null);
  });
});
test("owner identity persists across builds without enabling backend or database configuration", async () => {
  await withIdentity(identity, async (file) => {
    for (let i = 0; i < 2; i++) {
      const config = await readMobileConfig(
        {
          NEXT_PUBLIC_API_URL: "http://127.0.0.1:5080",
          DATABASE_URL: "test-only-unused",
        },
        file,
      );
      assert.equal(config.appId, identity.appId);
      assert.equal(config.appName, identity.appName);
      assert.equal(config.apiUrl, null);
      assert.equal(config.authEnabled, false);
      assert.equal(config.environment, "offline");
    }
  });
});
test("explicit identity environment values override the local public identity", async () => {
  await withIdentity(identity, async (file) => {
    const config = await readMobileConfig(
      {
        MOBILE_APP_ID: "org.fixtureowner.other",
        MOBILE_APP_NAME: "Other fixture",
      },
      file,
    );
    assert.equal(config.appId, "org.fixtureowner.other");
    assert.equal(config.appName, "Other fixture");
  });
});
test("local identity never accepts API, signing, account or secret settings", async () => {
  for (const extra of [
    "MOBILE_API_URL",
    "apiUrl",
    "signingTeam",
    "password",
    "token",
    "__proto__",
  ]) {
    await withIdentity(
      JSON.stringify({ ...identity, [extra]: "test-only-disallowed" }),
      (file) =>
        assert.rejects(readMobileConfig({}, file), /only appId and appName/),
    );
  }
});
test("incomplete templates and malformed JSON fail without revealing their contents", async () => {
  await withIdentity({ appId: null, appName: null }, (file) =>
    assert.rejects(readMobileConfig({}, file), /Fill in your own/),
  );
  await withIdentity('{"appName":"do-not-print-this-fixture', async (file) => {
    await assert.rejects(readMobileConfig({}, file), (error) => {
      assert(!error.message.includes("do-not-print"));
      return /valid JSON/.test(error.message);
    });
  });
});
test("a public identity file cannot bypass explicit production acknowledgement", async () => {
  await withIdentity(identity, (file) =>
    assert.rejects(
      readMobileConfig(
        {
          MOBILE_ENV: "production",
          MOBILE_API_URL: "https://api.fixture-owner.org",
        },
        file,
      ),
      /MOBILE_ALLOW_PRODUCTION_API/,
    ),
  );
});
