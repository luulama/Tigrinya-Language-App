# Polyglot Core engineering guide

The implementation is a modular monolith: Next.js web client, ASP.NET Core API, PostgreSQL persistence and separate shared packages. The original standalone Tigrinya app remains available and is copied into the new web app as an explicitly pending-review practice preview.

The [production platform blueprint](../production/README.md) extends this baseline with proposed pronunciation, assessment, offline and operating contracts. It includes the twenty requested design deliverables, SQL/API specifications and checked cost arithmetic. It is a proposed design package, not implemented runtime features or approval of learning content.

The [learning entry systems](../learning-experience/README.md) are a subsequent implemented increment: first visual practice, heritage starting recommendations, Mele preferences and protected parent summaries, with an additive EF migration and [separate validation record](../learning-experience/VALIDATION.md). It introduces no pronunciation scorer or native-content approval.

| Guide | Purpose |
| --- | --- |
| [Development](DEVELOPMENT.md) | Install, run, import drafts and test |
| [Architecture](ARCHITECTURE.md) | Boundaries, data flow and implementation status |
| [Domain](DOMAIN.md) | Content, roles, approval and evidence rules |
| [Learning engine](LEARNING_ENGINE.md) | SM-2, FSRS, queues and evidence semantics |
| [Database](DATABASE.md) | Migrations, indexing, search and scale |
| [Deployment](DEPLOYMENT.md) | Containers, Azure, identities and release procedure |
| [Verification record](VALIDATION.md) | Local build, database, browser and security check results |
| [Testing](TESTING.md) | Unit, component, API, real database and browser checks |
| [Developer Preview Mode](DEVELOPER_PREVIEW.md) | Temporary access to all existing path nodes/steps without recording learner progress |
| [Learning variety audit](LEARNING_VARIETY.md) | Existing activity map, research rationale and the implemented Unit 2 model-fading routine |
| [Contributing](CONTRIBUTING.md) | Change, review and content standards |

## Foundation phases

| Phase | Code location | Executable outcome |
| --- | --- | --- |
| 1 Structure | apps, packages, infrastructure, content, scripts | npm workspaces and .NET solution build |
| 2 Domain | apps/api/Polyglot.Domain | Typed content, workflows, roles, evidence, AI interfaces |
| 3 Database | Polyglot.Infrastructure, infrastructure/database | EF mappings, PostgreSQL migrations, constraints and indexes |
| 4 API | Polyglot.Api, Polyglot.Application | Validated DTOs, MediatR commands, scoped endpoints and problem responses |
| 5 Authentication | Program.cs, apps/web/lib/api.ts | Entra JWT validation and browser PKCE redirects; no local auth bypass |
| 6 Content | ContentItem, Endpoints, ContentManager | Draft, submit, review, scoped decisions, publish, revise, archive, immutable media upload |
| 7 Learning | packages/learning-engine, Domain/Learning | SM-2 and FSRS strategies, due queues, server-graded answers and model exposures |
| 8 Web | apps/web | All requested routes, actual service states, editor and working legacy preview |
| 9 Testing | Polyglot.Tests, package tests, tests/e2e | Unit, component, API, PostgreSQL/SQLite and phone/desktop tests |
| 10 DevOps | infrastructure, .github/workflows, .devcontainer | Containers, CI, explicit deployment, migrations, Azure identity and Terraform |

These are foundation capabilities. Reviewed advanced curriculum, live Entra tenant configuration and an Azure environment are not supplied by generating software. AI is interfaces only. No cloud resource or hosted-site update is performed by building this repository.
