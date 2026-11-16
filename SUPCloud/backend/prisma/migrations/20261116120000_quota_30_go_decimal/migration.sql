-- Quota de 30 Go en unités décimales (30 000 000 000 octets) au lieu de 30 Gio (32 212 254 720 octets)
ALTER TABLE "users" ALTER COLUMN "storageLimit" SET DEFAULT 30000000000;

-- Aligner les comptes existants qui avaient l'ancien quota par défaut
UPDATE "users" SET "storageLimit" = 30000000000 WHERE "storageLimit" = 32212254720;
