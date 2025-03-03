import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RequestParams {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RequestParams) {
  try {
    const { id } = params;
    let body;

    try {
      // ตรวจสอบว่า request body มีข้อมูลหรือไม่
      body = await request.json();
    } catch (error) {
      // ถ้าไม่มีข้อมูลหรือไม่ใช่ JSON ที่ถูกต้อง ใช้ค่าเริ่มต้น
      body = { isDeleted: true };
    }

    // ใช้ค่าจาก body หรือใช้ค่าเริ่มต้นถ้าเป็น null
    const isDeleted = body?.isDeleted ?? true;

    // ดึงข้อมูลเกี่ยวกับ table ID ที่เกี่ยวข้องกับออร์เดอร์นี้
    const order = await prisma.orders.findUnique({
      where: {
        orderID: parseInt(id),
      },
      select: {
        Tables_tabID: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // อัปเดตออร์เดอร์เพื่อทำการ soft delete
    const updatedOrder = await prisma.orders.update({
      where: {
        orderID: parseInt(id),
      },
      data: {
        isDeleted: isDeleted,
        // ตั้งค่าสถานะออร์เดอร์เป็น CANCELLED เมื่อทำการ soft delete
        orderStatus: isDeleted ? 'CANCELLED' : 'PENDING',
      },
    });

    // อัปเดตสถานะโต๊ะให้กลับมาว่างอีกครั้ง
    // ทำเฉพาะเมื่อมีการ soft-deleting (ไม่ใช่เมื่อมีการ restoring)
    if (isDeleted) {
      await prisma.tables.update({
        where: {
          tabID: order.Tables_tabID,
        },
        data: {
          tabStatus: 'AVAILABLE', // ตั้งค่าสถานะโต๊ะกลับเป็นว่าง
        },
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Failed to soft delete order:', error);
    return NextResponse.json(
      { error: 'Failed to process the request' },
      { status: 500 }
    );
  }
}