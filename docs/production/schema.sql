-- Proposed additive storage contract. Not registered as an application migration.
-- Requires the repository's existing public EF schema. PostgreSQL 16.
CREATE SCHEMA production;

CREATE TABLE production.variety (
 id uuid PRIMARY KEY, language_tag text NOT NULL CHECK (language_tag = 'ti'),
 reviewed_name text NOT NULL CHECK (length(reviewed_name) BETWEEN 1 AND 200),
 provenance jsonb NOT NULL CHECK (jsonb_typeof(provenance) = 'object'),
 approval_version_id uuid NOT NULL REFERENCES public."VersionHistory"("Id")
);
CREATE TABLE production.speaker (
 id uuid PRIMARY KEY, contributor_subject varchar(200) NOT NULL,
 display_name text NOT NULL, adult_attested_at timestamptz NOT NULL,
 public_metadata jsonb NOT NULL CHECK (jsonb_typeof(public_metadata) = 'object')
);
CREATE TABLE production.speaker_private (
 speaker_id uuid PRIMARY KEY REFERENCES production.speaker(id),
 encrypted_evidence bytea NOT NULL, key_reference text NOT NULL,
 expires_at timestamptz NOT NULL
);
CREATE TABLE production.rights_grant (
 id uuid PRIMARY KEY, speaker_id uuid NOT NULL REFERENCES production.speaker(id),
 evidence_digest text NOT NULL CHECK (evidence_digest ~ '^[0-9a-f]{64}$'),
 permitted_uses jsonb NOT NULL CHECK (jsonb_typeof(permitted_uses) = 'array'),
 granted_at timestamptz NOT NULL, expires_at timestamptz NOT NULL,
 withdrawn_at timestamptz, CHECK (expires_at > granted_at),
 UNIQUE (id, speaker_id)
);
CREATE TABLE production.recording (
 id uuid PRIMARY KEY, target_version_id uuid NOT NULL REFERENCES public."VersionHistory"("Id"),
 variety_id uuid NOT NULL REFERENCES production.variety(id),
 speaker_id uuid NOT NULL REFERENCES production.speaker(id), rights_id uuid NOT NULL,
 author_subject varchar(200) NOT NULL, transcript text NOT NULL CHECK (length(transcript) > 0),
 context_version_id uuid REFERENCES public."VersionHistory"("Id"),
 mode text NOT NULL CHECK (mode IN ('normal','native_slow')),
 original_sha256 text NOT NULL CHECK (original_sha256 ~ '^[0-9a-f]{64}$'),
 approval_digest text NOT NULL CHECK (approval_digest ~ '^[0-9a-f]{64}$'),
 private_master_key text NOT NULL, revision integer NOT NULL CHECK (revision > 0),
 state text NOT NULL CHECK (state IN ('uploading','processing','technical_reject','review','revision_needed','ready','withdrawn')),
 created_at timestamptz NOT NULL, UNIQUE (id, approval_digest),
 FOREIGN KEY (rights_id, speaker_id) REFERENCES production.rights_grant(id, speaker_id)
);
CREATE INDEX recording_target ON production.recording(target_version_id, variety_id, mode);
CREATE TABLE production.rendition (
 id uuid PRIMARY KEY, recording_id uuid NOT NULL REFERENCES production.recording(id),
 object_key text NOT NULL UNIQUE, sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
 codec text NOT NULL, sample_rate integer NOT NULL CHECK (sample_rate BETWEEN 8000 AND 192000),
 channels smallint NOT NULL CHECK (channels BETWEEN 1 AND 2),
 duration_ms integer NOT NULL CHECK (duration_ms BETWEEN 1 AND 60000),
 byte_count bigint NOT NULL CHECK (byte_count BETWEEN 1 AND 20971520),
 encoder_version text NOT NULL, waveform_sha256 text CHECK (waveform_sha256 ~ '^[0-9a-f]{64}$'),
 alignment_version_id uuid REFERENCES public."VersionHistory"("Id"),
 UNIQUE (recording_id, codec, sha256)
);
CREATE TABLE production.quality_check (
 id uuid PRIMARY KEY, recording_id uuid NOT NULL REFERENCES production.recording(id),
 processor_version text NOT NULL, checked_at timestamptz NOT NULL,
 outcome text NOT NULL CHECK (outcome IN ('pass','review','reject')),
 metrics jsonb NOT NULL CHECK (jsonb_typeof(metrics) = 'object')
);
CREATE TABLE production.recording_decision (
 id uuid PRIMARY KEY, recording_id uuid NOT NULL, approval_digest text NOT NULL,
 reviewer_id uuid NOT NULL REFERENCES public."Reviewers"("Id"),
 scope text NOT NULL CHECK (scope IN ('language','teaching','rights','accessibility','audio','culture')),
 decision text NOT NULL CHECK (decision IN ('approve','revise','reject')),
 qualification_snapshot jsonb NOT NULL CHECK (jsonb_typeof(qualification_snapshot) = 'object'),
 reason text NOT NULL, decided_at timestamptz NOT NULL,
 supersedes_id uuid REFERENCES production.recording_decision(id),
 FOREIGN KEY (recording_id, approval_digest) REFERENCES production.recording(id, approval_digest),
 UNIQUE (recording_id, approval_digest, reviewer_id, scope, decided_at)
);
CREATE TABLE production.recording_release (
 id uuid PRIMARY KEY, recording_id uuid NOT NULL, approval_digest text NOT NULL,
 manifest_sha256 text NOT NULL UNIQUE CHECK (manifest_sha256 ~ '^[0-9a-f]{64}$'),
 manifest_key text NOT NULL, released_at timestamptz NOT NULL,
 lease_expires_at timestamptz NOT NULL, revoked_at timestamptz,
 FOREIGN KEY (recording_id, approval_digest) REFERENCES production.recording(id, approval_digest),
 CHECK (lease_expires_at > released_at)
);
CREATE UNIQUE INDEX recording_active_release ON production.recording_release(recording_id) WHERE revoked_at IS NULL;

