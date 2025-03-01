import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  id: string;
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    // ใช้ await เพื่อให้ได้ค่าจาก params
    const orderId = parseInt(params.id, 10); // เพิ่ม await ที่นี่

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 });
    }

    const body = await req.json();
    const { orderStatus } = body;

    if (!['COMPLETED', 'CANCELLED'].includes(orderStatus)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    // หา Order ที่ต้องการอัปเดต
    const orderToUpdate = await prisma.orders.findUnique({
      where: {
        orderID: orderId,
      },
    });

    if (!orderToUpdate) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const tableId = orderToUpdate.Tables_tabID;

    // อัปเดตสถานะ Order และ อัปเดตสถานะ table
    const updatedOrder = await prisma.$transaction(async (prisma) => {
      const order = await prisma.orders.update({
        where: {
          orderID: orderId,
        },
        data: {
          orderStatus: orderStatus,
        },
      });

      // ถ้า order status เป็น COMPLETED หรือ CANCELLED ให้อัปเดต tabStatus ของ table ให้เป็น available
      if (orderStatus === 'COMPLETED' || orderStatus === 'CANCELLED') {
        await prisma.tables.update({
          where: {
            tabID: tableId,
          },
          data: {
            tabStatus: 'available', // ใช้ tabStatus แทน status
          },
        });
      }

      return order;
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
