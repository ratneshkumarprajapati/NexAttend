DROP INDEX IF EXISTS "AccessPoint_ssidIndex_key";

ALTER TABLE "AccessPoint"
ADD COLUMN IF NOT EXISTS "routerKey" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN IF NOT EXISTS "routerName" TEXT,
ADD COLUMN IF NOT EXISTS "routerProvider" TEXT;

CREATE UNIQUE INDEX "AccessPoint_routerKey_ssidIndex_key" ON "AccessPoint"("routerKey", "ssidIndex");
CREATE INDEX "AccessPoint_routerKey_idx" ON "AccessPoint"("routerKey");
