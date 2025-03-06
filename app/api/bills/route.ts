// app/api/bills/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log('Received bill payload:', body);

    const {
      vat,
      paymentStatus,
      netAmount,
      grandTotal,
      discount,
      totalAmount,
      billStatus,
      Orders_orderID,
      payment,
    } = body;

    // Validate required fields
    if (!Orders_orderID || isNaN(Number(Orders_orderID))) {
      return NextResponse.json(
        { error: 'Order ID is required and must be a valid number' }, 
        { status: 400 }
      );
    }

    // Further validation similar to your previous implementation...

    // Perform transaction
    const bill = await prisma.$transaction(async (tx) => {
      const createdBill = await tx.bill.create({
        data: {
          vat,
          paymentStatus,
          netAmount,
          grandTotal,
          discount,
          totalAmount,
          billStatus,
          Orders_orderID: Number(Orders_orderID),
          payment: {
            create: {
              paymentTypes: payment.paymentTypes,
              totalAmount: payment.totalAmount,
            },
          },
        },
        include: { payment: true },
      });

      await tx.orders.update({
        where: { orderID: Number(Orders_orderID) },
        data: { orderStatus: 'COMPLETED' },
      });

      return createdBill;
    });

    console.log('Bill created:', bill);
    return NextResponse.json(bill, { status: 201 });

  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create bill', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.stack : undefined) : undefined,
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bills = await prisma.bill.findMany({
      include: { order: true, payment: true },
    });
    return NextResponse.json(bills, { status: 200 });
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' }, 
      { status: 500 }
    );
  }
}