/*
  Warnings:

  - A unique constraint covering the columns `[CustomerEmail]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `CustomerEmail` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resName` to the `Reservations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `orderItem_MenuItems_menuItemsID_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `orderItem_Orders_orderID_fkey`;

-- DropIndex
DROP INDEX `orderItem_MenuItems_menuItemsID_fkey` ON `orderitem`;

-- AlterTable
ALTER TABLE `bill` MODIFY `billCreateAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `customer` ADD COLUMN `CustomerEmail` VARCHAR(191) NOT NULL,
    ADD COLUMN `password` VARCHAR(191) NOT NULL,
    MODIFY `cusCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `menuitems` MODIFY `menuItemCreateAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `orders` MODIFY `orderCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `reservations` ADD COLUMN `resName` VARCHAR(191) NOT NULL,
    MODIFY `resCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `stock` MODIFY `LastUpdated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `stock_in` MODIFY `stockInDateTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `tables` MODIFY `tabCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE `timescription` MODIFY `tsCreatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `Customer_CustomerEmail_key` ON `Customer`(`CustomerEmail`);

-- AddForeignKey
ALTER TABLE `orderItem` ADD CONSTRAINT `orderItem_Orders_orderID_fkey` FOREIGN KEY (`Orders_orderID`) REFERENCES `Orders`(`orderID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderItem` ADD CONSTRAINT `orderItem_MenuItems_menuItemsID_fkey` FOREIGN KEY (`MenuItems_menuItemsID`) REFERENCES `MenuItems`(`menuItemsID`) ON DELETE RESTRICT ON UPDATE CASCADE;
