/*
  Warnings:

  - The primary key for the `orderitem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `orderItemId` to the `orderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Step 1: เพิ่ม id เป็น nullable ชั่วคราว
-- Step 1: Drop foreign key constraints
ALTER TABLE `orderItem` DROP FOREIGN KEY `orderItem_Orders_orderID_fkey`;
ALTER TABLE `orderItem` DROP FOREIGN KEY `orderItem_MenuItems_menuItemsID_fkey`;

-- Step 2: เพิ่ม id เป็น nullable ชั่วคราว (เพื่อไม่ให้ขัดแย้งกับข้อมูลที่มีอยู่)
ALTER TABLE `orderItem` ADD COLUMN `id` VARCHAR(191) NULL;

-- Step 3: อัปเดตข้อมูลที่มีอยู่ให้มีค่า UUID
UPDATE `orderItem` SET `id` = UUID() WHERE `id` IS NULL;

-- Step 4: เปลี่ยน id เป็น NOT NULL และตั้งเป็น primary key
ALTER TABLE `orderItem` 
    DROP PRIMARY KEY, -- Drop composite key เดิม (ถ้ามี)
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- Step 5: เพิ่ม foreign key constraints กลับ
ALTER TABLE `orderItem` 
    ADD CONSTRAINT `orderItem_Orders_orderID_fkey` 
        FOREIGN KEY (`Orders_orderID`) REFERENCES `Orders`(`orderID`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `orderItem_MenuItems_menuItemsID_fkey` 
        FOREIGN KEY (`MenuItems_menuItemsID`) REFERENCES `MenuItems`(`menuItemsID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: อัปเดตตาราง Orders และ Tables
ALTER TABLE `orders` MODIFY `qrCode` TEXT NULL;

ALTER TABLE `tables` MODIFY `tabCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);