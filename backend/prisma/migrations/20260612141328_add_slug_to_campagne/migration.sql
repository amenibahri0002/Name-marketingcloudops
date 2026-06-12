/*
  Warnings:

  - You are about to alter the column `status` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE "Inscription" ADD COLUMN     "entreprise" VARCHAR(255),
ADD COLUMN     "formule" VARCHAR(50) NOT NULL DEFAULT 'standard',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentType" VARCHAR(50) NOT NULL DEFAULT 'carte',
ADD COLUMN     "prixTotal" INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "status" SET DATA TYPE VARCHAR(50);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" SERIAL NOT NULL,
    "inscriptionId" INTEGER,
    "montant" INTEGER,
    "mode" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'en_attente',
    "reference" VARCHAR(100),
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
