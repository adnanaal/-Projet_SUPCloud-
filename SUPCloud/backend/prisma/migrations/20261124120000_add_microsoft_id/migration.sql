-- AlterTable
ALTER TABLE "users" ADD COLUMN     "microsoftId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_microsoftId_key" ON "users"("microsoftId");
