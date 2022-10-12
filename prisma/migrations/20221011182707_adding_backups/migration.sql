/*
  Warnings:

  - You are about to drop the column `serverId` on the `backups` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,guildId]` on the table `guildMembers` will be added. If there are existing duplicate values, this will fail.
  - Made the column `roleId` on table `channelPermissions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `backups` DROP FOREIGN KEY `backups_serverId_fkey`;

-- AlterTable
ALTER TABLE `backups` DROP COLUMN `serverId`;

-- AlterTable
ALTER TABLE `channelPermissions` MODIFY `roleId` BIGINT UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `roles` ADD COLUMN `botId` BIGINT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `guildMembers_userId_guildId_key` ON `guildMembers`(`userId`, `guildId`);

-- AddForeignKey
ALTER TABLE `backups` ADD CONSTRAINT `backups_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `servers`(`guildId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guildMembers` ADD CONSTRAINT `guildMembers_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `servers`(`guildId`) ON DELETE RESTRICT ON UPDATE CASCADE;
