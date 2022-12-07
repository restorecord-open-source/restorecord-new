/*
  Warnings:

  - You are about to drop the column `ip` on the `blacklist` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `blacklist` table. All the data in the column will be lost.
  - Added the required column `type` to the `blacklist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `blacklist` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `blacklist_ip_key` ON `blacklist`;

-- AlterTable
ALTER TABLE `blacklist` DROP COLUMN `ip`,
    DROP COLUMN `userId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `reason` VARCHAR(999) NULL,
    ADD COLUMN `type` INTEGER NOT NULL,
    ADD COLUMN `value` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `servers` ADD COLUMN `themeColor` VARCHAR(191) NOT NULL DEFAULT '4f46e5';
