# Database operations

The runtime database is PostgreSQL through EF Core and Npgsql. The earlier docs/product/schema.sql remains a separate design contract; it is not the application's migration source. EF migrations in Polyglot.Infrastructure/Migrations and the generated infrastructure/database/migrations.sql define the implemented schema.

Content versions and approvals have durable revision identities. Child collection IDs use explicit ValueGeneratedNever configuration so attaching a new approval/version to a tracked aggregate inserts a row rather than incorrectly updating a nonexistent one. Concurrency stamps protect content transitions and learning state. Attempt IDs provide durable submission deduplication. Content dependencies use restricted foreign keys.

Payload text retains the bytes whose SHA-256 digest was reviewed. A JSONB projection may be added for specialised querying later; do not silently normalise/reorder stored payloads and invalidate hash verification. Search uses a PostgreSQL simple-configuration tsvector over PublishedTitle, with a GIN index. It does not apply English stemming to Tigrinya or index unpublished draft titles. Unicode answer comparison preserves Ethiopic marks.

Indexes cover published language/kind/id queries, due learner states, learner attempt chronology, content version/revision uniqueness and scoped reviewer qualification. All instant values use UTC epoch milliseconds consistently across PostgreSQL and SQLite test providers. SQLite is a relational fallback for fast tests, not an in-memory fake repository and not the deployment database.

Apply migrations explicitly with --migrate or the deployment job; HTTP startup never silently changes a production schema. Use backward-compatible expand/contract changes, reviewed idempotent migration scripts and a tested backup/restore process. Reverting an image does not imply a destructive database downgrade. No automatic down-migration runs during deployment.

For millions of learners, measure query plans and table sizes before partitioning. Preserve learner/content/skill indexes and use keyset pagination before very deep browsing. If attempts dominate storage, add time partitions together with a global idempotency ledger; otherwise per-partition uniqueness would weaken replay protection. Add read replicas only for suitable immutable/public workloads, not for transactional answer grading.

Cloud runtime uses a managed identity with DML privileges; a separate migration identity owns schema changes. Terraform enables Entra-only PostgreSQL authentication on a private delegated subnet. An authorised Entra database administrator must create the two identity principals and grant the intended roles from within that network before app deployment. The API obtains short-lived PostgreSQL tokens; no database password is embedded in Terraform, an image or GitHub.
