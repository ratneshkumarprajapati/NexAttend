-- Tighten reviewed attendance schema while preserving existing rows.

-- New anomaly enums.
CREATE TYPE "AnomalyType" AS ENUM (
    'DEVICE_SWAP',
    'DUPLICATE_SESSION',
    'LOCATION_JUMP',
    'SIGNAL_ANOMALY',
    'IMPOSSIBLE_TRAVEL'
);

CREATE TYPE "AnomalySeverity" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

-- User/Profile/Device/AccessPoint integrity and operational flags.
CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");

CREATE UNIQUE INDEX IF NOT EXISTS "Profile_enrolmentNo_key" ON "Profile"("enrolmentNo");

ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "Device_userId_idx" ON "Device"("userId");
CREATE INDEX IF NOT EXISTS "Device_isActive_idx" ON "Device"("isActive");

ALTER TABLE "AccessPoint" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AttendanceSession status should be consistently queryable.
UPDATE "AttendanceSession"
SET "status" = 'VALID'
WHERE "status" IS NULL;

ALTER TABLE "AttendanceSession" ALTER COLUMN "status" SET DEFAULT 'VALID';
ALTER TABLE "AttendanceSession" ALTER COLUMN "status" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "AttendanceSession_apId_idx" ON "AttendanceSession"("apId");
CREATE INDEX IF NOT EXISTS "AttendanceSession_status_idx" ON "AttendanceSession"("status");
CREATE INDEX IF NOT EXISTS "AttendanceSession_userId_startTime_idx" ON "AttendanceSession"("userId", "startTime");

-- AttendanceLog timeline queries.
CREATE INDEX IF NOT EXISTS "AttendanceLog_sessionId_timestamp_idx" ON "AttendanceLog"("sessionId", "timestamp");

-- Convert daily aggregation to calendar-date precision.
-- First merge rows that would collide after casting timestamp to date.
WITH daily_rollup AS (
    SELECT
        MIN("id") AS keep_id,
        "userId",
        "date"::date AS calendar_date,
        SUM("totalDuration")::integer AS total_duration,
        MIN("firstSeen") AS first_seen,
        MAX("lastSeen") AS last_seen
    FROM "AttendanceDaily"
    GROUP BY "userId", "date"::date
),
rows_to_update AS (
    SELECT *
    FROM daily_rollup
)
UPDATE "AttendanceDaily" AS target
SET
    "date" = rows_to_update.calendar_date,
    "totalDuration" = rows_to_update.total_duration,
    "firstSeen" = rows_to_update.first_seen,
    "lastSeen" = rows_to_update.last_seen,
    "updatedAt" = NOW()
FROM rows_to_update
WHERE target."id" = rows_to_update.keep_id;

DELETE FROM "AttendanceDaily" AS duplicate
USING "AttendanceDaily" AS kept
WHERE duplicate."id" > kept."id"
  AND duplicate."userId" = kept."userId"
  AND duplicate."date"::date = kept."date"::date;

ALTER TABLE "AttendanceDaily" ALTER COLUMN "date" TYPE DATE USING "date"::date;
CREATE INDEX IF NOT EXISTS "AttendanceDaily_userId_date_idx" ON "AttendanceDaily"("userId", "date");

-- Link raw presence rows back to sessions when available.
ALTER TABLE "PresenceLog" ADD COLUMN IF NOT EXISTS "sessionId" INTEGER;
CREATE INDEX IF NOT EXISTS "PresenceLog_sessionId_idx" ON "PresenceLog"("sessionId");

ALTER TABLE "PresenceLog" DROP CONSTRAINT IF EXISTS "PresenceLog_sessionId_fkey";
ALTER TABLE "PresenceLog" ADD CONSTRAINT "PresenceLog_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "AttendanceSession"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Convert free-form anomaly fields to typed enums with conservative fallbacks.
ALTER TABLE "AnomalyLog" ADD COLUMN "type_new" "AnomalyType" NOT NULL DEFAULT 'SIGNAL_ANOMALY';
ALTER TABLE "AnomalyLog" ADD COLUMN "severity_new" "AnomalySeverity" NOT NULL DEFAULT 'LOW';

UPDATE "AnomalyLog"
SET
    "type_new" = CASE UPPER("type")
        WHEN 'DEVICE_SWAP' THEN 'DEVICE_SWAP'::"AnomalyType"
        WHEN 'DUPLICATE_SESSION' THEN 'DUPLICATE_SESSION'::"AnomalyType"
        WHEN 'LOCATION_JUMP' THEN 'LOCATION_JUMP'::"AnomalyType"
        WHEN 'SIGNAL_ANOMALY' THEN 'SIGNAL_ANOMALY'::"AnomalyType"
        WHEN 'IMPOSSIBLE_TRAVEL' THEN 'IMPOSSIBLE_TRAVEL'::"AnomalyType"
        ELSE 'SIGNAL_ANOMALY'::"AnomalyType"
    END,
    "severity_new" = CASE
        WHEN "severity" >= 4 THEN 'CRITICAL'::"AnomalySeverity"
        WHEN "severity" = 3 THEN 'HIGH'::"AnomalySeverity"
        WHEN "severity" = 2 THEN 'MEDIUM'::"AnomalySeverity"
        ELSE 'LOW'::"AnomalySeverity"
    END;

ALTER TABLE "AnomalyLog" DROP COLUMN "type";
ALTER TABLE "AnomalyLog" DROP COLUMN "severity";
ALTER TABLE "AnomalyLog" RENAME COLUMN "type_new" TO "type";
ALTER TABLE "AnomalyLog" RENAME COLUMN "severity_new" TO "severity";
ALTER TABLE "AnomalyLog" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "AnomalyLog" ALTER COLUMN "severity" DROP DEFAULT;

CREATE INDEX IF NOT EXISTS "AnomalyLog_sessionId_idx" ON "AnomalyLog"("sessionId");
CREATE INDEX IF NOT EXISTS "AnomalyLog_type_idx" ON "AnomalyLog"("type");
CREATE INDEX IF NOT EXISTS "AnomalyLog_severity_idx" ON "AnomalyLog"("severity");
