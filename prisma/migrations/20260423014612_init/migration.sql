-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('VALID', 'SUSPICIOUS', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNo" TEXT,
    "avatarUrl" TEXT,
    "department" TEXT,
    "enrolmentNo" TEXT,
    "year" INTEGER,
    "preprationGoal" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceName" TEXT,
    "hashedMac" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessPoint" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceSession" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "apId" INTEGER,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "confidenceScore" DOUBLE PRECISION,
    "status" "SessionStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresenceLog" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "apId" INTEGER,
    "rssi" INTEGER,
    "seenAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresenceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnomalyLog" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnomalyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_publicId_key" ON "User"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_publicId_key" ON "Profile"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_publicId_key" ON "Device"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_hashedMac_key" ON "Device"("hashedMac");

-- CreateIndex
CREATE UNIQUE INDEX "AccessPoint_publicId_key" ON "AccessPoint"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceSession_publicId_key" ON "AttendanceSession"("publicId");

-- CreateIndex
CREATE INDEX "AttendanceSession_userId_idx" ON "AttendanceSession"("userId");

-- CreateIndex
CREATE INDEX "AttendanceSession_deviceId_idx" ON "AttendanceSession"("deviceId");

-- CreateIndex
CREATE INDEX "AttendanceSession_startTime_endTime_idx" ON "AttendanceSession"("startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "PresenceLog_publicId_key" ON "PresenceLog"("publicId");

-- CreateIndex
CREATE INDEX "PresenceLog_deviceId_seenAt_idx" ON "PresenceLog"("deviceId", "seenAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnomalyLog_publicId_key" ON "AnomalyLog"("publicId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_apId_fkey" FOREIGN KEY ("apId") REFERENCES "AccessPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresenceLog" ADD CONSTRAINT "PresenceLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresenceLog" ADD CONSTRAINT "PresenceLog_apId_fkey" FOREIGN KEY ("apId") REFERENCES "AccessPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnomalyLog" ADD CONSTRAINT "AnomalyLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AttendanceSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
