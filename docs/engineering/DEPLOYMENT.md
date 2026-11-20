# Deployment procedure

Deployment is explicit. No command in the normal build or test sequence provisions cloud resources, publishes a site or changes the existing hosted preview.

The API image uses .NET 10 runtime and a non-root user. The web image uses Node 24, a standalone Next.js build and a non-root user. Build the preserved preview before the web image. NEXT_PUBLIC_API_URL is public build-time configuration and must identify the stable API ingress, not an ephemeral revision hostname.

Terraform defines a resource group, private PostgreSQL 16 server, delegated database subnet and DNS, integrated Container Apps environment, private Blob container, disabled storage keys, managed identities, ACR, Key Vault, optional operational telemetry, web/API containers and a manual migration job. It validates without Azure credentials after `terraform init -backend=false`; an actual plan/apply requires an Azure subscription and real variables. Terraform state uses an Azure backend configured outside source. Never commit a state file, secret, access token or generated plan.

First provision infrastructure with deploy_applications=false. Supply real name, location, subscription and Entra administrator values. Create scoped database principals for runtime and migration identities through the authorised administrator using infrastructure/database/bootstrap-identities.sql with the two identity names supplied as psql variables. That script is Azure-specific and is not run against local PostgreSQL. Push actual API/web images, configure real Entra app registrations, and then enable application resources with their image references. No placeholder or public demonstration image is used to bypass bootstrapping.

The API authority must be the configured external tenant's HTTPS authority. Configure API audience, SPA client ID and delegated scope. Register the exact stable web /signin redirect URI, the post-logout origin and the intended user flow. Assign Editor, Reviewer, Administrator, Parent and Teacher app roles only to authorised accounts. Register each reviewer's actual qualifications/scopes through the protected administration endpoint; a role alone does not approve Tigrinya.

The GitHub deploy workflow is workflow_dispatch only. Configure the production environment with required reviewers and repository/environment variables AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID, RESOURCE_GROUP, ACR_NAME, API_APP, WEB_APP, MIGRATION_JOB and API_URL. Federation restricts the deployment identity to this repository's production environment. It requires ACR push and appropriately scoped Container Apps update/job permissions, not subscription-wide ownership.

The workflow runs CI first, signs into Azure using OIDC, builds/pushes immutable SHA-tagged images, updates/starts the private-network migration job, waits for success, updates applications and checks readiness. Migration failure prevents application updates. The job uses the migration identity; the API uses the runtime identity. Deployments and database changes still require operational review and backup verification. Terraform validation does not establish that a subscription has available quotas or that identities have been bootstrapped.

Operational telemetry is disabled by default, and learner analytics require separate adult consent. No request bodies, raw speech, free writing, tokens or child identifiers are sent to Application Insights. AI contracts do not provision an Azure OpenAI resource or create usage charges.

Docker image builds, Azure sign-in and live cloud deployment require their respective tools/services. The local validation report distinguishes those checks from code builds, real local PostgreSQL tests and static Terraform validation.
