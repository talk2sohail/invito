/*
  Fixing failed migration: Add inviteCode to Circle safely.
*/

-- 1. Add column as nullable initially
ALTER TABLE "Circle" ADD COLUMN "inviteCode" TEXT;

-- 2. Populate existing rows with a unique value
-- Using md5 of random+timestamp to generate a pseudo-unique string similar to CUID length
UPDATE "Circle"
SET "inviteCode" = substring(md5(random()::text || clock_timestamp()::text) from 1 for 10)
WHERE "inviteCode" IS NULL;

-- 3. Make column required
ALTER TABLE "Circle" ALTER COLUMN "inviteCode" SET NOT NULL;

-- 4. Add unique index
CREATE UNIQUE INDEX "Circle_inviteCode_key" ON "Circle"("inviteCode");
