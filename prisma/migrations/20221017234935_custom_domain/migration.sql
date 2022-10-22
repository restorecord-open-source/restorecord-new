/*
  Warnings:

  - You are about to drop the column `customDomain` on the `servers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `customBots` ADD COLUMN `customDomain` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `servers` DROP COLUMN `customDomain`;
