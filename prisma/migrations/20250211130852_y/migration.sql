/*
  Warnings:

  - Added the required column `menuItem` to the `orderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `orderItem_MenuItems_menuItemsID_fkey`;

-- DropIndex
DROP INDEX `orderItem_MenuItems_menuItemsID_fkey` ON `orderitem`;

-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `menuItem` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `tables` MODIFY `tabCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
