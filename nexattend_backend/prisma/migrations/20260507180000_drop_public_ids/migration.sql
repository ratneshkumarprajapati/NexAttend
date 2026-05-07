DROP INDEX IF EXISTS "User_publicId_key";
DROP INDEX IF EXISTS "Profile_publicId_key";
DROP INDEX IF EXISTS "Device_publicId_key";
DROP INDEX IF EXISTS "AccessPoint_publicId_key";
DROP INDEX IF EXISTS "AttendanceSession_publicId_key";
DROP INDEX IF EXISTS "AttendanceLog_publicId_key";
DROP INDEX IF EXISTS "AttendanceDaily_publicId_key";
DROP INDEX IF EXISTS "PresenceLog_publicId_key";
DROP INDEX IF EXISTS "AnomalyLog_publicId_key";

ALTER TABLE "User" DROP COLUMN IF EXISTS "publicId";
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "publicId";
ALTER TABLE "Device" DROP COLUMN IF EXISTS "publicId";
ALTER TABLE "AccessPoint" DROP COLUMN IF EXISTS "publicId";
ALTER TABLE "AttendanceSession" DROP COLUMN IF EXISTS "publicId";
ALTER TABLE "AttendanceLog" DROP COLUMN IF EXISTS "publicId";
ALTER TABLE "AttendanceDaily" DROP COLUMN IF EXISTS "publicId";
ALTER TABLE "PresenceLog" DROP COLUMN IF EXISTS "publicId";
ALTER TABLE "AnomalyLog" DROP COLUMN IF EXISTS "publicId";
