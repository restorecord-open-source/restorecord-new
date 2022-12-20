-- CreateTable
CREATE TABLE `giveaways` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NOT NULL,
    `discordId` BIGINT UNSIGNED NULL,
    `email` TEXT NULL,
    `winWhat` TEXT NULL,
    `whyWin` TEXT NULL,
    `howDidYouFindUs` TEXT NULL,
    `whatDoYouLike` TEXT NULL,
    `ip` VARCHAR(191) NULL,
    `tracking` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `giveaways` ADD CONSTRAINT `giveaways_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
