// app/api/orders/[id]/delete/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface Params {
  id: string;
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    const orderId = parseInt(await params.id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 });
    }

    // ลบ Order
    await prisma.orders.delete({
      where: {
        orderID: orderId,
      },
    });

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}