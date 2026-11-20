// @vitest-environment node
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
it("never intercepts identity callbacks, account pages, queries or bearer requests", () => {
  const listeners = new Map<string, (event: unknown) => void>();
  runInNewContext(
    readFileSync(
      new URL("../../../apps/web/public/sw.js", import.meta.url),
      "utf8",
    ),
    {
      URL,
      self: {
        location: { origin: "https://learning.test" },
        addEventListener: (name: string, handler: (event: unknown) => void) =>
          listeners.set(name, handler),
      },
    },
  );
  const forbidden = [
    "/signin?code=synthetic-test-code",
    "/signup",
    "/progress",
    "/parents",
    "/admin",
    "/api/users/me",
    "/learn?private=synthetic",
  ];
  for (const path of forbidden) {
    let intercepted = false;
    listeners.get("fetch")!({
      request: {
        method: "GET",
        url: "https://learning.test" + path,
        headers: new Headers(),
      },
      respondWith() {
        intercepted = true;
      },
    });
    expect(intercepted).toBe(false);
  }
  let intercepted = false;
  listeners.get("fetch")!({
    request: {
      method: "GET",
      url: "https://learning.test/learn",
      headers: new Headers({ Authorization: "Bearer synthetic-test-token" }),
    },
    respondWith() {
      intercepted = true;
    },
  });
  expect(intercepted).toBe(false);
});
