# Architecture

The modular monolith keeps deployment and transactions simple. Polyglot.Domain contains workflow and scheduling invariants without ORM, HTTP or cloud dependencies. Polyglot.Application contains ports, validated commands and MediatR handlers. Polyglot.Infrastructure provides EF Core/Npgsql and Azure Blob adapters. Polyglot.Api maps feature endpoints, enforces Entra policies and translates failures to problem responses.

The web application uses Next.js App Router, React, TypeScript, Tailwind, locally owned shadcn-style components built on Radix Dialog, TanStack Query for service state and Zustand for in-tab presentation preferences. Saving preferences requires an explicit device-only choice. Query results are not silently persisted as child profiles. Approved teaching content and account evidence stay separate from the preserved unreviewed preview.

packages/content-engine contains draft validation and approval predicates; packages/learning-engine contains typed learning objects, queue planning and interchangeable memory strategies; shared-types defines wire contracts; shared-utils handles Unicode and safe asset names; ui owns accessible reusable controls. Backend publishing rules remain authoritative even when a frontend predicate succeeds.

Public endpoints return published version snapshots, never the current draft payload. Editing a published item creates a new revision while its previous published snapshot remains readable. Dependency links are updated on publication, checked for cycles and prevent accidental removal of required published assets. Approval records bind author independence, reviewer qualification, revision and payload hash.

The API serves courses, lessons, words, stories, dialogs, media, progress, reviews, recommendations, collections, achievements, profiles, verified relationships and content administration. Empty content libraries represent the actual database. Errors are not replaced with invented lessons or test users. Teacher/parent access uses verified relationships in addition to roles; child purchasing and public social interaction have no endpoints.

AI contracts exist in C# and shared TypeScript types. There are no registered AI implementations, Azure OpenAI calls or inferred model credentials. Operational telemetry defaults off. Consent-controlled adult activity events contain structured task metadata only; child analytics are disabled. Streak data types exist for compatibility, but there is no pressure-based streak UI or reward economy.

The service worker caches the same-origin application shell, static assets and accessed legacy previews. Protected API responses, account data and review submissions are excluded. This is offline-friendly practice, not offline authenticated progress synchronisation. A versioned, consented encrypted outbox would be a separate feature; the current implementation never pretends a failed answer upload was saved.

Production configuration fails closed if database/Entra settings are absent. Local unauthenticated practice remains possible. A running API process does not imply database readiness: /health/live and /health/ready distinguish those conditions.
