CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION nexattend_uuid7_text()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  unix_ms BIGINT;
  bytes BYTEA;
  hex TEXT;
BEGIN
  unix_ms := floor(extract(epoch from clock_timestamp()) * 1000)::BIGINT;
  bytes := decode(lpad(to_hex(unix_ms), 12, '0'), 'hex') || gen_random_bytes(10);
  bytes := set_byte(bytes, 6, (get_byte(bytes, 6) & 15) | 112);
  bytes := set_byte(bytes, 8, (get_byte(bytes, 8) & 63) | 128);
  hex := encode(bytes, 'hex');

  RETURN lower(
    substr(hex, 1, 8) || '-' ||
    substr(hex, 9, 4) || '-' ||
    substr(hex, 13, 4) || '-' ||
    substr(hex, 17, 4) || '-' ||
    substr(hex, 21, 12)
  );
END;
$$;

ALTER TABLE "Profile" DROP CONSTRAINT IF EXISTS "Profile_userId_fkey";
ALTER TABLE "Device" DROP CONSTRAINT IF EXISTS "Device_userId_fkey";
ALTER TABLE "AttendanceSession" DROP CONSTRAINT IF EXISTS "AttendanceSession_userId_fkey";
ALTER TABLE "AttendanceSession" DROP CONSTRAINT IF EXISTS "AttendanceSession_deviceId_fkey";
ALTER TABLE "AttendanceSession" DROP CONSTRAINT IF EXISTS "AttendanceSession_apId_fkey";
ALTER TABLE "AttendanceLog" DROP CONSTRAINT IF EXISTS "AttendanceLog_sessionId_fkey";
ALTER TABLE "AttendanceLog" DROP CONSTRAINT IF EXISTS "AttendanceLog_userId_fkey";
ALTER TABLE "AttendanceLog" DROP CONSTRAINT IF EXISTS "AttendanceLog_deviceId_fkey";
ALTER TABLE "AttendanceDaily" DROP CONSTRAINT IF EXISTS "AttendanceDaily_userId_fkey";
ALTER TABLE "PresenceLog" DROP CONSTRAINT IF EXISTS "PresenceLog_deviceId_fkey";
ALTER TABLE "PresenceLog" DROP CONSTRAINT IF EXISTS "PresenceLog_apId_fkey";
ALTER TABLE "PresenceLog" DROP CONSTRAINT IF EXISTS "PresenceLog_sessionId_fkey";
ALTER TABLE "AnomalyLog" DROP CONSTRAINT IF EXISTS "AnomalyLog_sessionId_fkey";

ALTER TABLE "User" ADD COLUMN "_newId" TEXT;
ALTER TABLE "User" ADD COLUMN "_newPublicId" TEXT;
ALTER TABLE "Profile" ADD COLUMN "_newId" TEXT;
ALTER TABLE "Profile" ADD COLUMN "_newPublicId" TEXT;
ALTER TABLE "Profile" ADD COLUMN "_newUserId" TEXT;
ALTER TABLE "Device" ADD COLUMN "_newId" TEXT;
ALTER TABLE "Device" ADD COLUMN "_newPublicId" TEXT;
ALTER TABLE "Device" ADD COLUMN "_newUserId" TEXT;
ALTER TABLE "AccessPoint" ADD COLUMN "_newId" TEXT;
ALTER TABLE "AccessPoint" ADD COLUMN "_newPublicId" TEXT;
ALTER TABLE "AttendanceSession" ADD COLUMN "_newId" TEXT;
ALTER TABLE "AttendanceSession" ADD COLUMN "_newPublicId" TEXT;
ALTER TABLE "AttendanceSession" ADD COLUMN "_newUserId" TEXT;
ALTER TABLE "AttendanceSession" ADD COLUMN "_newDeviceId" TEXT;
ALTER TABLE "AttendanceSession" ADD COLUMN "_newApId" TEXT;
ALTER TABLE "AttendanceLog" ADD COLUMN "_newId" TEXT;
ALTER TABLE "AttendanceLog" ADD COLUMN "_newPublicId" TEXT;
ALTER TABLE "AttendanceLog" ADD COLUMN "_newSessionId" TEXT;
ALTER TABLE "AttendanceLog" ADD COLUMN "_newUserId" TEXT;
ALTER TABLE "AttendanceLog" ADD COLUMN "_newDeviceId" TEXT;
ALTER TABLE "AttendanceDaily" ADD COLUMN "_newId" TEXT;
ALTER TABLE "AttendanceDaily" ADD COLUMN "_newPublicId" TEXT;
ALTER TABLE "AttendanceDaily" ADD COLUMN "_newUserId" TEXT;
ALTER TABLE "PresenceLog" ADD COLUMN "_newId" TEXT;
ALTER TABLE "PresenceLog" ADD COLUMN "_newPublicId" TEXT;
ALTER TABLE "PresenceLog" ADD COLUMN "_newDeviceId" TEXT;
ALTER TABLE "PresenceLog" ADD COLUMN "_newApId" TEXT;
ALTER TABLE "PresenceLog" ADD COLUMN "_newSessionId" TEXT;
ALTER TABLE "AnomalyLog" ADD COLUMN "_newId" TEXT;
ALTER TABLE "AnomalyLog" ADD COLUMN "_newPublicId" TEXT;
ALTER TABLE "AnomalyLog" ADD COLUMN "_newSessionId" TEXT;