CREATE TABLE production.consent_receipt (
 id uuid PRIMARY KEY, learner_id uuid NOT NULL REFERENCES public."Learners"("Id"),
 relationship_id uuid REFERENCES public."Relationships"("Id"), purpose text NOT NULL,
 policy_version text NOT NULL, verification_evidence_digest text NOT NULL CHECK (verification_evidence_digest ~ '^[0-9a-f]{64}$'),
 granted_at timestamptz NOT NULL, expires_at timestamptz NOT NULL, revoked_at timestamptz,
 CHECK (expires_at > granted_at), UNIQUE (id, learner_id)
);
CREATE TABLE production.speech_submission (
 id uuid PRIMARY KEY, learner_id uuid NOT NULL REFERENCES public."Learners"("Id"),
 consent_id uuid NOT NULL, target_release_id uuid NOT NULL REFERENCES production.recording_release(id),
 private_object_key text NOT NULL UNIQUE,
 sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
 duration_ms integer NOT NULL CHECK (duration_ms BETWEEN 1 AND 8000),
 state text NOT NULL CHECK (state IN ('uploading','processing','waiting_human','evaluated','not_assessed','deleted')),
 created_at timestamptz NOT NULL, expires_at timestamptz NOT NULL, deleted_at timestamptz,
 FOREIGN KEY (consent_id, learner_id) REFERENCES production.consent_receipt(id, learner_id),
 CHECK (expires_at > created_at AND expires_at <= created_at + interval '24 hours')
);
CREATE INDEX speech_expiry ON production.speech_submission(expires_at) WHERE deleted_at IS NULL;
CREATE TABLE production.evaluation (
 id uuid PRIMARY KEY, submission_id uuid NOT NULL REFERENCES production.speech_submission(id),
 source text NOT NULL CHECK (source IN ('qualified_human','validated_model','none')),
 rubric_version_id uuid REFERENCES public."VersionHistory"("Id"),
 engine_version text NOT NULL, calibration_digest text CHECK (calibration_digest ~ '^[0-9a-f]{64}$'),
 outcome text NOT NULL CHECK (outcome IN ('correct','close','needs_improvement','not_assessed')),
 reason_code text NOT NULL, confidence numeric CHECK (confidence BETWEEN 0 AND 1),
 feedback_version_ids uuid[] NOT NULL, evaluated_at timestamptz NOT NULL,
 CHECK ((outcome = 'not_assessed' AND source = 'none' AND confidence IS NULL) OR
        (outcome <> 'not_assessed' AND source <> 'none' AND rubric_version_id IS NOT NULL)),
 CHECK (source <> 'validated_model' OR (calibration_digest IS NOT NULL AND confidence IS NOT NULL)),
 UNIQUE (submission_id, engine_version)
);

