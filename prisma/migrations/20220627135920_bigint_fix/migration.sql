/*
  Warnings:

  - You are about to alter the column `userId` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `UnsignedBigInt`.
  - You are about to alter the column `clientId` on the `custombots` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `UnsignedBigInt`.
  - You are about to alter the column `userId` on the `members` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `UnsignedBigInt`.
  - You are about to alter the column `guildId` on the `members` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `UnsignedBigInt`.
  - You are about to alter the column `guildId` on the `servers` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `UnsignedBigInt`.
  - You are about to alter the column `roleId` on the `servers` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `UnsignedBigInt`.

*/
-- DropForeignKey
ALTER TABLE `members` DROP FOREIGN KEY `members_guildId_fkey`;

-- AlterTable
ALTER TABLE `accounts` MODIFY `userId` BIGINT UNSIGNED NULL;

-- AlterTable
ALTER TABLE `custombots` MODIFY `clientId` BIGINT UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `members` MODIFY `userId` BIGINT UNSIGNED NOT NULL,
    MODIFY `guildId` BIGINT UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `servers` MODIFY `guildId` BIGINT UNSIGNED NOT NULL,
    MODIFY `roleId` BIGINT UNSIGNED NOT NULL;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `servers`(`guildId`) ON DELETE RESTRICT ON UPDATE CASCADE;
