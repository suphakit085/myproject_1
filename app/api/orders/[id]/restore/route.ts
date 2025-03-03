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
      body = await request.json();
    } catch (error) {
      body = { isDeleted: false };
    }

    const isDeleted = body?.isDeleted ?? false;

    // ดึงข้อมูลออร์เดอร์เพื่อตรวจสอบโต๊ะ
    const order = await prisma.orders.findUnique({
      where: {
        orderID: parseInt(id),
      },
      select: {
        Tables_tabID: true,
        orderStatus: true, // เพิ่มการดึง orderStatus
        qrCode: true, // เพิ่มการดึง qrCode
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // เพิ่มเงื่อนไขการตรวจสอบสถานะก่อนคืนสถานะ
    if (order.orderStatus === 'COMPLETED' || order.orderStatus === 'CANCELLED') {
      return NextResponse.json(
        { 
          error: 'Cannot restore completed or cancelled order',
          message: 'ไม่สามารถกู้คืนออเดอร์ที่ปิดหรือยกเลิกแล้วได้'
        },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าโต๊ะว่างหรือไม่
    const table = await prisma.tables.findUnique({
      where: {
        tabID: order.Tables_tabID,
      },
    });

    if (!table || table.tabStatus !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Cannot restore order: table is not available' },
        { status: 400 }
      );
    }

    // อัปเดตสถานะโต๊ะ
    await prisma.tables.update({
      where: {
        tabID: order.Tables_tabID,
      },
      data: {
        tabStatus: 'RESERVED',
      },
    });

    // คืนสถานะออร์เดอร์
    const updatedOrder = await prisma.orders.update({
      where: {
        orderID: parseInt(id),
      },
      data: {
        isDeleted: isDeleted,
        orderStatus: 'PENDING', // รีเซ็ตสถานะเป็น pending เมื่อคืนสถานะ
        // เพิ่มการ generate QR code ใหม่หากต้องการ
        // qrCode: generateNewQRCode() // ฟังก์ชันสร้าง QR code ใหม่
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Failed to restore order:', error);
    return NextResponse.json(
      { error: 'Failed to process the request' },
      { status: 500 }
    );
  }
}