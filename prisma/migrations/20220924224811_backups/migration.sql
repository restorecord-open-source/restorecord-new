-- CreateTable
CREATE TABLE `backups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serverId` INTEGER NOT NULL,
    `serverName` VARCHAR(191) NOT NULL,
    `guildId` BIGINT UNSIGNED NOT NULL,
    `backupId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `backups_backupId_key`(`backupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `channels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `channelId` BIGINT UNSIGNED NOT NULL,
    `backupId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `flags` INTEGER NOT NULL,
    `parentId` BIGINT UNSIGNED NULL,
    `topic` VARCHAR(191) NULL,
    `rateLimitPerUser` INTEGER NULL,
    `nsfw` BOOLEAN NOT NULL,
    `permissions` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `channels_channelId_key`(`channelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `channelPermissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `channelId` BIGINT UNSIGNED NOT NULL,
    `roleId` BIGINT UNSIGNED NULL,
    `type` VARCHAR(191) NOT NULL,
    `allow` BIGINT NOT NULL,
    `deny` BIGINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `backupId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `hoist` BOOLEAN NOT NULL,
    `permissions` BIGINT NOT NULL,
    `mentionable` BOOLEAN NOT NULL,
    `position` INTEGER NOT NULL,
    `isEveryone` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guildMembers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `backupId` VARCHAR(191) NOT NULL,
    `userId` BIGINT UNSIGNED NOT NULL,
    `nickname` VARCHAR(191) NULL,
    `roles` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `backups` ADD CONSTRAINT `backups_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `channels` ADD CONSTRAINT `channels_backupId_fkey` FOREIGN KEY (`backupId`) REFERENCES `backups`(`backupId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `channelPermissions` ADD CONSTRAINT `channelPermissions_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `channels`(`channelId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_backupId_fkey` FOREIGN KEY (`backupId`) REFERENCES `backups`(`backupId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guildMembers` ADD CONSTRAINT `guildMembers_backupId_fkey` FOREIGN KEY (`backupId`) REFERENCES `backups`(`backupId`) ON DELETE RESTRICT ON UPDATE CASCADE;
