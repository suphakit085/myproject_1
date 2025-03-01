/*
  Warnings:

  - A unique constraint covering the columns `[orderItemId]` on the table `Orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderItemId` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `orderItem_MenuItems_menuItemsID_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `orderItem_Orders_orderID_fkey`;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `orderItemId` VARCHAR(191) NOT NULL,
    MODIFY `qrCode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Orders_orderItemId_key` ON `Orders`(`orderItemId`);

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_Orders_orderID_fkey` FOREIGN KEY (`Orders_orderID`) REFERENCES `Orders`(`orderID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_MenuItems_menuItemsID_fkey` FOREIGN KEY (`MenuItems_menuItemsID`) REFERENCES `MenuItems`(`menuItemsID`) ON DELETE RESTRICT ON UPDATE CASCADE;
