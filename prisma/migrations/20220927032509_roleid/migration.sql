/*
  Warnings:

  - You are about to drop the column `permissions` on the `channels` table. All the data in the column will be lost.
  - You are about to alter the column `type` on the `channels` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - A unique constraint covering the columns `[roleId]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roleId` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `channels` DROP COLUMN `permissions`,
    MODIFY `type` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `roles` ADD COLUMN `roleId` BIGINT UNSIGNED NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `roles_roleId_key` ON `roles`(`roleId`);
