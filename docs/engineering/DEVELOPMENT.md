# Development setup

Install Node 24 and the .NET 10 SDK selected by root global.json. Python 3 is needed for the preserved preview and its content checks. Docker is optional; PostgreSQL can also run through the isolated embedded test harness. The workspace-local SDKs under .tools are development tools and are not committed.

Run commands from the repository root. `bash scripts/tool.sh` selects workspace-local tools when available and otherwise uses installed tools. It disables tool telemetry and directs tool caches into .tools.

```sh
bash scripts/tool.sh npm ci --ignore-scripts
bash scripts/tool.sh dotnet restore --locked-mode
bash scripts/tool.sh npm run dev
```

The web app opens at http://127.0.0.1:3000. Fidäl and word previews work without an account. Published libraries need the API and database. Account tools explain when sign-in has not been configured; no demonstration account is created.

The root `npm run dev` and `npm run build` commands automatically prepare the source-bound standalone previews before Next.js starts or builds. The mascot exporter uses the same `scripts/tool.sh` tool selection as the other development commands, including when preparation is invoked directly from Python on a Mac without global Node on `PATH`. To prepare assets alone, run `python3 scripts/prepare_web_preview.py` or `bash scripts/tool.sh npm run prepare:preview`. Preparation preserves content approval states and learner data.

For a complete local API/database without Docker, first build the .NET solution, then run `bash scripts/tool.sh npm run dev:api` in another terminal. It creates a loopback-only PostgreSQL 16 database with a randomly generated password kept in a mode-600 ignored file, applies migrations and imports drafts. Existing local data is retained on stop/restart; no production account is created.

For an existing local PostgreSQL database, set ConnectionStrings__Database in the shell and initialise it explicitly:

```sh
ASPNETCORE_ENVIRONMENT=Development bash scripts/tool.sh dotnet run --project apps/api/Polyglot.Api --no-launch-profile -- --migrate
ASPNETCORE_ENVIRONMENT=Development bash scripts/tool.sh dotnet run --project apps/api/Polyglot.Api --no-launch-profile -- --seed --drafts "$PWD/content/tigrinya-drafts.json"
ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS=http://127.0.0.1:5080 bash scripts/tool.sh dotnet run --project apps/api/Polyglot.Api --no-launch-profile
```

Set ASPNETCORE_ENVIRONMENT=Development for local migration/seed commands as well. `dotnet run` changes the working directory to the API project, so use the absolute draft path shown above. --migrate applies real EF migrations; --seed adds Tigrinya language metadata and idempotently imports sourced draft candidates. It never adds users, approved examples, synthetic pronunciation or published courses.

Alternatively, set POSTGRES_PASSWORD to a newly generated local password and run `docker compose -f infrastructure/docker/compose.yml up --build`. The database and application ports bind to loopback only. Apply migrations with `docker compose -f infrastructure/docker/compose.yml run --rm api --migrate` before expecting readiness. Volumes preserve local data; do not remove them to resolve a routine error.

## Entra configuration

Create separate SPA and API registrations in an Azure Entra External ID external tenant. Enable the intended sign-up/sign-in user flow. Register the SPA redirect URI using the exact web origin plus /signin. Expose an API delegated scope named access_as_user and consent the SPA to that scope. Assign application roles deliberately; a user cannot assign roles from this UI.

Configure Entra__Authority using the external tenant's HTTPS ciamlogin authority, Entra__Audience with the API audience, Entra__WebClientId with the SPA client ID, and Entra__ApiScope with the full delegated API scope. Entra__ScopeName defaults to access_as_user. The API validates signature, issuer, audience, lifetime and trusted role claims. Profiles default to child-safe analytics settings. Adult classification or optional analytics consent requires Administrator authority or the issuer-provided polyglot_verified_adult=true claim; do not map that claim from a self-editable sign-up field. Presentation choice alone never establishes adult status. No client secret is placed in the SPA. Browser tokens use memory storage; redirected authentication uses the identity library's transient flow state. Refreshing a page may require another sign-in/SSO roundtrip.

The default API allows both localhost:3000 and 127.0.0.1:3000 origins. For deployment, configure exact HTTPS origins and AllowedHosts. NEXT_PUBLIC_API_URL is a public build-time setting, not a secret; rebuild the web image when it changes.

## Local tests

```sh
bash scripts/tool.sh dotnet test PolyglotCore.sln
bash scripts/tool.sh npm run typecheck
bash scripts/tool.sh npm test
bash scripts/tool.sh node scripts/test-postgres.mjs
python3 scripts/check_all.py --node node
PLAYWRIGHT_CHANNEL=chrome bash scripts/tool.sh npm run test:e2e
```

The PostgreSQL harness creates its own random-password cluster and dedicated polyglot_test database, applies migrations, imports drafts, runs API/database tests and stops the cluster. It removes only its newly created temporary test cluster. It never connects to an existing database unless an explicit test setting is provided. Docker-based CI uses a dedicated PostgreSQL service instead.

A managed sandbox may require local process/socket permission for the .NET test host, PostgreSQL and browser servers. That is an execution restriction, not a reason to disable authentication or skip assertions.
