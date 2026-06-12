/*
  Warnings:

  - You are about to drop the column `reference` on the `Paiement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Paiement" DROP COLUMN "reference",
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
