-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
