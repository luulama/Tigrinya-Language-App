CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "Achievements" (
        "Id" uuid NOT NULL,
        "LearnerSubject" text NOT NULL,
        "Objective" text NOT NULL,
        "EarnedAt" bigint NOT NULL,
        "EvidenceIds" text NOT NULL,
        CONSTRAINT "PK_Achievements" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "Activities" (
        "Id" uuid NOT NULL,
        "LearnerSubject" text NOT NULL,
        "ContentId" uuid,
        "Kind" text NOT NULL,
        "At" bigint NOT NULL,
        "DurationSeconds" integer NOT NULL,
        CONSTRAINT "PK_Activities" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "Languages" (
        "Tag" character varying(35) NOT NULL,
        "Name" text NOT NULL,
        "Script" text NOT NULL,
        "Direction" text NOT NULL,
        "ScriptModel" text NOT NULL,
        CONSTRAINT "PK_Languages" PRIMARY KEY ("Tag")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "Learners" (
        "Id" uuid NOT NULL,
        "Subject" character varying(200) NOT NULL,
        "Presentation" text NOT NULL,
        "LanguageTag" text NOT NULL,
        "Goal" text NOT NULL,
        "AnalyticsConsent" boolean NOT NULL,
        "IsChild" boolean NOT NULL,
        "UpdatedAt" bigint NOT NULL,
        CONSTRAINT "PK_Learners" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "Relationships" (
        "Id" uuid NOT NULL,
        "AdultSubject" text NOT NULL,
        "LearnerSubject" text NOT NULL,
        "Kind" text NOT NULL,
        "Verified" boolean NOT NULL,
        "VerificationEvidence" text NOT NULL,
        CONSTRAINT "PK_Relationships" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "Reviewers" (
        "Id" uuid NOT NULL,
        "Subject" text NOT NULL,
        "LanguageTag" text NOT NULL,
        "Scopes" text NOT NULL,
        "QualificationEvidence" text NOT NULL,
        CONSTRAINT "PK_Reviewers" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "ReviewSessions" (
        "Id" uuid NOT NULL,
        "LearnerSubject" text NOT NULL,
        "StartedAt" bigint NOT NULL,
        "FinishedAt" bigint,
        CONSTRAINT "PK_ReviewSessions" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "Content" (
        "Id" uuid NOT NULL,
        "LanguageTag" character varying(35) NOT NULL,
        "Kind" text NOT NULL,
        "Title" character varying(200) NOT NULL,
        "PublishedTitle" text NOT NULL,
        "AuthorSubject" character varying(200) NOT NULL,
        "State" text NOT NULL,
        "Revision" integer NOT NULL,
        "PublishedRevision" integer,
        "ConcurrencyStamp" uuid NOT NULL,
        "Payload" text NOT NULL,
        "PayloadHash" text NOT NULL,
        "UpdatedAt" bigint NOT NULL,
        "SearchVector" tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce("PublishedTitle", ''))) STORED,
        CONSTRAINT "PK_Content" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Content_Languages_LanguageTag" FOREIGN KEY ("LanguageTag") REFERENCES "Languages" ("Tag") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "ApprovalRecord" (
        "Id" uuid NOT NULL,
        "ContentItemId" uuid NOT NULL,
        "Revision" integer NOT NULL,
        "PayloadHash" text NOT NULL,
        "ReviewerSubject" text NOT NULL,
        "Scope" text NOT NULL,
        "Approved" boolean NOT NULL,
        "Notes" text NOT NULL,
        "DecidedAt" bigint NOT NULL,
        CONSTRAINT "PK_ApprovalRecord" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_ApprovalRecord_Content_ContentItemId" FOREIGN KEY ("ContentItemId") REFERENCES "Content" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "Attempts" (
        "Id" uuid NOT NULL,
        "LearnerSubject" text NOT NULL,
        "ContentId" uuid NOT NULL,
        "ContentRevision" integer NOT NULL,
        "QuestionId" uuid NOT NULL,
        "Skill" text NOT NULL,
        "Outcome" integer NOT NULL,
        "Helped" boolean NOT NULL,
        "Correct" boolean NOT NULL,
        "OccurredAt" bigint NOT NULL,
        CONSTRAINT "PK_Attempts" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Attempts_Content_ContentId" FOREIGN KEY ("ContentId") REFERENCES "Content" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "Collections" (
        "Id" uuid NOT NULL,
        "LearnerSubject" text NOT NULL,
        "ContentId" uuid NOT NULL,
        CONSTRAINT "PK_Collections" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Collections_Content_ContentId" FOREIGN KEY ("ContentId") REFERENCES "Content" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "LearningStates" (
        "Id" uuid NOT NULL,
        "LearnerSubject" text NOT NULL,
        "ContentId" uuid NOT NULL,
        "ContentRevision" integer NOT NULL,
        "Skill" text NOT NULL,
        "Algorithm" text NOT NULL,
        "DueAt" bigint NOT NULL,
        "LastReviewedAt" bigint,
        "Ease" double precision NOT NULL,
        "Repetitions" integer NOT NULL,
        "IntervalDays" integer NOT NULL,
        "IndependentCorrect" integer NOT NULL,
        "IndependentAttempts" integer NOT NULL,
        "DelayedCorrect" integer NOT NULL,
        "DelayedAttempts" integer NOT NULL,
        "ConcurrencyStamp" uuid NOT NULL,
        CONSTRAINT "PK_LearningStates" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_LearningStates_Content_ContentId" FOREIGN KEY ("ContentId") REFERENCES "Content" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "Links" (
        "SourceId" uuid NOT NULL,
        "TargetId" uuid NOT NULL,
        "Relation" text NOT NULL,
        CONSTRAINT "PK_Links" PRIMARY KEY ("SourceId", "TargetId", "Relation"),
        CONSTRAINT "FK_Links_Content_SourceId" FOREIGN KEY ("SourceId") REFERENCES "Content" ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_Links_Content_TargetId" FOREIGN KEY ("TargetId") REFERENCES "Content" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE TABLE "VersionHistory" (
        "Id" uuid NOT NULL,
        "ContentItemId" uuid NOT NULL,
        "Revision" integer NOT NULL,
        "Title" text NOT NULL,
        "Payload" text NOT NULL,
        "PayloadHash" text NOT NULL,
        "AuthorSubject" text NOT NULL,
        "CreatedAt" bigint NOT NULL,
        CONSTRAINT "PK_VersionHistory" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_VersionHistory_Content_ContentItemId" FOREIGN KEY ("ContentItemId") REFERENCES "Content" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE INDEX "IX_Activities_LearnerSubject_At" ON "Activities" ("LearnerSubject", "At");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE INDEX "IX_ApprovalRecord_ContentItemId_Revision_Scope_DecidedAt" ON "ApprovalRecord" ("ContentItemId", "Revision", "Scope", "DecidedAt");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE INDEX "IX_Attempts_ContentId" ON "Attempts" ("ContentId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE INDEX "IX_Attempts_LearnerSubject_OccurredAt" ON "Attempts" ("LearnerSubject", "OccurredAt");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE INDEX "IX_Collections_ContentId" ON "Collections" ("ContentId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE UNIQUE INDEX "IX_Collections_LearnerSubject_ContentId" ON "Collections" ("LearnerSubject", "ContentId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE INDEX "IX_Content_LanguageTag_Kind_Id" ON "Content" ("LanguageTag", "Kind", "Id") WHERE "PublishedRevision" IS NOT NULL AND "State" <> 'Archived';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE INDEX "IX_Content_LanguageTag_Kind_State_UpdatedAt" ON "Content" ("LanguageTag", "Kind", "State", "UpdatedAt");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE INDEX "IX_Content_SearchVector" ON "Content" USING GIN ("SearchVector");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE UNIQUE INDEX "IX_Learners_Subject" ON "Learners" ("Subject");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE INDEX "IX_LearningStates_ContentId" ON "LearningStates" ("ContentId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE UNIQUE INDEX "IX_LearningStates_LearnerSubject_ContentId_ContentRevision_Ski~" ON "LearningStates" ("LearnerSubject", "ContentId", "ContentRevision", "Skill");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE INDEX "IX_LearningStates_LearnerSubject_DueAt" ON "LearningStates" ("LearnerSubject", "DueAt");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE INDEX "IX_Links_TargetId" ON "Links" ("TargetId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE UNIQUE INDEX "IX_Relationships_AdultSubject_LearnerSubject_Kind" ON "Relationships" ("AdultSubject", "LearnerSubject", "Kind");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE UNIQUE INDEX "IX_Reviewers_Subject_LanguageTag" ON "Reviewers" ("Subject", "LanguageTag");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    CREATE UNIQUE INDEX "IX_VersionHistory_ContentItemId_Revision" ON "VersionHistory" ("ContentItemId", "Revision");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120142508_InitialPlatform') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261120142508_InitialPlatform', '10.0.15');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120160301_ReviewSubmissionIdentity') THEN
    ALTER TABLE "Attempts" ADD "QuestionRevision" integer NOT NULL DEFAULT 0;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120160301_ReviewSubmissionIdentity') THEN
    ALTER TABLE "Attempts" ADD "SubmissionHash" text NOT NULL DEFAULT '';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120160301_ReviewSubmissionIdentity') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261120160301_ReviewSubmissionIdentity', '10.0.15');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120160623_LearningExposureEvidence') THEN
    ALTER TABLE "LearningStates" ADD "LastExposureAt" bigint;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120160623_LearningExposureEvidence') THEN
    CREATE TABLE "Exposures" (
        "Id" uuid NOT NULL,
        "LearnerSubject" text NOT NULL,
        "ContentId" uuid NOT NULL,
        "Revision" integer NOT NULL,
        "Skill" integer NOT NULL,
        "At" bigint NOT NULL,
        CONSTRAINT "PK_Exposures" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Exposures_Content_ContentId" FOREIGN KEY ("ContentId") REFERENCES "Content" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120160623_LearningExposureEvidence') THEN
    CREATE INDEX "IX_Exposures_ContentId" ON "Exposures" ("ContentId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120160623_LearningExposureEvidence') THEN
    CREATE INDEX "IX_Exposures_LearnerSubject_ContentId_At" ON "Exposures" ("LearnerSubject", "ContentId", "At");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261120160623_LearningExposureEvidence') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261120160623_LearningExposureEvidence', '10.0.15');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261125132652_LearningStartPreferences') THEN
    CREATE TABLE "LearningStarts" (
        "LearnerId" uuid NOT NULL,
        "Listening" character varying(20) NOT NULL,
        "Speaking" character varying(20) NOT NULL,
        "Reading" character varying(20) NOT NULL,
        "Goal" character varying(20) NOT NULL,
        "Pace" character varying(20) NOT NULL,
        "Quiet" boolean NOT NULL,
        "Revision" uuid NOT NULL,
        "UpdatedAt" bigint NOT NULL,
        CONSTRAINT "PK_LearningStarts" PRIMARY KEY ("LearnerId"),
        CONSTRAINT "FK_LearningStarts_Learners_LearnerId" FOREIGN KEY ("LearnerId") REFERENCES "Learners" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261125132652_LearningStartPreferences') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261125132652_LearningStartPreferences', '10.0.15');
    END IF;
END $EF$;
COMMIT;

