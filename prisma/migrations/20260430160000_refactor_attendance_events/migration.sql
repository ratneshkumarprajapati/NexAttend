-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');

-- Migrate AttendanceLog from time-range records to event records.
ALTER TABLE "AttendanceLog" ADD COLUMN "timestamp" TIMESTAMP(3);
ALTER TABLE "AttendanceLog" ADD COLUMN "status" "AttendanceStatus";

UPDATE "AttendanceLog"
SET
    "timestamp" = COALESCE("startTime", "createdAt"),
    "status" = 'PRESENT'
WHERE "timestamp" IS NULL;

ALTER TABLE "AttendanceLog" ALTER COLUMN "timestamp" SET NOT NULL;
ALTER TABLE "AttendanceLog" ALTER COLUMN "status" SET NOT NULL;

ALTER TABLE "AttendanceLog" ALTER COLUMN "sessionId" DROP NOT NULL;
ALTER TABLE "AttendanceLog" DROP COLUMN IF EXISTS "startTime";
ALTER TABLE "AttendanceLog" DROP COLUMN IF EXISTS "endTime";
ALTER TABLE "AttendanceLog" DROP COLUMN IF EXISTS "duration";

DROP INDEX IF EXISTS "AttendanceLog_startTime_endTime_idx";
CREATE INDEX "AttendanceLog_timestamp_idx" ON "AttendanceLog"("timestamp");
CREATE INDEX "AttendanceLog_userId_timestamp_idx" ON "AttendanceLog"("userId", "timestamp");

ALTER TABLE "AttendanceLog" DROP CONSTRAINT IF EXISTS "AttendanceLog_sessionId_fkey";
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AttendanceSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AttendanceSession keeps fixed startTime, mutable lastSeen heartbeat, and final endTime.
ALTER TABLE "AttendanceSession" ADD COLUMN "lastSeen" TIMESTAMP(3);

UPDATE "AttendanceSession"
SET "lastSeen" = COALESCE("endTime", "startTime")
WHERE "lastSeen" IS NULL;

ALTER TABLE "AttendanceSession" ALTER COLUMN "lastSeen" SET NOT NULL;

-- Close older duplicate active sessions before enforcing the partial unique index.
WITH ranked_active_sessions AS (
    SELECT
        "id",
        "startTime",
        "lastSeen",
        ROW_NUMBER() OVER (
            PARTITION BY "userId", "deviceId"
            ORDER BY "startTime" DESC, "id" DESC
        ) AS row_number
    FROM "AttendanceSession"
    WHERE "endTime" IS NULL
)
UPDATE "AttendanceSession" AS session
SET
    "endTime" = ranked."lastSeen",
    "duration" = GREATEST(
        0,
        FLOOR(EXTRACT(EPOCH FROM (ranked."lastSeen" - ranked."startTime")))::integer
    )
FROM ranked_active_sessions AS ranked
WHERE session."id" = ranked."id"
  AND ranked.row_number > 1;

-- Enforce one active aggregate session per user/device at the database level.
CREATE UNIQUE INDEX IF NOT EXISTS "unique_active_session"
ON "AttendanceSession" ("userId", "deviceId")
WHERE "endTime" IS NULL;

-- Calendar aggregation table.
CREATE TABLE "AttendanceDaily" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "firstSeen" TIMESTAMP(3),
    "lastSeen" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceDaily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AttendanceDaily_publicId_key" ON "AttendanceDaily"("publicId");
CREATE UNIQUE INDEX "AttendanceDaily_userId_date_key" ON "AttendanceDaily"("userId", "date");
CREATE INDEX "AttendanceDaily_date_idx" ON "AttendanceDaily"("date");

ALTER TABLE "AttendanceDaily" ADD CONSTRAINT "AttendanceDaily_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
