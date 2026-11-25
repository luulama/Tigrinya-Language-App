# Verification and adoption record

Verified locally on 25 November 2026 against app baseline `48c0b21`. This change adds the production design package and a link from the engineering index. It does not implement the proposed runtime APIs, change either unit, register database migrations, activate AI/analytics/accounts, change mobile defaults or deploy services.

## Checks completed

| Command | Actual result and scope |
| --- | --- |
| `python3 -B -m unittest discover -s docs/production/reference -p 'test_*.py'` | **PASS, 15 tests:** cost arithmetic/units, scale and invalid inputs; contract abstention, model calibration/uncertainty, strict answers/input caps, child analytics default, references/idempotency and honest requirement status |
| `bash scripts/tool.sh node docs/production/reference/check_database.mjs` | **PASS:** real repository EF SQL base migrations followed by the proposed 25-table schema in isolated PostgreSQL 16; 15 storage checks including version/FK boundaries, speaker rights, active-release uniqueness, eight-second/24-hour caps, non-scoring abstention, calibrated model requirements, event/device ownership and worker leases |
| `python3 -B scripts/check_product_spec.py` | **PASS:** existing 32 schema definitions, 5 examples/negative guards, 7 stages/28 units/56 modules/224 still-blocked authoring assignments, 43-table SQLite relational contract and 17 phase/link checks. This existing SQLite test is distinct from the new real PostgreSQL test |
| `bash scripts/tool.sh node unit-01-fidel-foundations/check_unit1.cjs` | **PASS, 16 Unit 1 flow checks:** introduction, practice, correction, recap, check/resume, review and writing behavior |
| `bash scripts/tool.sh node --check docs/production/reference/check_database.mjs` | **PASS:** new Node check syntax |
| `python3 -B docs/production/reference/check_package.py` | **PASS:** twenty deliverables, 35 capability requirements, 31 operations/38 schemas, local links, JSON/Python syntax and locked-vision digest; structural checks, not full standard conformance |
| `python3 -B docs/production/reference/cost_model.py` | **PASS:** deterministic displayed worksheet; 1,000/10,000 learner scenarios, no service calls |
| `shasum -a 256 Product-Bible/01-Vision.md` | **UNCHANGED:** `8dc45861ef7edcd1f20db25ac07a29372659e854b261f88a2b2b6fbdccf865af` |

The package's final structural/link check is `python3 -B docs/production/reference/check_package.py`. It checks twenty deliverables, all 35 capability requirements, 31 API operations/38 schemas, local links, JSON/Python syntax and the locked-vision digest. It deliberately does not claim full OpenAPI/JSON Schema standard conformance. Use a standards-compliant validator and real-handler compatibility tests when adopting the design.

The database harness creates generated test credentials and a fresh temporary cluster on loopback, applies **no existing app environment configuration**, then stops/removes only its own disposable cluster. The restricted shell initially refused loopback binding; the isolated test subsequently ran with the required local permission. The reader strips the existing EF SQL file's UTF-8 BOM in memory; it does not edit that migration. No real learner data or language approval records are used. Synthetic storage fixtures do not imply native review or service authorization.

## What was deliberately not claimed as tested

- No Next.js/.NET runtime code changed; the full web build, whole app test suite, physical iPhone/audio, browser layouts and screen-reader audits were not rerun for this documentation change. Unit 1's existing executable flow checks did run.
- No new endpoint handler, consent operation, native-audio quorum command, media decoder, sync signature implementation or score engine exists merely because its design parses. Their integration, load/security and migration/deletion tests remain release work.
- No production SQL migration, production role/RLS configuration, cloud backup restore, CDN recall, signing-key deployment or actual data residency was exercised. The isolated schema test is not a production rollout rehearsal.
- No provider was evaluated with learner recordings; no pronunciation accuracy, placement calibration, child study or superiority claim is made.
- No qualified reviewer approved a new Tigrinya word, transcript, pronunciation, cultural claim, writing stroke or audio file. This package creates no learner-facing language content.

## Required decisions and evidence before implementation/release

1. **Owner adoption:** approve the proposed operational choices and staged scope through the existing Product Bible process; FINAL_V1 stays locked. These files are not an approval event.
2. **Native curriculum and media:** name qualified educators/reviewers, select the bounded release sequence and varieties, supply commercially licensed native recordings/transcripts and exact-revision review decisions. Existing local review records do not supply approved native teaching audio.
3. **Privacy and guardianship:** choose launch jurisdictions/legal basis, guardian verification, purpose-specific retention/deletion notices and processor contracts with qualified advice before child cloud features. No blanket COPPA/GDPR certification is implied.
4. **Real infrastructure and cost:** supply actual tenant/audience/origins/region, deployment identities, publication keys, quotas, budget and support owners. The cost worksheet's hosting/labor values are explicitly unquoted assumptions, not credentials or provisioning instructions.
5. **Assessment:** create calibrated item banks, standard setting, qualified human rubrics and held-out native-rated evaluation before placement bands or pronunciation labels. Tigrinya's absence from the checked Azure pronunciation-assessment locales blocks treating that service as a working evaluator.
6. **Adopted implementation:** build actual commands/handlers and reviewed EF migrations behind capabilities; resolve the expanded memory-state identity, test JCS/JWS vectors, scopes, offline conflicts, export/deletion and physical-device behavior. Keep current web/mobile functionality until replacement behavior passes its gates.

## Repository synchronization

Follow the repository's automatic-sync rule after the final checks: inspect/stage only this completed change, check staged secrets and whitespace, commit and push to the existing upstream without force. Deployment remains a separate manual workflow. A successful push records documents in GitHub; it does not publish the proposed platform or approve content. The user-facing completion message reports the actual synchronization outcome.