CREATE TABLE production.assessment_blueprint (
 id uuid PRIMARY KEY REFERENCES public."VersionHistory"("Id"),
 model_version text NOT NULL, calibration_digest text NOT NULL CHECK (calibration_digest ~ '^[0-9a-f]{64}$'),
 standard_setting_version_id uuid NOT NULL REFERENCES public."VersionHistory"("Id"),
 coverage_policy jsonb NOT NULL CHECK (jsonb_typeof(coverage_policy) = 'object')
);
CREATE TABLE production.placement_item (
 id uuid PRIMARY KEY, blueprint_id uuid NOT NULL REFERENCES production.assessment_blueprint(id),
 task_version_id uuid NOT NULL REFERENCES public."VersionHistory"("Id"),
 skill text NOT NULL CHECK (skill IN ('reading','listening','speaking','vocabulary')),
 discrimination numeric NOT NULL CHECK (discrimination > 0), difficulty numeric NOT NULL,
 guessing numeric NOT NULL CHECK (guessing >= 0 AND guessing < 1),
 rubric_version_id uuid NOT NULL REFERENCES public."VersionHistory"("Id"),
 UNIQUE (id, blueprint_id), UNIQUE (blueprint_id, task_version_id)
);
CREATE TABLE production.placement_session (
 id uuid PRIMARY KEY, learner_id uuid NOT NULL REFERENCES public."Learners"("Id"),
 blueprint_id uuid NOT NULL REFERENCES production.assessment_blueprint(id),
 state text NOT NULL CHECK (state IN ('active','paused','completed','insufficient_evidence','abandoned')),
 background jsonb NOT NULL CHECK (jsonb_typeof(background) = 'object'),
 started_at timestamptz NOT NULL, revision bigint NOT NULL CHECK (revision > 0),
 UNIQUE (id, blueprint_id)
);
CREATE INDEX placement_learner ON production.placement_session(learner_id, started_at DESC);
CREATE TABLE production.placement_response (
 id uuid PRIMARY KEY, session_id uuid NOT NULL, blueprint_id uuid NOT NULL, item_id uuid NOT NULL,
 sequence integer NOT NULL CHECK (sequence BETWEEN 1 AND 24),
 response jsonb NOT NULL CHECK (jsonb_typeof(response) = 'object'),
 evidence text NOT NULL CHECK (evidence IN ('independent','supported','skipped','unassessed')),
 received_at timestamptz NOT NULL, digest text NOT NULL CHECK (digest ~ '^[0-9a-f]{64}$'),
 FOREIGN KEY (session_id, blueprint_id) REFERENCES production.placement_session(id, blueprint_id),
 FOREIGN KEY (item_id, blueprint_id) REFERENCES production.placement_item(id, blueprint_id),
 UNIQUE (session_id, sequence), UNIQUE (session_id, item_id)
);
CREATE TABLE production.placement_result (
 id uuid PRIMARY KEY, session_id uuid NOT NULL UNIQUE REFERENCES production.placement_session(id),
 skill_posteriors jsonb NOT NULL CHECK (jsonb_typeof(skill_posteriors) = 'object'),
 recommendations jsonb NOT NULL CHECK (jsonb_typeof(recommendations) = 'array'),
 computed_at timestamptz NOT NULL, CHECK (NOT (skill_posteriors ? 'heritage_ability'))
);

