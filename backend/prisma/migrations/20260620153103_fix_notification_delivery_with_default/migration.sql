/*
  Warnings:

  - You are about to drop the column `channel` on the `NotificationDelivery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NotificationDelivery" DROP COLUMN "channel",
ADD COLUMN     "channels" TEXT NOT NULL DEFAULT 'email';
