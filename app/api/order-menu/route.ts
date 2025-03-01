// app/api/order-menu/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderID, items } = body;

    if (!orderID || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "รูปแบบข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า order มีอยู่จริง
    const order = await prisma.orders.findUnique({
      where: { orderID },
    });

    if (!order) {
      return NextResponse.json(
        { message: "ไม่พบออเดอร์นี้ในระบบ" },
        { status: 404 }
      );
    }

    // บันทึกรายการอาหารทั้งหมด
    const createdItems = await Promise.all(
      items.map(async (item: { menuItemsID: number; quantity: number }) => {
        return prisma.orderItem.create({
          data: {
            Orders_orderID: orderID,
            MenuItems_menuItemsID: item.menuItemsID,
            Quantity: item.quantity,
            menuStatus: "PENDING", // สถานะเริ่มต้น
          },
          include: {
            menuItem: true,
          },
        });
      })
    );

    return NextResponse.json(
      { 
        message: "บันทึกรายการอาหารเรียบร้อยแล้ว",
        items: createdItems
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating order items:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "เกิดข้อผิดพลาดในการบันทึกรายการอาหาร", error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการบันทึกรายการอาหาร" },
      { status: 500 }
    );
  }
}

// API ดึงข้อมูลรายการอาหารตาม orderID
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orderID = url.searchParams.get("orderID");

    if (!orderID) {
      return NextResponse.json(
        { message: "กรุณาระบุรหัสออเดอร์" },
        { status: 400 }
      );
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        Orders_orderID: parseInt(orderID),
      },
      include: {
        menuItem: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orderItems, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching order items:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการอาหาร", error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการอาหาร" },
      { status: 500 }
    );
  }
}