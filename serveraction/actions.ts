// app/actions.ts
'use server';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getMenuItems() {
  try {
    const menuItems = await prisma.menuItems.findMany();
    return menuItems;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw new Error("Failed to fetch menu items");
  } finally {
    await prisma.$disconnect();
  }
}