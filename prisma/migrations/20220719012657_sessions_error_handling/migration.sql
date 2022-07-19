-- AlterTable
ALTER TABLE `accounts` MODIFY `pfp` VARCHAR(191) NOT NULL DEFAULT 'https://cdn.restorecord.com/logo512.png';

-- CreateTable
CREATE TABLE `sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(999) NOT NULL,
    `accountId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;