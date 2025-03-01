// app/api/order-menu/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { menuStatus } = body;

    if (!id || !menuStatus) {
      return NextResponse.json(
        { message: "รูปแบบข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า status ที่ส่งมาถูกต้อง
    const validStatuses = ["PENDING", "COOKING", "SERVED", "CANCELLED"];
    if (!validStatuses.includes(menuStatus)) {
      return NextResponse.json(
        { message: "สถานะไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // อัปเดตสถานะของรายการอาหาร
    const updatedOrderItem = await prisma.orderItem.update({
      where: { id },
      data: { menuStatus },
      include: {
        menuItem: true,
      },
    });

    return NextResponse.json(updatedOrderItem, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating order item:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "เกิดข้อผิดพลาดในการอัปเดตรายการอาหาร", error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการอัปเดตรายการอาหาร" },
      { status: 500 }
    );
  }
}