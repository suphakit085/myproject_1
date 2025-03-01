//api
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";

const orderSchema = z.object({
  orderStatus: z.enum(["PENDING", "COMPLETED", "CANCELLED"]),
  Tables_tabID: z.number().int().positive(),
  Employee_empID: z.number().int().positive(),
  BuffetTypes_buffetTypeID: z.number().int().positive(),
  totalCustomerCount: z.number().int().positive(),
});

interface OrderResponse {
  orderID: number;
  orderItemId: string;
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Request body:", body);

    const validatedData = orderSchema.parse(body);
    console.log("Validated data:", validatedData);

    // ตรวจสอบ foreign keys
    const tableExists = await prisma.tables.findUnique({
      where: { tabID: validatedData.Tables_tabID },
    });
    console.log("Table exists:", tableExists);
    if (!tableExists) {
      return NextResponse.json({ error: `Table ID ${validatedData.Tables_tabID} not found` }, { status: 400 });
    }

    const employeeExists = await prisma.employee.findUnique({
      where: { empID: validatedData.Employee_empID },
    });
    console.log("Employee exists:", employeeExists);
    if (!employeeExists) {
      return NextResponse.json({ error: `Employee ID ${validatedData.Employee_empID} not found` }, { status: 400 });
    }

    const buffetTypeExists = await prisma.buffetTypes.findUnique({
      where: { buffetTypeID: validatedData.BuffetTypes_buffetTypeID },
    });
    console.log("Buffet type exists:", buffetTypeExists);
    if (!buffetTypeExists) {
      return NextResponse.json({ error: `Buffet Type ID ${validatedData.BuffetTypes_buffetTypeID} not found` }, { status: 400 });
    }

    const existingOrder = await prisma.orders.findFirst({
      where: {
        Tables_tabID: validatedData.Tables_tabID,
        NOT: { orderStatus: { in: ["COMPLETED", "CANCELLED"] } },
      },
    });
    console.log("Existing order:", existingOrder);

    if (existingOrder) {
      return NextResponse.json({ error: "Table is already reserved" }, { status: 400 });
    }

    const orderItemId = randomUUID().toLowerCase().trim();;
    const qrCodeUrl = `http://localhost:3000/user/menu/${orderItemId}`;
    console.log("Generated orderItemId:", orderItemId);

    let newOrder;
    try {
      newOrder = await prisma.orders.create({
        data: {
          orderItemId,
          orderStatus: validatedData.orderStatus,
          Tables_tabID: validatedData.Tables_tabID,
          Employee_empID: validatedData.Employee_empID,
          BuffetTypes_buffetTypeID: validatedData.BuffetTypes_buffetTypeID,
          totalCustomerCount: validatedData.totalCustomerCount,
          qrCode: qrCodeUrl,
        },
      });
      console.log("Created order:", newOrder);
    } catch (prismaError: any) {
      console.error("Prisma create error:", {
        message: prismaError.message,
        code: prismaError.code, // Prisma error code เช่น P2002, P2003
        meta: prismaError.meta, // รายละเอียดเพิ่มเติม เช่น target field
      });
      throw new Error(`Failed to create order in database: ${prismaError.message}`);
    }

    if (!newOrder) {
      throw new Error("Order creation returned null");
    }

    return NextResponse.json<OrderResponse>(
      {
        orderID: newOrder.orderID,
        orderItemId: newOrder.orderItemId,
        message: "Order created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}