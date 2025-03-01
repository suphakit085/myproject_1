
import MenuPage from './MenuPage';
import { cache } from 'react';

interface OrderItemType {
    id: string;
    table: string;
    employee: string;
    buffetType: string;
    orderStatus: string | null;
    totalPricePerItem: number;
    numberOfCustomers: number;
    grandTotalPrice: number;
    qrCode: string;
    BuffetTypes_buffetTypeID: number;
    orderItems?: { id: string; menuItemId: number; menuItemName: string; quantity: number }[];
}

interface MenuItem {
    id: number;
    name: string;
    price: number;
    buffetTypeID: number;
}

const getData = cache(async (orderItemId: string) => {
    console.log("Fetching order with ID:", orderItemId);
    let orderItem: OrderItemType | null = null;
    let menuItems: MenuItem[] = [];
    let error: string | null = null;

    try {
        const orderResponse = await fetch(`/api/order-item/${orderItemId}`);
        console.log("Order response status:", orderResponse.status);
        if (!orderResponse.ok) {
            throw new Error(`Failed to fetch order item: ${orderResponse.status}`);
        }
        orderItem = await orderResponse.json();

        const menuResponse = await fetch("/api/menu");
        if (!menuResponse.ok) {
            throw new Error("Failed to fetch menu items");
        }
        const fetchedMenuItems: MenuItem[] = await menuResponse.json();
        menuItems = fetchedMenuItems.filter(
            (item) => item.buffetTypeID === orderItem!.BuffetTypes_buffetTypeID
        );
    } catch (err) {
        error = err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Error in getData:", error);
    }

    return { orderItem, menuItems, error };
});

export default async function MenuPageDataLoader({ params }: { params: Promise<{ orderItemId: string }> }) {
    const resolvedParams = await params;
    console.log("Resolved params:", resolvedParams);
    const { orderItem, menuItems, error } = await getData(resolvedParams.orderItemId);
    return <MenuPage orderItem={orderItem} menuItems={menuItems} error={error} />;
}