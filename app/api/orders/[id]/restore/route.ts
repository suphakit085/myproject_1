// app/api/orders/[id]/restore/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  id: string;
}

export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const orderId = parseInt(params.id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 });
    }

    // คืนค่าสถานะ isDeleted เป็น false เพื่อกู้คืนรายการ
    await prisma.orders.update({
      where: {
        orderID: orderId,
      },
      data: {
        isDeleted: false,
      },
    });

    return NextResponse.json({ message: 'Order restored successfully' }, { status: 200 });
  } catch (error) {
    console.error("Failed to restore order:", error);
    return NextResponse.json({ error: 'Failed to restore order' }, { status: 500 });
  }
}