-- Add nullable fields so all existing records remain valid and untouched.
-- The legacy name column intentionally remains: names cannot be reliably split.
ALTER TABLE "Wedding" ADD COLUMN "groomName" TEXT;
ALTER TABLE "Wedding" ADD COLUMN "brideName" TEXT;
