// app/api/orders/reserved-tables/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // ดึงข้อมูล Table ID จาก Orders ที่มี orderStatus ไม่เป็น COMPLETED หรือ CANCELLED
    const reservedTables = await prisma.orders.findMany({
      where: {
        NOT: {
          orderStatus: {
            in: ['COMPLETED', 'CANCELLED'],
          },
        },
      },
      select: {
        Tables_tabID: true,
      },
    });

    // สร้าง array ของ Table ID ที่ถูกจอง
    const reservedTableIds = reservedTables.map((order) => order.Tables_tabID);

    return NextResponse.json(reservedTableIds);
  } catch (error) {
    console.error("Failed to fetch reserved table IDs:", error);
    return NextResponse.json({ error: 'Failed to fetch reserved table IDs' }, { status: 500 });
  }
}