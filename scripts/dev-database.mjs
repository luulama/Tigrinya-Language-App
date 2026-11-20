import EmbeddedPostgres from "embedded-postgres";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { spawn } from "node:child_process";
const root = process.cwd(),
  directory = join(root, ".tools", "development"),
  data = join(directory, "postgres");
await mkdir(directory, { recursive: true, mode: 0o700 });
const credentials = join(directory, "database.json");
let settings;
try {
  settings = JSON.parse(await readFile(credentials, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  try {
    await access(join(data, "PG_VERSION"));
    throw Error(
      "Existing database has no matching credential file. Preserve it and recover its credentials.",
    );
  } catch (check) {
    if (check.code !== "ENOENT") throw check;
  }
  settings = { password: randomBytes(24).toString("hex"), port: 54329 };
  await writeFile(credentials, JSON.stringify(settings), {
    mode: 0o600,
    flag: "wx",
  });
}
if (
  !settings ||
  typeof settings.password !== "string" ||
  !/^([a-f0-9]{48})$/.test(settings.password) ||
  settings.port !== 54329
)
  throw Error(
    "Local database settings are invalid. Preserve existing data and recover the matching credentials.",
  );
const postgres = new EmbeddedPostgres({
  databaseDir: data,
  user: "polyglot",
  password: settings.password,
  port: settings.port,
  persistent: true,
  createPostgresUser: false,
  autoRehydrateSymlinks: true,
  authMethod: "scram-sha-256",
  postgresFlags: ["-h", "127.0.0.1", "-k", "/tmp"],
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  onLog: () => {},
  onError: (message) =>
    console.error(String(message).replaceAll(settings.password, "[redacted]")),
});
const env = {
  ...process.env,
  ASPNETCORE_ENVIRONMENT: "Development",
  ASPNETCORE_URLS: "http://127.0.0.1:5080",
  ConnectionStrings__Database: `Host=127.0.0.1;Port=${settings.port};Database=polyglot;Username=polyglot;Password=${settings.password}`,
};
const dll = join(
    root,
    "apps/api/Polyglot.Api/bin/Debug/net10.0/Polyglot.Api.dll",
  ),
  cwd = join(root, "apps/api/Polyglot.Api");
function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("dotnet", [dll, ...args], {
      cwd,
      env,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(Error(`API command exited with ${code}`)),
    );
  });
}
let api,
  stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  if (api) {
    api.kill("SIGTERM");
    await new Promise((resolve) => {
      if (api.exitCode !== null) return resolve();
      api.once("exit", resolve);
    });
  }
  await postgres.stop();
}
process.once("SIGINT", () => void stop());
process.once("SIGTERM", () => void stop());
try {
  try {
    await access(join(data, "PG_VERSION"));
  } catch {
    await postgres.initialise();
  }
  await postgres.start();
  const client = postgres.getPgClient("postgres");
  await client.connect();
  const exists = await client.query(
    "SELECT 1 FROM pg_database WHERE datname=$1",
    ["polyglot"],
  );
  await client.end();
  if (!exists.rowCount) await postgres.createDatabase("polyglot");
  await run(["--migrate"]);
  await run(["--seed", "--drafts", join(root, "content/tigrinya-drafts.json")]);
  console.log(
    "Local PostgreSQL is ready. Starting API at http://127.0.0.1:5080. Credentials stay in .tools/development; no account or approval was created.",
  );
  api = spawn("dotnet", [dll], { cwd, env, stdio: "inherit" });
  await new Promise((resolve, reject) => {
    api.on("error", reject);
    api.on("exit", (code) =>
      stopping || code === 0
        ? resolve()
        : reject(Error(`API exited with ${code}`)),
    );
  });
} finally {
  await stop();
}
