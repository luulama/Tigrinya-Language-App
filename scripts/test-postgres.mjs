import EmbeddedPostgres from "embedded-postgres";
import { mkdtemp, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
await mkdir(".tools", { recursive: true });
const directory = await mkdtemp(
  join(process.cwd(), ".tools", "postgres-test-"),
);
const port = await new Promise((resolve, reject) => {
  const socket = createServer();
  socket.on("error", reject);
  socket.listen(0, "127.0.0.1", () => {
    const { port } = socket.address();
    socket.close(() => resolve(port));
  });
});
const password = randomBytes(24).toString("hex");
const postgres = new EmbeddedPostgres({
  databaseDir: directory,
  user: "polyglot",
  password,
  port,
  persistent: false,
  createPostgresUser: false,
  autoRehydrateSymlinks: true,
  authMethod: "scram-sha-256",
  postgresFlags: ["-h", "127.0.0.1", "-k", "/tmp"],
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  onLog: () => {},
  onError: (message) =>
    console.error(String(message).replaceAll(password, "[redacted]")),
});
const connection = `Host=127.0.0.1;Port=${port};Database=polyglot_test;Username=polyglot;Password=${password}`;
function run(args, extra = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn("dotnet", args, {
      stdio: "inherit",
      env: { ...process.env, ...extra, ASPNETCORE_ENVIRONMENT: "Development" },
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(Error(`dotnet exited with ${code}`)),
    );
  });
}
try {
  await postgres.initialise();
  await postgres.start();
  await postgres.createDatabase("polyglot_test");
  await run(
    [
      "run",
      "--project",
      "apps/api/Polyglot.Api",
      "--no-launch-profile",
      "--no-build",
      "--",
      "--migrate",
    ],
    { ConnectionStrings__Database: connection },
  );
  await run(
    [
      "run",
      "--project",
      "apps/api/Polyglot.Api",
      "--no-launch-profile",
      "--no-build",
      "--",
      "--seed",
      "--drafts",
      join(process.cwd(), "content/tigrinya-drafts.json"),
    ],
    { ConnectionStrings__Database: connection },
  );
  await run(
    [
      "test",
      "PolyglotCore.sln",
      "--no-build",
      "--logger",
      "console;verbosity=normal",
    ],
    { POLYGLOT_TEST_POSTGRES: connection },
  );
  console.log(
    "PASS: PostgreSQL 16 migrations, draft import, API and database integration tests.",
  );
} finally {
  await postgres.stop();
}
