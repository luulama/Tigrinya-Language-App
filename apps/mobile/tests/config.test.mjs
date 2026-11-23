import test from "node:test";
import assert from "node:assert/strict";
import {
  mobileConfig,
  capacitorConfig,
  placeholderId,
} from "../scripts/config.mjs";

// DNS-shaped fixtures are parsed locally only. These are not supplied backend addresses.
const fixture = "https://api.fixture-owner.org";
test("offline is the default and never inherits the web loopback or API URL", () => {
  const result = mobileConfig({ NEXT_PUBLIC_API_URL: "http://127.0.0.1:5080" });
  assert.equal(result.apiUrl, null);
  assert.equal(result.environment, "offline");
  assert.equal(result.appId, placeholderId);
  assert.equal(capacitorConfig(result).server.url, undefined);
});
test("offline refuses an accidentally inherited mobile API", () =>
  assert.throws(
    () => mobileConfig({ MOBILE_API_URL: fixture }),
    /Offline builds reject/,
  ));
test("non-offline configurations need an explicit URL and known environment", () => {
  assert.throws(() => mobileConfig({ MOBILE_ENV: "staging" }), /HTTPS/);
  assert.throws(
    () => mobileConfig({ MOBILE_ENV: "development" }),
    /MOBILE_ENV/,
  );
});
test("HTTP, loopback aliases, IPs, credentials and placeholder hosts fail closed", () => {
  for (const url of [
    "http://api.fixture-owner.org",
    "https://127.0.0.1",
    "https://0x7f000001",
    "https://[::1]",
    "https://[::ffff:127.0.0.1]",
    "https://0.0.0.0",
    "https://localhost",
    "https://a.localhost",
    "https://192.168.1.2",
    "https://api.invalid",
    "https://api.example.com",
    "https://me:password@api.fixture-owner.org",
    fixture + "/api",
    fixture + "?key=a",
    fixture + "#token",
  ])
    assert.throws(
      () => mobileConfig({ MOBILE_ENV: "staging", MOBILE_API_URL: url }),
      undefined,
      url,
    );
});
test("staging accepts only an explicit HTTPS origin", () =>
  assert.equal(
    mobileConfig({ MOBILE_ENV: "staging", MOBILE_API_URL: fixture + "/" })
      .apiUrl,
    fixture,
  ));
test("production requires deliberate opt-in and owner identity", () => {
  const env = { MOBILE_ENV: "production", MOBILE_API_URL: fixture };
  assert.throws(
    () => mobileConfig(env),
    /acknowledgement|MOBILE_ALLOW_PRODUCTION_API/,
  );
  assert.throws(
    () => mobileConfig({ ...env, MOBILE_ALLOW_PRODUCTION_API: "yes" }),
    /owner-supplied/,
  );
  const config = mobileConfig({
    ...env,
    MOBILE_ALLOW_PRODUCTION_API: "yes",
    MOBILE_APP_ID: "org.fixtureowner.language",
    MOBILE_APP_NAME: "Fixture-only name",
  });
  assert.equal(config.authEnabled, false);
  assert.equal(config.apiUrl, fixture);
});
test("malformed bundle IDs and unsafe display names are rejected", () => {
  for (const id of [
    "bad",
    "../escape",
    "com..app",
    "com.company.app;TEAM=evil",
  ])
    assert.throws(() => mobileConfig({ MOBILE_APP_ID: id }));
  for (const name of ["\nname", "<name>", '"name"'])
    assert.throws(() => mobileConfig({ MOBILE_APP_NAME: name }));
});