UPDATE "User" SET "_newId" = nexattend_uuid7_text(), "_newPublicId" = nexattend_uuid7_text();
UPDATE "Profile" SET "_newId" = nexattend_uuid7_text(), "_newPublicId" = nexattend_uuid7_text();
UPDATE "Device" SET "_newId" = nexattend_uuid7_text(), "_newPublicId" = nexattend_uuid7_text();
UPDATE "AccessPoint" SET "_newId" = nexattend_uuid7_text(), "_newPublicId" = nexattend_uuid7_text();
UPDATE "AttendanceSession" SET "_newId" = nexattend_uuid7_text(), "_newPublicId" = nexattend_uuid7_text();
UPDATE "AttendanceLog" SET "_newId" = nexattend_uuid7_text(), "_newPublicId" = nexattend_uuid7_text();
UPDATE "AttendanceDaily" SET "_newId" = nexattend_uuid7_text(), "_newPublicId" = nexattend_uuid7_text();
UPDATE "PresenceLog" SET "_newId" = nexattend_uuid7_text(), "_newPublicId" = nexattend_uuid7_text();
UPDATE "AnomalyLog" SET "_newId" = nexattend_uuid7_text(), "_newPublicId" = nexattend_uuid7_text();

UPDATE "Profile" p SET "_newUserId" = u."_newId" FROM "User" u WHERE p."userId" = u."id";
UPDATE "Device" d SET "_newUserId" = u."_newId" FROM "User" u WHERE d."userId" = u."id";
UPDATE "AttendanceSession" s SET "_newUserId" = u."_newId" FROM "User" u WHERE s."userId" = u."id";
UPDATE "AttendanceSession" s SET "_newDeviceId" = d."_newId" FROM "Device" d WHERE s."deviceId" = d."id";
UPDATE "AttendanceSession" s SET "_newApId" = a."_newId" FROM "AccessPoint" a WHERE s."apId" = a."id";
UPDATE "AttendanceLog" l SET "_newSessionId" = s."_newId" FROM "AttendanceSession" s WHERE l."sessionId" = s."id";
UPDATE "AttendanceLog" l SET "_newUserId" = u."_newId" FROM "User" u WHERE l."userId" = u."id";
UPDATE "AttendanceLog" l SET "_newDeviceId" = d."_newId" FROM "Device" d WHERE l."deviceId" = d."id";
UPDATE "AttendanceDaily" a SET "_newUserId" = u."_newId" FROM "User" u WHERE a."userId" = u."id";
UPDATE "PresenceLog" p SET "_newDeviceId" = d."_newId" FROM "Device" d WHERE p."deviceId" = d."id";
UPDATE "PresenceLog" p SET "_newApId" = a."_newId" FROM "AccessPoint" a WHERE p."apId" = a."id";
UPDATE "PresenceLog" p SET "_newSessionId" = s."_newId" FROM "AttendanceSession" s WHERE p."sessionId" = s."id";
UPDATE "AnomalyLog" a SET "_newSessionId" = s."_newId" FROM "AttendanceSession" s WHERE a."sessionId" = s."id";

