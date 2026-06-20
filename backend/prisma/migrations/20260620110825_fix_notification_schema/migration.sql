/*
  Warnings:

  - The values [PROMOTION,NOUVELLE_CAMPAGNE,ALERTE,CONFIRMATION,FACTURE] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `canal` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `auth` on the `PushSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `endpoint` on the `PushSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `p256dh` on the `PushSubscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,token]` on the table `PushSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `PushSubscription` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'RETRYING');

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('CAMPAGNE_NOUVELLE', 'CAMPAGNE_PROMO', 'EVENEMENT', 'INSCRIPTION_CONFIRMATION', 'PAIEMENT_RECU', 'PAIEMENT_ECHEC', 'CERTIFICAT_DISPONIBLE', 'RAPPEL', 'SYSTEM');
ALTER TABLE "Notification" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "PushSubscription" DROP CONSTRAINT "PushSubscription_tenantId_fkey";

-- DropIndex
DROP INDEX "Notification_tenantId_idx";

-- DropIndex
DROP INDEX "Notification_tenantId_isRead_idx";

-- DropIndex
DROP INDEX "Notification_tenantId_userId_idx";

-- DropIndex
DROP INDEX "PushSubscription_tenantId_endpoint_key";

-- DropIndex
DROP INDEX "PushSubscription_tenantId_userId_idx";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "canal",
DROP COLUMN "isRead",
DROP COLUMN "sentAt",
ADD COLUMN     "data" JSONB,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PushSubscription" DROP COLUMN "auth",
DROP COLUMN "endpoint",
DROP COLUMN "p256dh",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "token" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable
CREATE TABLE "NotificationRecipient" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channels" "ChannelType"[],

    CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDelivery" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "channel" "ChannelType" NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "campagneNouvelle" BOOLEAN NOT NULL DEFAULT true,
    "campagnePromo" BOOLEAN NOT NULL DEFAULT true,
    "evenement" BOOLEAN NOT NULL DEFAULT true,
    "inscription" BOOLEAN NOT NULL DEFAULT true,
    "paiement" BOOLEAN NOT NULL DEFAULT true,
    "certificat" BOOLEAN NOT NULL DEFAULT true,
    "rappel" BOOLEAN NOT NULL DEFAULT true,
    "system" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" INTEGER,
    "quietHoursEnd" INTEGER,

    CONSTRAINT "UserNotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationRecipient_userId_idx" ON "NotificationRecipient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRecipient_notificationId_userId_key" ON "NotificationRecipient"("notificationId", "userId");

-- CreateIndex
CREATE INDEX "NotificationDelivery_notificationId_recipientId_idx" ON "NotificationDelivery"("notificationId", "recipientId");

-- CreateIndex
CREATE INDEX "NotificationDelivery_status_idx" ON "NotificationDelivery"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationPreference_userId_key" ON "UserNotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "UserNotificationPreference_tenantId_idx" ON "UserNotificationPreference"("tenantId");

-- CreateIndex
CREATE INDEX "Notification_tenantId_type_idx" ON "Notification"("tenantId", "type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_campagneId_idx" ON "Notification"("campagneId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_userId_token_key" ON "PushSubscription"("userId", "token");

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotificationPreference" ADD CONSTRAINT "UserNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotificationPreference" ADD CONSTRAINT "UserNotificationPreference_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
