/*
  Warnings:

  - A unique constraint covering the columns `[guildId]` on the table `backups` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `backups_guildId_key` ON `backups`(`guildId`);
