/*
  Warnings:

  - You are about to drop the column `ownerId` on the `emails` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `emails` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `emails` DROP FOREIGN KEY `emails_ownerId_fkey`;

-- AlterTable
ALTER TABLE `emails` DROP COLUMN `ownerId`,
    ADD COLUMN `accountId` INTEGER NOT NULL,
    ADD COLUMN `used` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `emails` ADD CONSTRAINT `emails_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
