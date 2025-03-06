// app/api/bills/[billId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { billId: string } }) {
  try {
    const billId = params.billId;

    if (!billId) {
      return NextResponse.json({ error: 'Invalid bill ID' }, { status: 400 });
    }

    const billIdNum = parseInt(billId, 10);

    if (isNaN(billIdNum)) {
      return NextResponse.json({ error: 'Bill ID must be a number' }, { status: 400 });
    }

    const bill = await prisma.bill.findUnique({
      where: { billID: billIdNum },
      include: {
        payment: true,
        order: {
          include: {
            buffetType: true,
            table: true,
            employee: true,
            orderItems: { include: { menuItem: true } },
          },
        },
      },
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json(bill, { status: 200 });
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch bill',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}