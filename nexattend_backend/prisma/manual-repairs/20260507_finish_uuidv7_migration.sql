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

UPDATE "AttendanceLog"
SET
  "id" = COALESCE("id", nexattend_uuid7_text()),
  "publicId" = COALESCE("publicId", nexattend_uuid7_text());

UPDATE "PresenceLog"
SET
  "id" = COALESCE("id", nexattend_uuid7_text()),
  "publicId" = COALESCE("publicId", nexattend_uuid7_text());

ALTER TABLE "User" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "Profile" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Device" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "AccessPoint" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "AttendanceSession" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "userId" SET NOT NULL, ALTER COLUMN "deviceId" SET NOT NULL;
ALTER TABLE "AttendanceLog" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "userId" SET NOT NULL, ALTER COLUMN "deviceId" SET NOT NULL;
ALTER TABLE "AttendanceDaily" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "PresenceLog" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "deviceId" SET NOT NULL;
ALTER TABLE "AnomalyLog" ALTER COLUMN "id" SET NOT NULL, ALTER COLUMN "sessionId" SET NOT NULL;

ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_pkey" PRIMARY KEY ("id");
ALTER TABLE "Device" ADD CONSTRAINT "Device_pkey" PRIMARY KEY ("id");
ALTER TABLE "AccessPoint" ADD CONSTRAINT "AccessPoint_pkey" PRIMARY KEY ("id");
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id");
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_pkey" PRIMARY KEY ("id");
ALTER TABLE "AttendanceDaily" ADD CONSTRAINT "AttendanceDaily_pkey" PRIMARY KEY ("id");
ALTER TABLE "PresenceLog" ADD CONSTRAINT "PresenceLog_pkey" PRIMARY KEY ("id");
ALTER TABLE "AnomalyLog" ADD CONSTRAINT "AnomalyLog_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE INDEX "Device_userId_idx" ON "Device"("userId");
CREATE INDEX "AttendanceSession_userId_idx" ON "AttendanceSession"("userId");
CREATE INDEX "AttendanceSession_deviceId_idx" ON "AttendanceSession"("deviceId");
CREATE INDEX "AttendanceSession_apId_idx" ON "AttendanceSession"("apId");
CREATE INDEX "AttendanceSession_userId_startTime_idx" ON "AttendanceSession"("userId", "startTime");
CREATE UNIQUE INDEX "unique_active_session" ON "AttendanceSession"("userId", "deviceId") WHERE "endTime" IS NULL;
CREATE INDEX "AttendanceLog_sessionId_idx" ON "AttendanceLog"("sessionId");
CREATE INDEX "AttendanceLog_userId_idx" ON "AttendanceLog"("userId");
CREATE INDEX "AttendanceLog_deviceId_idx" ON "AttendanceLog"("deviceId");
CREATE INDEX "AttendanceLog_userId_timestamp_idx" ON "AttendanceLog"("userId", "timestamp");
CREATE INDEX "AttendanceLog_sessionId_timestamp_idx" ON "AttendanceLog"("sessionId", "timestamp");
CREATE UNIQUE INDEX "AttendanceDaily_userId_date_key" ON "AttendanceDaily"("userId", "date");
CREATE INDEX "AttendanceDaily_userId_date_idx" ON "AttendanceDaily"("userId", "date");
CREATE INDEX "PresenceLog_deviceId_seenAt_idx" ON "PresenceLog"("deviceId", "seenAt");
CREATE INDEX "PresenceLog_sessionId_idx" ON "PresenceLog"("sessionId");
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
