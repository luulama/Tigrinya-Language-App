-- Run only as the authorised Entra PostgreSQL administrator in the private network.
-- Supply psql variables runtime_identity and migration_identity from Terraform outputs.
\set ON_ERROR_STOP on
SELECT pgaadauth_create_principal(:'migration_identity', false, false)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname=:'migration_identity');
SELECT pgaadauth_create_principal(:'runtime_identity', false, false)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname=:'runtime_identity');
SELECT format('GRANT CONNECT ON DATABASE %I TO %I',current_database(),:'migration_identity') \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO %I',current_database(),:'runtime_identity') \gexec
SELECT format('GRANT USAGE, CREATE ON SCHEMA public TO %I',:'migration_identity') \gexec
SELECT format('GRANT USAGE ON SCHEMA public TO %I',:'runtime_identity') \gexec
SELECT format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO %I',:'runtime_identity') \gexec
SELECT format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I',:'migration_identity',:'runtime_identity') \gexec
