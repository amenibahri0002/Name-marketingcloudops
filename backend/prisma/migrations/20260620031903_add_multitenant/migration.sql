/*
  Warnings:

  - The primary key for the `Alerte` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `campagneId` on the `Alerte` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Alerte` table. All the data in the column will be lost.
  - The `status` column on the `Alerte` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Campagne` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clientId` on the `Campagne` table. All the data in the column will be lost.
  - You are about to drop the column `couleur` on the `Campagne` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Campagne` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Campagne` table. All the data in the column will be lost.
  - You are about to drop the column `iconName` on the `Campagne` table. All the data in the column will be lost.
  - You are about to drop the column `inclus` on the `Campagne` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Campagne` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Campagne` table. All the data in the column will be lost.
  - You are about to drop the column `prerequis` on the `Campagne` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `Campagne` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Campagne` table. All the data in the column will be lost.
  - You are about to drop the column `tools` on the `Campagne` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Campagne` table. All the data in the column will be lost.
  - The primary key for the `Client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `role` on the `Client` table. All the data in the column will be lost.
  - The `status` column on the `Client` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `Client` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clientId` on the `Contact` table. All the data in the column will be lost.
  - The primary key for the `ContactSegment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Inscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `entreprise` on the `Inscription` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Inscription` table. All the data in the column will be lost.
  - The `status` column on the `Inscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clientId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `segmentId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Notification` table. All the data in the column will be lost.
  - The `type` column on the `Notification` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `canal` column on the `Notification` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Paiement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `mode` column on the `Paiement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Paiement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `PushSubscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Segment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clientId` on the `Segment` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clientId` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CampagneStats` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tenantId,slug]` on the table `Campagne` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactId,segmentId]` on the table `ContactSegment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reference]` on the table `Paiement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,endpoint]` on the table `PushSubscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `Alerte` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Alerte` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `tenantId` to the `Campagne` table without a default value. This is not possible if the table is not empty.
  - Made the column `placesTotal` on table `Campagne` required. This step will fail if there are existing NULL values in that column.
  - Made the column `placesRestantes` on table `Campagne` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Campagne` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Campagne` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdAt` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Client` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdAt` on table `Contact` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contactId` on table `ContactSegment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `segmentId` on table `ContactSegment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `Inscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Inscription` table without a default value. This is not possible if the table is not empty.
  - Made the column `campagneId` on table `Inscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Inscription` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Paiement` table without a default value. This is not possible if the table is not empty.
  - Made the column `montant` on table `Paiement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Paiement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Paiement` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdAt` on table `PushSubscription` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `Segment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Segment` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdAt` on table `Segment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenantId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdAt` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'STARTER', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'ADMIN', 'RESPONSABLE_MARKETING', 'SUPPORT', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('PARTICULIER', 'ENTREPRISE', 'ASSOCIATION', 'INSTITUTION');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PROSPECT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InscriptionStatus" AS ENUM ('EN_ATTENTE', 'CONFIRMEE', 'PAYEE', 'ANNULEE', 'TERMINEE');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CARTE', 'VIREMENT', 'ESPECES', 'CHEQUE', 'EN_LIGNE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('EN_ATTENTE', 'PAYE', 'ECHOUE', 'REMBOURSE', 'ANNULE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PROMOTION', 'NOUVELLE_CAMPAGNE', 'RAPPEL', 'ALERTE', 'CONFIRMATION', 'FACTURE');

-- CreateEnum
CREATE TYPE "NotificationCanal" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'WHATSAPP', 'SOCIAL', 'IN_APP');

-- CreateEnum
CREATE TYPE "NiveauType" AS ENUM ('DEBUTANT', 'ETUDIANT', 'PROFESSIONNEL', 'EXPERT');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('PARTICULIER', 'ENTREPRISE', 'ASSOCIATION');

-- CreateEnum
CREATE TYPE "AlerteType" AS ENUM ('CAPACITE', 'PAIEMENT', 'INSCRIPTION', 'SYSTEME', 'SECURITE');

-- CreateEnum
CREATE TYPE "AlerteStatus" AS ENUM ('ACTIVE', 'RESOLUE', 'IGNOREE');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "Alerte" DROP CONSTRAINT "Alerte_campagneId_fkey";

-- DropForeignKey
ALTER TABLE "Alerte" DROP CONSTRAINT "Alerte_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Campagne" DROP CONSTRAINT "Campagne_clientId_fkey";

-- DropForeignKey
ALTER TABLE "CampagneStats" DROP CONSTRAINT "CampagneStats_campagneId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ContactSegment" DROP CONSTRAINT "ContactSegment_contactId_fkey";

-- DropForeignKey
ALTER TABLE "ContactSegment" DROP CONSTRAINT "ContactSegment_segmentId_fkey";

-- DropForeignKey
ALTER TABLE "Inscription" DROP CONSTRAINT "Inscription_campagneId_fkey";

-- DropForeignKey
ALTER TABLE "Inscription" DROP CONSTRAINT "Inscription_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Inscription" DROP CONSTRAINT "Inscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_campagneId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_segmentId_fkey";

-- DropForeignKey
ALTER TABLE "Paiement" DROP CONSTRAINT "Paiement_inscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Paiement" DROP CONSTRAINT "Paiement_userId_fkey";

-- DropForeignKey
ALTER TABLE "PushSubscription" DROP CONSTRAINT "PushSubscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "Segment" DROP CONSTRAINT "Segment_clientId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_clientId_fkey";

-- DropIndex
DROP INDEX "Campagne_slug_key";

-- DropIndex
DROP INDEX "Client_email_key";

-- DropIndex
DROP INDEX "Contact_email_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Alerte" DROP CONSTRAINT "Alerte_pkey",
DROP COLUMN "campagneId",
DROP COLUMN "clientId",
ADD COLUMN     "resolvedBy" TEXT,
ADD COLUMN     "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "tenantId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "AlerteType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "AlerteStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "resolvedAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "Alerte_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Alerte_id_seq";

-- AlterTable
ALTER TABLE "Campagne" DROP CONSTRAINT "Campagne_pkey",
DROP COLUMN "clientId",
DROP COLUMN "couleur",
DROP COLUMN "date",
DROP COLUMN "duration",
DROP COLUMN "iconName",
DROP COLUMN "inclus",
DROP COLUMN "isPublic",
DROP COLUMN "location",
DROP COLUMN "prerequis",
DROP COLUMN "sentAt",
DROP COLUMN "tags",
DROP COLUMN "tools",
DROP COLUMN "url",
ADD COLUMN     "dateAffichee" TEXT,
ADD COLUMN     "duree" TEXT,
ADD COLUMN     "lieu" TEXT,
ADD COLUMN     "tenantId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "slug" SET DATA TYPE TEXT,
ALTER COLUMN "type" SET DEFAULT 'FORMATION',
ALTER COLUMN "image" SET DATA TYPE TEXT,
ALTER COLUMN "format" SET DATA TYPE TEXT,
ALTER COLUMN "dateScheduled" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "contact" SET DATA TYPE TEXT,
ALTER COLUMN "placesTotal" SET NOT NULL,
ALTER COLUMN "placesTotal" SET DEFAULT 20,
ALTER COLUMN "placesRestantes" SET NOT NULL,
ALTER COLUMN "placesRestantes" SET DEFAULT 20,
ALTER COLUMN "dureeHeures" DROP DEFAULT,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "Campagne_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Campagne_id_seq";

-- AlterTable
ALTER TABLE "Client" DROP CONSTRAINT "Client_pkey",
DROP COLUMN "role",
ADD COLUMN     "company" TEXT,
ADD COLUMN     "tenantId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "password" SET DATA TYPE TEXT,
ALTER COLUMN "sector" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "type",
ADD COLUMN     "type" "ClientType" NOT NULL DEFAULT 'PARTICULIER',
ALTER COLUMN "updatedAt" SET NOT NULL,
ADD CONSTRAINT "Client_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Client_id_seq";

-- AlterTable
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_pkey",
DROP COLUMN "clientId",
ADD COLUMN     "niveau" "NiveauType" NOT NULL DEFAULT 'DEBUTANT',
ADD COLUMN     "region" TEXT,
ADD COLUMN     "secteur" TEXT,
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "type" "ContactType" NOT NULL DEFAULT 'PARTICULIER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "Contact_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Contact_id_seq";

-- AlterTable
ALTER TABLE "ContactSegment" DROP CONSTRAINT "ContactSegment_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "contactId" SET NOT NULL,
ALTER COLUMN "contactId" SET DATA TYPE TEXT,
ALTER COLUMN "segmentId" SET NOT NULL,
ALTER COLUMN "segmentId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ContactSegment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ContactSegment_id_seq";

-- AlterTable
ALTER TABLE "Inscription" DROP CONSTRAINT "Inscription_pkey",
DROP COLUMN "entreprise",
DROP COLUMN "notes",
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "InscriptionStatus" NOT NULL DEFAULT 'EN_ATTENTE',
ALTER COLUMN "campagneId" SET NOT NULL,
ALTER COLUMN "campagneId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "formule" DROP NOT NULL,
ALTER COLUMN "formule" DROP DEFAULT,
ALTER COLUMN "formule" SET DATA TYPE TEXT,
ALTER COLUMN "paymentType" DROP NOT NULL,
ALTER COLUMN "paymentType" DROP DEFAULT,
ALTER COLUMN "paymentType" SET DATA TYPE TEXT,
ALTER COLUMN "clientId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Inscription_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Inscription_id_seq";

-- AlterTable
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_pkey",
DROP COLUMN "clientId",
DROP COLUMN "metadata",
DROP COLUMN "segmentId",
DROP COLUMN "status",
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "title" SET DATA TYPE TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'RAPPEL',
DROP COLUMN "canal",
ADD COLUMN     "canal" "NotificationCanal" NOT NULL DEFAULT 'EMAIL',
ALTER COLUMN "campagneId" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "sentAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "Notification_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Notification_id_seq";

-- AlterTable
ALTER TABLE "Paiement" DROP CONSTRAINT "Paiement_pkey",
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "tenantId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "inscriptionId" SET DATA TYPE TEXT,
ALTER COLUMN "montant" SET NOT NULL,
DROP COLUMN "mode",
ADD COLUMN     "mode" "PaymentMode" NOT NULL DEFAULT 'CARTE',
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'EN_ATTENTE',
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "reference" SET DATA TYPE TEXT,
ADD CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Paiement_id_seq";

-- AlterTable
ALTER TABLE "PushSubscription" DROP CONSTRAINT "PushSubscription_pkey",
ADD COLUMN     "tenantId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PushSubscription_id_seq";

-- AlterTable
ALTER TABLE "Segment" DROP CONSTRAINT "Segment_pkey",
DROP COLUMN "clientId",
ADD COLUMN     "tenantId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "criteria" DROP NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "Segment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Segment_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "clientId",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "tenantId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "password" SET DATA TYPE TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "updatedAt" SET NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "CampagneStats";

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan" "PlanType" NOT NULL DEFAULT 'FREE',
    "domain" TEXT,
    "subdomain" TEXT,
    "settings" JSONB DEFAULT '{}',
    "maxUsers" INTEGER NOT NULL DEFAULT 5,
    "maxCampagnes" INTEGER NOT NULL DEFAULT 10,
    "maxInscriptions" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT,
    "campagneId" TEXT NOT NULL,
    "userId" TEXT,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY['read']::TEXT[],
    "lastUsed" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_domain_key" ON "Tenant"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_subdomain_key" ON "Tenant"("subdomain");

-- CreateIndex
CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateIndex
CREATE INDEX "Tenant_plan_idx" ON "Tenant"("plan");

-- CreateIndex
CREATE INDEX "Feedback_tenantId_idx" ON "Feedback"("tenantId");

-- CreateIndex
CREATE INDEX "Feedback_tenantId_campagneId_idx" ON "Feedback"("tenantId", "campagneId");

-- CreateIndex
CREATE INDEX "Feedback_tenantId_rating_idx" ON "Feedback"("tenantId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_tenantId_idx" ON "ApiKey"("tenantId");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "Alerte_tenantId_idx" ON "Alerte"("tenantId");

-- CreateIndex
CREATE INDEX "Alerte_tenantId_status_idx" ON "Alerte"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Alerte_tenantId_severity_idx" ON "Alerte"("tenantId", "severity");

-- CreateIndex
CREATE INDEX "Campagne_tenantId_idx" ON "Campagne"("tenantId");

-- CreateIndex
CREATE INDEX "Campagne_tenantId_status_idx" ON "Campagne"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Campagne_tenantId_type_idx" ON "Campagne"("tenantId", "type");

-- CreateIndex
CREATE INDEX "Campagne_tenantId_published_idx" ON "Campagne"("tenantId", "published");

-- CreateIndex
CREATE UNIQUE INDEX "Campagne_tenantId_slug_key" ON "Campagne"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "Client_tenantId_idx" ON "Client"("tenantId");

-- CreateIndex
CREATE INDEX "Client_tenantId_type_idx" ON "Client"("tenantId", "type");

-- CreateIndex
CREATE INDEX "Client_tenantId_status_idx" ON "Client"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Client_tenantId_email_key" ON "Client"("tenantId", "email");

-- CreateIndex
CREATE INDEX "Contact_tenantId_idx" ON "Contact"("tenantId");

-- CreateIndex
CREATE INDEX "Contact_tenantId_niveau_idx" ON "Contact"("tenantId", "niveau");

-- CreateIndex
CREATE INDEX "Contact_tenantId_type_idx" ON "Contact"("tenantId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_tenantId_email_key" ON "Contact"("tenantId", "email");

-- CreateIndex
CREATE INDEX "ContactSegment_segmentId_idx" ON "ContactSegment"("segmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactSegment_contactId_segmentId_key" ON "ContactSegment"("contactId", "segmentId");

-- CreateIndex
CREATE INDEX "Inscription_tenantId_idx" ON "Inscription"("tenantId");

-- CreateIndex
CREATE INDEX "Inscription_tenantId_status_idx" ON "Inscription"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Inscription_campagneId_idx" ON "Inscription"("campagneId");

-- CreateIndex
CREATE INDEX "Inscription_userId_idx" ON "Inscription"("userId");

-- CreateIndex
CREATE INDEX "Inscription_clientId_idx" ON "Inscription"("clientId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_idx" ON "Notification"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_userId_idx" ON "Notification"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_isRead_idx" ON "Notification"("tenantId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_reference_key" ON "Paiement"("reference");

-- CreateIndex
CREATE INDEX "Paiement_tenantId_idx" ON "Paiement"("tenantId");

-- CreateIndex
CREATE INDEX "Paiement_tenantId_status_idx" ON "Paiement"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Paiement_inscriptionId_idx" ON "Paiement"("inscriptionId");

-- CreateIndex
CREATE INDEX "PushSubscription_tenantId_idx" ON "PushSubscription"("tenantId");

-- CreateIndex
CREATE INDEX "PushSubscription_tenantId_userId_idx" ON "PushSubscription"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_tenantId_endpoint_key" ON "PushSubscription"("tenantId", "endpoint");

-- CreateIndex
CREATE INDEX "Segment_tenantId_idx" ON "Segment"("tenantId");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "User_tenantId_role_idx" ON "User"("tenantId", "role");

-- CreateIndex
CREATE INDEX "User_tenantId_status_idx" ON "User"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campagne" ADD CONSTRAINT "Campagne_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_campagneId_fkey" FOREIGN KEY ("campagneId") REFERENCES "Campagne"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_campagneId_fkey" FOREIGN KEY ("campagneId") REFERENCES "Campagne"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_campagneId_fkey" FOREIGN KEY ("campagneId") REFERENCES "Campagne"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactSegment" ADD CONSTRAINT "ContactSegment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactSegment" ADD CONSTRAINT "ContactSegment_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerte" ADD CONSTRAINT "Alerte_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
