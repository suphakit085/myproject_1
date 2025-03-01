import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderID, buffetTypeID, items } = body;

    if (!orderID || !buffetTypeID || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Invalid order data" }, { status: 400 });
    }

    // ตรวจสอบว่า Order มีอยู่จริง
    const orderExists = await prisma.orders.findUnique({
      where: { orderID },
    });
    if (!orderExists) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // ตรวจสอบว่า BuffetTypes มีอยู่จริง
    const buffetTypeExists = await prisma.buffetTypes.findUnique({
      where: { buffetTypeID: buffetTypeID },
    });
    if (!buffetTypeExists) {
      return NextResponse.json({ message: "Buffet type not found" }, { status: 404 });
    }

    // ตรวจสอบว่า MenuItems มีอยู่จริง
    const menuItemIds = items.map((item: { menuItemsID: number }) => item.menuItemsID);
    const menuItems = await prisma.menuItems.findMany({
      where: { menuItemsID: { in: menuItemIds } },
    });
    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json({ message: "One or more menu items not found" }, { status: 404 });
    }

    // สร้าง OrderItem
    const orderItems = await prisma.orderItem.createMany({
      data: items.map((item: { menuItemsID: number; quantity: number }) => ({
        menuItemsID: item.menuItemsID,
        quantity: item.quantity,
        orderID,
      })),
    });

    return NextResponse.json({ message: "Order submitted successfully", orderItems }, { status: 201 });
  } catch (error) {
    console.error("Error submitting order:", error);
    return NextResponse.json({ message: "Failed to submit order" }, { status: 500 });
  }
}