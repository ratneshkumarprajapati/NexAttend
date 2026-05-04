/*
  Warnings:

  - A unique constraint covering the columns `[ssidIndex]` on the table `AccessPoint` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AccessPoint" ADD COLUMN     "ssidIndex" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "AccessPoint_ssidIndex_key" ON "AccessPoint"("ssidIndex");