CREATE TABLE production.algorithm_checkpoint (
 id uuid PRIMARY KEY, learning_state_id uuid NOT NULL REFERENCES public."LearningStates"("Id"),
 algorithm_version text NOT NULL, parameter_digest text NOT NULL CHECK (parameter_digest ~ '^[0-9a-f]{64}$'),
 memory_state jsonb NOT NULL CHECK (jsonb_typeof(memory_state) = 'object'),
 source_range jsonb NOT NULL CHECK (jsonb_typeof(source_range) = 'object'),
 migration_reason text NOT NULL, effective_at timestamptz NOT NULL,
 UNIQUE (learning_state_id, effective_at)
);
CREATE TABLE production.bundle (
 id uuid PRIMARY KEY, content_version_id uuid NOT NULL REFERENCES public."VersionHistory"("Id"),
 manifest_sha256 text NOT NULL UNIQUE CHECK (manifest_sha256 ~ '^[0-9a-f]{64}$'),
 manifest jsonb NOT NULL CHECK (jsonb_typeof(manifest) = 'object'),
 signature text NOT NULL, key_id text NOT NULL, issued_at timestamptz NOT NULL,
 expires_at timestamptz NOT NULL, revoked_at timestamptz,
 CHECK (expires_at > issued_at AND expires_at <= issued_at + interval '30 days')
);
CREATE TABLE production.device (
 id uuid PRIMARY KEY, learner_id uuid NOT NULL REFERENCES public."Learners"("Id"),
 public_key jsonb NOT NULL CHECK (jsonb_typeof(public_key) = 'object'),
 enrolled_at timestamptz NOT NULL, revoked_at timestamptz,
 UNIQUE (id, learner_id)
);
CREATE TABLE production.sync_event (
 event_id uuid NOT NULL, learner_id uuid NOT NULL REFERENCES public."Learners"("Id"),
 device_id uuid NOT NULL, stream_id uuid NOT NULL,
 sequence bigint NOT NULL CHECK (sequence > 0),
 payload_digest text NOT NULL CHECK (payload_digest ~ '^[0-9a-f]{64}$'),
 event_type text NOT NULL CHECK (event_type IN ('exposure','attempt','scenario_turn','playback')),
 canonical_event jsonb NOT NULL CHECK (jsonb_typeof(canonical_event) = 'object'),
 received_at timestamptz NOT NULL,
 receipt_state text NOT NULL CHECK (receipt_state IN ('accepted','provisional','deferred','rejected')),
 receipt jsonb NOT NULL CHECK (jsonb_typeof(receipt) = 'object'),
 PRIMARY KEY (learner_id, event_id), UNIQUE (learner_id, device_id, stream_id, sequence),
 FOREIGN KEY (device_id, learner_id) REFERENCES production.device(id, learner_id)
);
CREATE TABLE production.activity_summary (
 learner_id uuid NOT NULL REFERENCES public."Learners"("Id"), local_date date NOT NULL,
 skill text NOT NULL, policy_version text NOT NULL, timezone text NOT NULL,
 active_seconds integer CHECK (active_seconds BETWEEN 0 AND 86400),
 evidence_counts jsonb NOT NULL CHECK (jsonb_typeof(evidence_counts) = 'object'),
 rebuilt_at timestamptz NOT NULL,
 PRIMARY KEY (learner_id, local_date, skill, policy_version)
);
CREATE TABLE production.culture_link (
 teaching_version_id uuid NOT NULL REFERENCES public."VersionHistory"("Id"),
 culture_version_id uuid NOT NULL REFERENCES public."VersionHistory"("Id"),
 purpose text NOT NULL, PRIMARY KEY (teaching_version_id, culture_version_id)
);
CREATE TABLE production.scenario_graph (
 version_id uuid PRIMARY KEY REFERENCES public."VersionHistory"("Id"),
 graph jsonb NOT NULL CHECK (jsonb_typeof(graph) = 'object'),
 validation_digest text NOT NULL CHECK (validation_digest ~ '^[0-9a-f]{64}$')
);
CREATE TABLE production.outbox (
 id uuid PRIMARY KEY, business_key text NOT NULL UNIQUE,
 kind text NOT NULL, envelope jsonb NOT NULL CHECK (jsonb_typeof(envelope) = 'object'),
 state text NOT NULL CHECK (state IN ('pending','leased','done','dead_letter','cancelled')),
 attempts integer NOT NULL CHECK (attempts BETWEEN 0 AND 5),
 available_at timestamptz NOT NULL, lease_until timestamptz, processor_request_id text,
 created_at timestamptz NOT NULL,
 CHECK ((state = 'leased') = (lease_until IS NOT NULL))
);
CREATE INDEX outbox_ready ON production.outbox(available_at) WHERE state = 'pending';
