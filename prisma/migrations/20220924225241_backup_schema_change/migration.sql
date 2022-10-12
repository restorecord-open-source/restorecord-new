/*
  Warnings:

  - Added the required column `iconURL` to the `backups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guildId` to the `guildMembers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `backups` ADD COLUMN `iconURL` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `guildMembers` ADD COLUMN `guildId` BIGINT UNSIGNED NOT NULL;
