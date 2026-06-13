/*
  Warnings:

  - The values [EVENT,WEBINAR] on the enum `CampagneType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CampagneType_new" AS ENUM ('FORMATION', 'PRODUIT', 'EVENEMENT', 'WEBINAIRE', 'NEWSLETTER', 'MARKETING');
ALTER TABLE "Campagne" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Campagne" ALTER COLUMN "type" TYPE "CampagneType_new" USING ("type"::text::"CampagneType_new");
ALTER TYPE "CampagneType" RENAME TO "CampagneType_old";
ALTER TYPE "CampagneType_new" RENAME TO "CampagneType";
DROP TYPE "CampagneType_old";
ALTER TABLE "Campagne" ALTER COLUMN "type" SET DEFAULT 'MARKETING';
COMMIT;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "password" VARCHAR(255),
ADD COLUMN     "role" VARCHAR(50) DEFAULT 'CLIENT',
ADD COLUMN     "sector" VARCHAR(255),
ADD COLUMN     "status" VARCHAR(50) DEFAULT 'active',
ADD COLUMN     "type" VARCHAR(50) DEFAULT 'particulier',
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Inscription" ADD COLUMN     "clientId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "role" SET DEFAULT 'CLIENT',
ALTER COLUMN "role" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
