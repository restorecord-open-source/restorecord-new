/*
  Warnings:

  - You are about to drop the `giveaways` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[referralCode]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `giveaways` DROP FOREIGN KEY `giveaways_accountId_fkey`;

-- AlterTable
ALTER TABLE `accounts` ADD COLUMN `referralCode` VARCHAR(191) NULL,
    ADD COLUMN `referrer` INTEGER NULL;

-- DropTable
DROP TABLE `giveaways`;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `subscriptionId` VARCHAR(999) NOT NULL,
    `payment_status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payments_subscriptionId_key`(`subscriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `accounts_referralCode_key` ON `accounts`(`referralCode`);

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
