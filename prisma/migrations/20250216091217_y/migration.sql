-- AlterTable
ALTER TABLE `tables` MODIFY `tabCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE `orderItem` ADD CONSTRAINT `orderItem_Orders_orderID_fkey` FOREIGN KEY (`Orders_orderID`) REFERENCES `Orders`(`orderID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderItem` ADD CONSTRAINT `orderItem_MenuItems_menuItemsID_fkey` FOREIGN KEY (`MenuItems_menuItemsID`) REFERENCES `MenuItems`(`menuItemsID`) ON DELETE RESTRICT ON UPDATE CASCADE;