DROP INDEX IF EXISTS "User_publicId_key";
DROP INDEX IF EXISTS "Profile_publicId_key";
DROP INDEX IF EXISTS "Profile_userId_key";
DROP INDEX IF EXISTS "Device_publicId_key";
DROP INDEX IF EXISTS "Device_userId_idx";
DROP INDEX IF EXISTS "AccessPoint_publicId_key";
DROP INDEX IF EXISTS "AttendanceSession_publicId_key";
DROP INDEX IF EXISTS "AttendanceSession_userId_idx";
DROP INDEX IF EXISTS "AttendanceSession_deviceId_idx";
DROP INDEX IF EXISTS "AttendanceSession_apId_idx";
DROP INDEX IF EXISTS "AttendanceSession_userId_startTime_idx";
DROP INDEX IF EXISTS "unique_active_session";
DROP INDEX IF EXISTS "AttendanceLog_publicId_key";
DROP INDEX IF EXISTS "AttendanceLog_sessionId_idx";
DROP INDEX IF EXISTS "AttendanceLog_userId_idx";
DROP INDEX IF EXISTS "AttendanceLog_deviceId_idx";
DROP INDEX IF EXISTS "AttendanceLog_userId_timestamp_idx";
DROP INDEX IF EXISTS "AttendanceLog_sessionId_timestamp_idx";
DROP INDEX IF EXISTS "AttendanceDaily_publicId_key";
DROP INDEX IF EXISTS "AttendanceDaily_userId_date_key";
DROP INDEX IF EXISTS "AttendanceDaily_userId_date_idx";
DROP INDEX IF EXISTS "PresenceLog_publicId_key";
DROP INDEX IF EXISTS "PresenceLog_deviceId_seenAt_idx";
DROP INDEX IF EXISTS "PresenceLog_sessionId_idx";
DROP INDEX IF EXISTS "AnomalyLog_publicId_key";
DROP INDEX IF EXISTS "AnomalyLog_sessionId_idx";

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE "Profile" DROP CONSTRAINT IF EXISTS "Profile_pkey";
ALTER TABLE "Device" DROP CONSTRAINT IF EXISTS "Device_pkey";
ALTER TABLE "AccessPoint" DROP CONSTRAINT IF EXISTS "AccessPoint_pkey";
ALTER TABLE "AttendanceSession" DROP CONSTRAINT IF EXISTS "AttendanceSession_pkey";
ALTER TABLE "AttendanceLog" DROP CONSTRAINT IF EXISTS "AttendanceLog_pkey";
ALTER TABLE "AttendanceDaily" DROP CONSTRAINT IF EXISTS "AttendanceDaily_pkey";
ALTER TABLE "PresenceLog" DROP CONSTRAINT IF EXISTS "PresenceLog_pkey";
ALTER TABLE "AnomalyLog" DROP CONSTRAINT IF EXISTS "AnomalyLog_pkey";

ALTER TABLE "Profile" DROP COLUMN "id", DROP COLUMN "publicId", DROP COLUMN "userId";
ALTER TABLE "Device" DROP COLUMN "id", DROP COLUMN "publicId", DROP COLUMN "userId";
ALTER TABLE "AttendanceSession" DROP COLUMN "id", DROP COLUMN "publicId", DROP COLUMN "userId", DROP COLUMN "deviceId", DROP COLUMN "apId";
ALTER TABLE "AttendanceLog" DROP COLUMN "id", DROP COLUMN "publicId", DROP COLUMN "sessionId", DROP COLUMN "userId", DROP COLUMN "deviceId";
ALTER TABLE "AttendanceDaily" DROP COLUMN "id", DROP COLUMN "publicId", DROP COLUMN "userId";
ALTER TABLE "PresenceLog" DROP COLUMN "id", DROP COLUMN "publicId", DROP COLUMN "deviceId", DROP COLUMN "apId", DROP COLUMN "sessionId";
ALTER TABLE "AnomalyLog" DROP COLUMN "id", DROP COLUMN "publicId", DROP COLUMN "sessionId";
ALTER TABLE "User" DROP COLUMN "id", DROP COLUMN "publicId";
ALTER TABLE "AccessPoint" DROP COLUMN "id", DROP COLUMN "publicId";

