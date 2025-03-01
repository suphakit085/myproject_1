/*
  Warnings:

  - You are about to drop the column `menuItem` on the `orderitem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `orderItem_Orders_orderID_fkey`;

-- AlterTable
ALTER TABLE `orderitem` DROP COLUMN `menuItem`;

-- AlterTable
ALTER TABLE `tables` MODIFY `tabCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
