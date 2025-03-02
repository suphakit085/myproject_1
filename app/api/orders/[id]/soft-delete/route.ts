// app/api/orders/[id]/soft-delete/route.ts
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

    // อัปเดตสถานะ isDeleted เป็น true แทนการลบจริง
    await prisma.orders.update({
      where: {
        orderID: orderId,
      },
      data: {
        isDeleted: true,
      },
    });

    return NextResponse.json({ message: 'Order archived successfully' }, { status: 200 });
  } catch (error) {
    console.error("Failed to archive order:", error);
    return NextResponse.json({ error: 'Failed to archive order' }, { status: 500 });
  }
}