ALTER TABLE "User" RENAME COLUMN "_newId" TO "id";
ALTER TABLE "User" RENAME COLUMN "_newPublicId" TO "publicId";
ALTER TABLE "Profile" RENAME COLUMN "_newId" TO "id";
ALTER TABLE "Profile" RENAME COLUMN "_newPublicId" TO "publicId";
ALTER TABLE "Profile" RENAME COLUMN "_newUserId" TO "userId";
ALTER TABLE "Device" RENAME COLUMN "_newId" TO "id";
ALTER TABLE "Device" RENAME COLUMN "_newPublicId" TO "publicId";
ALTER TABLE "Device" RENAME COLUMN "_newUserId" TO "userId";
ALTER TABLE "AccessPoint" RENAME COLUMN "_newId" TO "id";
ALTER TABLE "AccessPoint" RENAME COLUMN "_newPublicId" TO "publicId";
ALTER TABLE "AttendanceSession" RENAME COLUMN "_newId" TO "id";
ALTER TABLE "AttendanceSession" RENAME COLUMN "_newPublicId" TO "publicId";
ALTER TABLE "AttendanceSession" RENAME COLUMN "_newUserId" TO "userId";
ALTER TABLE "AttendanceSession" RENAME COLUMN "_newDeviceId" TO "deviceId";
ALTER TABLE "AttendanceSession" RENAME COLUMN "_newApId" TO "apId";
ALTER TABLE "AttendanceLog" RENAME COLUMN "_newId" TO "id";
ALTER TABLE "AttendanceLog" RENAME COLUMN "_newPublicId" TO "publicId";
ALTER TABLE "AttendanceLog" RENAME COLUMN "_newSessionId" TO "sessionId";
ALTER TABLE "AttendanceLog" RENAME COLUMN "_newUserId" TO "userId";
ALTER TABLE "AttendanceLog" RENAME COLUMN "_newDeviceId" TO "deviceId";
ALTER TABLE "AttendanceDaily" RENAME COLUMN "_newId" TO "id";
ALTER TABLE "AttendanceDaily" RENAME COLUMN "_newPublicId" TO "publicId";
ALTER TABLE "AttendanceDaily" RENAME COLUMN "_newUserId" TO "userId";
ALTER TABLE "PresenceLog" RENAME COLUMN "_newId" TO "id";
ALTER TABLE "PresenceLog" RENAME COLUMN "_newPublicId" TO "publicId";
ALTER TABLE "PresenceLog" RENAME COLUMN "_newDeviceId" TO "deviceId";
ALTER TABLE "PresenceLog" RENAME COLUMN "_newApId" TO "apId";
ALTER TABLE "PresenceLog" RENAME COLUMN "_newSessionId" TO "sessionId";
ALTER TABLE "AnomalyLog" RENAME COLUMN "_newId" TO "id";
ALTER TABLE "AnomalyLog" RENAME COLUMN "_newPublicId" TO "publicId";
ALTER TABLE "AnomalyLog" RENAME COLUMN "_newSessionId" TO "sessionId";

UPDATE "User" SET "id" = COALESCE("id", nexattend_uuid7_text()), "publicId" = COALESCE("publicId", nexattend_uuid7_text());
UPDATE "Profile" SET "id" = COALESCE("id", nexattend_uuid7_text()), "publicId" = COALESCE("publicId", nexattend_uuid7_text());
UPDATE "Device" SET "id" = COALESCE("id", nexattend_uuid7_text()), "publicId" = COALESCE("publicId", nexattend_uuid7_text());
UPDATE "AccessPoint" SET "id" = COALESCE("id", nexattend_uuid7_text()), "publicId" = COALESCE("publicId", nexattend_uuid7_text());
UPDATE "AttendanceSession" SET "id" = COALESCE("id", nexattend_uuid7_text()), "publicId" = COALESCE("publicId", nexattend_uuid7_text());
UPDATE "AttendanceLog" SET "id" = COALESCE("id", nexattend_uuid7_text()), "publicId" = COALESCE("publicId", nexattend_uuid7_text());
UPDATE "AttendanceDaily" SET "id" = COALESCE("id", nexattend_uuid7_text()), "publicId" = COALESCE("publicId", nexattend_uuid7_text());
UPDATE "PresenceLog" SET "id" = COALESCE("id", nexattend_uuid7_text()), "publicId" = COALESCE("publicId", nexattend_uuid7_text());
UPDATE "AnomalyLog" SET "id" = COALESCE("id", nexattend_uuid7_text()), "publicId" = COALESCE("publicId", nexattend_uuid7_text());

