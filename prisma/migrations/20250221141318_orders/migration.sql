-- AlterTable
ALTER TABLE `orders` ADD COLUMN `qrCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `tables` MODIFY `tabCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
