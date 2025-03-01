import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Orders, Tables, Employee, BuffetTypes } from "@prisma/client";

// ฟังก์ชันเพื่อตรวจสอบว่าสตริงเป็น UUID หรือไม่
function isUUID(str: string) {
  // รูปแบบ UUID: 8-4-4-4-12 characters (รวม hyphens)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
}

// ฟังก์ชันอีกแบบสำหรับตรวจสอบ UUID ที่ไม่มี hyphens
function isUUIDWithoutHyphens(str: string) {
  return /^[0-9a-f]{32}$/i.test(str);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    let order;
    const idTrimmed = id.toLowerCase().trim();
    
    // ตรวจสอบว่าเป็น UUID หรือไม่ (ควรเป็น orderItemId)
    if (isUUID(idTrimmed) || isUUIDWithoutHyphens(idTrimmed)) {
      console.log("Searching by orderItemId:", idTrimmed);
      order = await prisma.orders.findUnique({
        where: { orderItemId: idTrimmed },
        include: {
          table: true,
          employee: true,
          buffetType: true,
        },
      });
    } else {
      // ถ้าไม่ใช่ UUID ให้ลองค้นหาด้วย orderID (ควรเป็นตัวเลข)
      const orderId = parseInt(id, 10);
      if (!isNaN(orderId)) {
        console.log("Searching by orderID:", orderId);
        order = await prisma.orders.findUnique({
          where: { orderID: orderId },
          include: {
            table: true,
            employee: true,
            buffetType: true,
          },
        });
      } else {
        // ถ้าไม่ใช่ทั้ง UUID และไม่ใช่ตัวเลข ให้ลองค้นหาแบบคร่าวๆ
        console.log("Searching by partial orderItemId:", idTrimmed);
        order = await prisma.orders.findFirst({
          where: { orderItemId: { contains: idTrimmed } },
          include: {
            table: true,
            employee: true,
            buffetType: true,
          },
        });
      }
    }

    if (!order) {
      // ถ้าไม่พบ order ให้ลองค้นหาแบบไม่สนใจ case เพื่อ debug
      const possibleMatches = await prisma.orders.findMany({
        where: { orderItemId: { contains: id } },
      });
      console.log("Possible matches for orderItemId:", possibleMatches);

      // ตรวจสอบ Foreign Key
      const orderWithForeignKeys = await prisma.orders.findFirst({
        where: { orderItemId: { contains: id } },
      });
      if (orderWithForeignKeys) {
        const tableExists = await prisma.tables.findUnique({
          where: { tabID: orderWithForeignKeys.Tables_tabID },
        });
        const employeeExists = await prisma.employee.findUnique({
          where: { empID: orderWithForeignKeys.Employee_empID },
        });
        const buffetTypeExists = await prisma.buffetTypes.findUnique({
          where: { buffetTypeID: orderWithForeignKeys.BuffetTypes_buffetTypeID },
        });
        console.log("Foreign Key Check - Table Exists:", tableExists);
        console.log("Foreign Key Check - Employee Exists:", employeeExists);
        console.log("Foreign Key Check - BuffetType Exists:", buffetTypeExists);
      }

      return NextResponse.json({ message: "Order not found", orderItemId: id }, { status: 404 });
    }

    type OrderWithRelations = Orders & {
      table: Tables | null;
      employee: Employee | null;
      buffetType: BuffetTypes | null;
    };

    const orderWithRelations = order as OrderWithRelations;

    const orderDetails = {
      orderID: orderWithRelations.orderID,
      orderItemId: orderWithRelations.orderItemId,
      orderStatus: orderWithRelations.orderStatus || "PENDING",
      Tables_tabID: orderWithRelations.Tables_tabID,
      Employee_empID: orderWithRelations.Employee_empID,
      BuffetTypes_buffetTypeID: orderWithRelations.BuffetTypes_buffetTypeID,
      totalCustomerCount: orderWithRelations.totalCustomerCount,
      qrCode: orderWithRelations.qrCode || "",
      table: orderWithRelations.table
        ? `${orderWithRelations.table.tabTypes} - Table ${orderWithRelations.table.tabID}`
        : "N/A",
      employee: orderWithRelations.employee
        ? `${orderWithRelations.employee.empFname} ${orderWithRelations.employee.empLname}`
        : "N/A",
      buffetType: orderWithRelations.buffetType
        ? `${orderWithRelations.buffetType.buffetTypesName} (฿${orderWithRelations.buffetType.buffetTypePrice})`
        : "N/A",
      pricePerItem: orderWithRelations.buffetType ? orderWithRelations.buffetType.buffetTypePrice : 0,
      totalPrice: orderWithRelations.buffetType
        ? orderWithRelations.buffetType.buffetTypePrice * orderWithRelations.totalCustomerCount
        : 0,
    };

    console.log("Order details (including QR Code):", orderDetails);

    return NextResponse.json(orderDetails, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching order:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: "Failed to fetch order", error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ message: "Failed to fetch order", error: "An unknown error occurred" }, { status: 500 });
    }
  }
}