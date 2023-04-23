/*
  Warnings:

  - Added the required column `severity` to the `news` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `accounts` MODIFY `twoFactor` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `news` ADD COLUMN `severity` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `servers` ADD COLUMN `ipLogging` BOOLEAN NOT NULL DEFAULT true;
