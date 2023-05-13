/*
  Warnings:

  - You are about to drop the column `body` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `logs` table. All the data in the column will be lost.
  - Added the required column `device` to the `logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ipAddr` to the `logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `logs` DROP COLUMN `body`,
    DROP COLUMN `title`,
    ADD COLUMN `device` LONGTEXT NOT NULL,
    ADD COLUMN `ipAddr` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` INTEGER NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;
