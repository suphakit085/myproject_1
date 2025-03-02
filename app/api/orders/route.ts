// app/api/orders/route.ts
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

// ใช้ named export สำหรับ POST request
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    //  data ของคำสั่งประกอบด้วย tableID, employeeID, และ buffetTypeID
    const newOrder = await prisma.orders.create({
      data: {
        orderStatus: data.orderStatus,
        Tables_tabID: data.Tables_tabID,
        Employee_empID: data.Employee_empID,
        BuffetTypes_buffetTypeID: data.BuffetTypes_buffetTypeID,
      },
    });
    const orderUrl = `http://localhost:3000/user/menu/${newOrder.orderID}`;
    
    // สร้าง QR Code จาก URL ของออร์เดอร์
    const qrCode = await QRCode.toDataURL(orderUrl);
    
    return new Response(JSON.stringify({ newOrder, qrCode }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'ไม่สามารถสร้างคำสั่งได้' }), { status: 500 });
  }
}

// ใช้ named export สำหรับ GET request
export async function GET() {
  try {
    const orders = await prisma.orders.findMany({
      include: {
        employee: { 
          select: {
            empFname: true,
            empLname: true,
          },
        },
        table: { 
          select: {
            tabTypes: true, 
          },
        },
        buffetType: {
          select: {
            buffetTypeID: true,
            buffetTypesName: true, 
          },
        },
      },
      orderBy: {
        orderID: 'desc',
      }
    });
    
    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'ไม่สามารถดึงข้อมูลคำสั่งได้' }), { status: 500 });
  }
}
