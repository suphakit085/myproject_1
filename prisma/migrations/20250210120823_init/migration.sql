/*
  Warnings:

  - Added the required column `BuffetTypes_buffetTypeID` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `BuffetTypes_buffetTypeID` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `tables` MODIFY `tabCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_BuffetTypes_buffetTypeID_fkey` FOREIGN KEY (`BuffetTypes_buffetTypeID`) REFERENCES `BuffetTypes`(`buffetTypeID`) ON DELETE RESTRICT ON UPDATE CASCADE;
