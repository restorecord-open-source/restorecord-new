-- CreateTable
CREATE TABLE `blacklist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip` VARCHAR(191) NULL,
    `userId` BIGINT UNSIGNED NULL,
    `guildId` BIGINT UNSIGNED NOT NULL,

    UNIQUE INDEX `blacklist_ip_key`(`ip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blacklist` ADD CONSTRAINT `blacklist_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `servers`(`guildId`) ON DELETE RESTRICT ON UPDATE CASCADE;
