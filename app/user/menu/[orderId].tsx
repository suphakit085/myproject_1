"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

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
    orderItems: { id: string; menuItemId: number; menuItemName: string; quantity: number }[];
}

interface MenuItem {
    id: number;
    name: string;
    price: number;
    buffetTypeID: number;
}

const MenuPage = ({ params: paramsPromise }: { params: Promise<{ orderItemId: string }> }) => {
    const params = use(paramsPromise);
    const [orderItem, setOrderItem] = useState<OrderItemType | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchOrderItemAndMenu = async () => {
            try {
                const orderResponse = await fetch(`/api/order-items/${params.orderItemId}`);
                if (!orderResponse.ok) throw new Error("Order Item not found");
                const fetchedOrderItem: OrderItemType = await orderResponse.json();
                setOrderItem(fetchedOrderItem);

                const menuResponse = await fetch("/api/menu");
                if (!menuResponse.ok) throw new Error("Failed to fetch menu items");
                const fetchedMenuItems: MenuItem[] = await menuResponse.json();
                const filteredMenuItems = fetchedMenuItems.filter(
                    (item) => item.buffetTypeID === fetchedOrderItem.BuffetTypes_buffetTypeID
                );
                setMenuItems(filteredMenuItems);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderItemAndMenu();
    }, [params.orderItemId]);

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
    if (!orderItem) return <div className="text-center mt-10">Order Item not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
            <h1 className="text-3xl font-bold mb-6">Menu for Order {orderItem.id}</h1>
            <div className="space-y-4">
                <p><strong>Table:</strong> {orderItem.table}</p>
                <p><strong>Employee:</strong> {orderItem.employee}</p>
                <p><strong>Buffet Type:</strong> {orderItem.buffetType}</p>
                <p><strong>Number of Customers:</strong> {orderItem.numberOfCustomers}</p>
                <p><strong>Total Price:</strong> ฿{orderItem.grandTotalPrice}</p>
            </div>

            {menuItems.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Available Menu Items</h2>
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.id} className="py-2 border-b border-gray-200">
                                <p>{item.name} - ฿{item.price}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {orderItem.orderItems.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Ordered Items</h2>
                    <ul>
                        {orderItem.orderItems.map((item) => (
                            <li key={item.id} className="py-2 border-b border-gray-200">
                                <p>{item.menuItemName} - Quantity: {item.quantity}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-6">
                <button
                    onClick={() => router.push("/")}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default MenuPage;