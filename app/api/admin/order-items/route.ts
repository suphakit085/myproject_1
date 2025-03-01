// app/api/admin/order-items/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // ดึงข้อมูลรายการอาหารทั้งหมด พร้อมข้อมูลที่เกี่ยวข้อง
    const orderItems = await prisma.orderItem.findMany({
      include: {
        menuItem: true,
        order: {
          include: {
            table: true,
          },
        },
      },
      orderBy: [
        // เรียงตามสถานะ (PENDING -> COOKING -> SERVED -> CANCELLED)
        {
          menuStatus: 'asc',
        },
        // เรียงตามเวลาที่สร้าง (เก่าไปใหม่)
        {
          createdAt: 'asc',
        },
      ],
    });

    return NextResponse.json(orderItems, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching admin order items:", error);
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