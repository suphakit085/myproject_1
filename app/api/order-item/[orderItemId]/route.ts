//api/order-item/[orderItemId]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { orderItemId: string } }) {
    console.log("API orderItemId:", params.orderItemId);

    // ตรวจสอบว่า orderItemId ถูกส่งมาหรือไม่
    if (!params.orderItemId) {
        return NextResponse.json({ error: "Missing orderItemId" }, { status: 400 });
    }

    try {
        const order = await prisma.orders.findUnique({
            where: { orderItemId: params.orderItemId },
            include: {
                table: true,
                employee: true,
                buffetType: true,
                orderItems: { include: { menuItem: true } },
            },
        });

        if (!order) {
            console.log("Order not found for ID:", params.orderItemId);
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const totalPricePerItem = order.buffetType.buffetTypePrice;
        const grandTotalPrice = totalPricePerItem * order.totalCustomerCount;

        return NextResponse.json({
            id: order.orderItemId,
            table: `${order.table.tabTypes} - Table ${order.table.tabID}`,
            employee: `${order.employee.empFname} ${order.employee.empLname}`,
            buffetType: `${order.buffetType.buffetTypesName} (฿${order.buffetType.buffetTypePrice})`,
            orderStatus: order.orderStatus,
            totalPricePerItem,
            numberOfCustomers: order.totalCustomerCount,
            grandTotalPrice,
            qrCode: order.qrCode,
            BuffetTypes_buffetTypeID: order.BuffetTypes_buffetTypeID,
            orderItems: order.orderItems.map((item) => ({
                id: item.id,
                menuItemId: item.MenuItems_menuItemsID,
                menuItemName: item.menuItem.menuItemNameENG,
                quantity: item.Quantity,
            })),
        });
    } catch (error) {
        console.error("Error fetching order item:", error);
        return NextResponse.json({ error: "Failed to fetch order item" }, { status: 500 });
    }
}
