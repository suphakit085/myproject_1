// app/api/bills/order/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const orderId = params.orderId;

    if (!orderId) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const orderIdNum = parseInt(orderId, 10);

    if (isNaN(orderIdNum)) {
      return NextResponse.json({ error: 'Order ID must be a number' }, { status: 400 });
    }

    const bill = await prisma.bill.findUnique({
      where: { Orders_orderID: orderIdNum },
      include: {
        payment: true,
        order: {
          include: {
            buffetType: true,
            table: true,
            employee: true,
          },
        },
      },
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found for this order' }, { status: 404 });
    }

    return NextResponse.json(bill, { status: 200 });
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json({ error: 'Failed to fetch bill' }, { status: 500 });
  }
}