ALTER TABLE "User" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "publicId" SET NOT NULL;
ALTER TABLE "Profile" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "publicId" SET NOT NULL, ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Device" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "publicId" SET NOT NULL, ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "AccessPoint" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "publicId" SET NOT NULL;
ALTER TABLE "AttendanceSession" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "publicId" SET NOT NULL, ALTER COLUMN "userId" SET NOT NULL, ALTER COLUMN "deviceId" SET NOT NULL;
ALTER TABLE "AttendanceLog" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "publicId" SET NOT NULL, ALTER COLUMN "userId" SET NOT NULL, ALTER COLUMN "deviceId" SET NOT NULL;
ALTER TABLE "AttendanceDaily" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "publicId" SET NOT NULL, ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "PresenceLog" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "publicId" SET NOT NULL, ALTER COLUMN "deviceId" SET NOT NULL;
ALTER TABLE "AnomalyLog" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "publicId" SET NOT NULL, ALTER COLUMN "sessionId" SET NOT NULL;

ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_pkey" PRIMARY KEY ("id");
ALTER TABLE "Device" ADD CONSTRAINT "Device_pkey" PRIMARY KEY ("id");
ALTER TABLE "AccessPoint" ADD CONSTRAINT "AccessPoint_pkey" PRIMARY KEY ("id");
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id");
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_pkey" PRIMARY KEY ("id");
ALTER TABLE "AttendanceDaily" ADD CONSTRAINT "AttendanceDaily_pkey" PRIMARY KEY ("id");
ALTER TABLE "PresenceLog" ADD CONSTRAINT "PresenceLog_pkey" PRIMARY KEY ("id");
ALTER TABLE "AnomalyLog" ADD CONSTRAINT "AnomalyLog_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "User_publicId_key" ON "User"("publicId");
CREATE UNIQUE INDEX "Profile_publicId_key" ON "Profile"("publicId");
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE UNIQUE INDEX "Device_publicId_key" ON "Device"("publicId");
CREATE INDEX "Device_userId_idx" ON "Device"("userId");
CREATE UNIQUE INDEX "AccessPoint_publicId_key" ON "AccessPoint"("publicId");
CREATE UNIQUE INDEX "AttendanceSession_publicId_key" ON "AttendanceSession"("publicId");
CREATE INDEX "AttendanceSession_userId_idx" ON "AttendanceSession"("userId");
CREATE INDEX "AttendanceSession_deviceId_idx" ON "AttendanceSession"("deviceId");
CREATE INDEX "AttendanceSession_apId_idx" ON "AttendanceSession"("apId");
CREATE INDEX "AttendanceSession_userId_startTime_idx" ON "AttendanceSession"("userId", "startTime");
CREATE UNIQUE INDEX "unique_active_session" ON "AttendanceSession"("userId", "deviceId") WHERE "endTime" IS NULL;
CREATE UNIQUE INDEX "AttendanceLog_publicId_key" ON "AttendanceLog"("publicId");
CREATE INDEX "AttendanceLog_sessionId_idx" ON "AttendanceLog"("sessionId");
CREATE INDEX "AttendanceLog_userId_idx" ON "AttendanceLog"("userId");
CREATE INDEX "AttendanceLog_deviceId_idx" ON "AttendanceLog"("deviceId");
CREATE INDEX "AttendanceLog_userId_timestamp_idx" ON "AttendanceLog"("userId", "timestamp");
CREATE INDEX "AttendanceLog_sessionId_timestamp_idx" ON "AttendanceLog"("sessionId", "timestamp");
CREATE UNIQUE INDEX "AttendanceDaily_publicId_key" ON "AttendanceDaily"("publicId");
CREATE UNIQUE INDEX "AttendanceDaily_userId_date_key" ON "AttendanceDaily"("userId", "date");
CREATE INDEX "AttendanceDaily_userId_date_idx" ON "AttendanceDaily"("userId", "date");
CREATE UNIQUE INDEX "PresenceLog_publicId_key" ON "PresenceLog"("publicId");
CREATE INDEX "PresenceLog_deviceId_seenAt_idx" ON "PresenceLog"("deviceId", "seenAt");
CREATE INDEX "PresenceLog_sessionId_idx" ON "PresenceLog"("sessionId");
CREATE UNIQUE INDEX "AnomalyLog_publicId_key" ON "AnomalyLog"("publicId");
CREATE INDEX "AnomalyLog_sessionId_idx" ON "AnomalyLog"("sessionId");

ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_apId_fkey" FOREIGN KEY ("apId") REFERENCES "AccessPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AttendanceSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceDaily" ADD CONSTRAINT "AttendanceDaily_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PresenceLog" ADD CONSTRAINT "PresenceLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PresenceLog" ADD CONSTRAINT "PresenceLog_apId_fkey" FOREIGN KEY ("apId") REFERENCES "AccessPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PresenceLog" ADD CONSTRAINT "PresenceLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AttendanceSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AnomalyLog" ADD CONSTRAINT "AnomalyLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AttendanceSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP FUNCTION nexattend_uuid7_text();
