# Foundation verification

Verified locally on 20 November 2026. No cloud deployment or hosted-preview update was performed.

| Check | Result |
| --- | --- |
| .NET solution build | Passed with zero warnings and zero errors |
| Real PostgreSQL 16 migrations and draft import | Passed; all 142 sourced candidates remain drafts |
| Backend domain, API, permissions and database tests | 15 passed on PostgreSQL |
| TypeScript checking | Passed |
| Frontend, content, Unicode, offline privacy and SM-2/FSRS tests | 12 passed |
| Production Next.js build | Passed for all requested routes |
| Desktop and phone browser journeys | 6 passed against the production build |
| Preserved standalone app and product-contract checks | All passed, including the existing 113 behavior checks |
| Terraform formatting and validation | Passed using the locked AzureRM provider |
| npm and NuGet vulnerability scans | No vulnerabilities reported by the current sources |
| Shell syntax and git whitespace checks | Passed |
| Local API/database readiness | Ready; Tigrinya metadata served from PostgreSQL |

Regression checks cover scoped qualified approvals, author independence, published-version preservation, server-side answer grading, request-fingerprint replay protection, model exposure, child analytics protection, private-media authorisation, structural family membership, database uniqueness and learner isolation. Browser checks cover the complete existing Fidäl preview entry flow, consent-controlled settings, keyboard dialog behaviour and unavailable-account recovery.

The running web app is at http://127.0.0.1:3000 and the API is at http://127.0.0.1:5080. Development database credentials remain in the ignored, private .tools/development directory; no demonstration login or native approval was created.

Real Entra sign-in, configured Azure Blob operations, Docker image execution and a live Azure deployment require their actual environments and have not been claimed as locally verified. The generated CI workflow includes PostgreSQL and browser checks but has not run on GitHub in this task. Physical touch/stylus, VoiceOver, real mobile IMEs, native-language review and learning-effectiveness validation remain release work. Browser phone emulation does not replace those checks.

The implemented API uses SM-2 by default. The shared FSRS-7 adapter is real and tested, with a distinct algorithm version; it is not silently substituted for SM-2 or claimed to be server-selectable already. AI services are interfaces only. Advanced course content and native recordings are not fabricated to populate the foundation.
