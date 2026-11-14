-- AlterTable
ALTER TABLE "files" ADD COLUMN     "trashItemId" TEXT;

-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "trashItemId" TEXT;

-- CreateIndex
CREATE INDEX "files_trashItemId_idx" ON "files"("trashItemId");

-- CreateIndex
CREATE INDEX "folders_trashItemId_idx" ON "folders"("trashItemId");

