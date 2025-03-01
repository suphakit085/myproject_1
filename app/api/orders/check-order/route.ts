// /app/api/orders/check-order/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const buffetTypeID = searchParams.get('buffetTypeID');

  if (!buffetTypeID) {
    return NextResponse.json({ error: 'Buffet type ID is required' }, { status: 400 });
  }

  const order = await prisma.orders.findFirst({
    where: {
      BuffetTypes_buffetTypeID: parseInt(buffetTypeID, 10),
      orderStatus: 'PENDING', // เงื่อนไขของออเดอร์ที่กำลังรอดำเนินการ
    },
  });

  if (order) {
    return NextResponse.json({ orderExists: true });
  }

  return NextResponse.json({ orderExists: false });
}
