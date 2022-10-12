/*
  Warnings:

  - You are about to drop the column `flags` on the `channels` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `channels` DROP COLUMN `flags`,
    ADD COLUMN `bitrate` INTEGER NULL,
    ADD COLUMN `userLimit` INTEGER NULL;
