"use client";

import { useRouter } from "next/navigation";

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

interface MenuPageProps {
    orderItem: OrderItemType | null;
    menuItems: MenuItem[];
    error: string | null;
}

const MenuPage = ({ orderItem, menuItems, error }: MenuPageProps) => {
    const router = useRouter();

    // Format price with Thai Baht symbol and proper thousand separators
    const formatPrice = (price: number) => {
        return `฿${price.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (error) {
        return (
            <div className="text-red-500 text-center mt-10">
                <p>{error}</p>
                <button
                    onClick={() => router.refresh()}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!orderItem) {
        return <div className="text-center mt-10">Order Item not found</div>;
    }

    return (
        <main className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
            <h1 className="text-3xl font-bold mb-6">Menu for Order {orderItem.id}</h1>
            <section className="space-y-4" aria-label="Order Details">
                <p><strong>Table:</strong> {orderItem.table}</p>
                <p><strong>Employee:</strong> {orderItem.employee}</p>
                <p><strong>Buffet Type:</strong> {orderItem.buffetType}</p>
                <p><strong>Number of Customers:</strong> {orderItem.numberOfCustomers}</p>
                <p><strong>Total Price:</strong> {formatPrice(orderItem.grandTotalPrice)}</p>
            </section>

            <section className="mt-8" aria-label="Available Menu Items">
                <h2 className="text-2xl font-semibold mb-4">Available Menu Items</h2>
                {menuItems.length > 0 ? (
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.id} className="py-2 border-b border-gray-200">
                                <p>{item.name} - {formatPrice(item.price)}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No menu items available for this buffet type.</p>
                )}
            </section>

            {orderItem.orderItems && orderItem.orderItems.length > 0 && (
                <section className="mt-8" aria-label="Ordered Items">
                    <h2 className="text-2xl font-semibold mb-4">Ordered Items</h2>
                    <ul>
                        {orderItem.orderItems.map((item) => (
                            <li key={item.id} className="py-2 border-b border-gray-200">
                                <p>{item.menuItemName} - Quantity: {item.quantity}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <div className="mt-6">
                <button
                    onClick={() => router.push("/")}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    aria-label="Back to Home"
                >
                    Back to Home
                </button>
            </div>
        </main>
    );
};

export default MenuPage;