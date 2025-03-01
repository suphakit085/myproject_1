"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
// import { v4 as uuidv4 } from 'uuid'; // ลบ import นี้

interface MenuItem { id: number; name: string; price: number; buffetTypeID: number; }
interface Table { tabID: number; tabTypes: "standart" | "vip"; tabStatus: string | null; tabCreatedAt: Date; }
interface Employee { empID: number; empFname: string; empLname: string; empPhone: string; position: string; salary: number; }
interface BuffetTypes { buffetTypeID: number; buffetTypePrice: number; buffetTypesName: string; }
interface OrderFormValues { orderStatus: string | null; Tables_tabID: number; Employee_empID: number; BuffetTypes_buffetTypeID: number; }
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
}

const initialOrderFormValues: OrderFormValues = {
    orderStatus: "PENDING",
    Tables_tabID: 0,
    Employee_empID: 0,
    BuffetTypes_buffetTypeID: 0,
};

const OrderForm: React.FC = () => {
    const [order, setOrder] = useState<OrderFormValues>(initialOrderFormValues);
    const [tables, setTables] = useState<Table[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [buffetTypes, setBuffetTypes] = useState<BuffetTypes[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [totalPricePerItem, setTotalPricePerItem] = useState<number>(0);
    const [orderItems, setOrderItems] = useState<OrderItemType[]>([]);
    const [numberOfCustomers, setNumberOfCustomers] = useState<number>(1);
    const [grandTotalPrice, setGrandTotalPrice] = useState<number>(0);
    const [reservedTableIds, setReservedTableIds] = useState<number[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoadingQrCode, setIsLoadingQrCode] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const tablesResponse = await fetch("/api/tables");
                if (!tablesResponse.ok) {
                    throw new Error(`Failed to fetch tables: ${tablesResponse.status}`);
                }
                const fetchedTables: Table[] = await tablesResponse.json();
                setTables(fetchedTables);

                const employeesResponse = await fetch("/api/employees");
                if (!employeesResponse.ok) {
                    throw new Error(`Failed to fetch employees: ${employeesResponse.status}`);
                }
                const fetchedEmployees = await employeesResponse.json();
                setEmployees(fetchedEmployees);

                const buffetTypesResponse = await fetch("/api/buffet");
                if (!buffetTypesResponse.ok) {
                    throw new Error(`Failed to fetch buffet types: ${buffetTypesResponse.status}`);
                }
                const fetchedBuffetTypes = await buffetTypesResponse.json();
                setBuffetTypes(fetchedBuffetTypes);

                setOrder({
                    ...order,
                    Tables_tabID: fetchedTables[0]?.tabID || 0,
                    Employee_empID: fetchedEmployees[0]?.empID || 0,
                    BuffetTypes_buffetTypeID: fetchedBuffetTypes[0]?.buffetTypeID || 0,
                });
            } catch (err) {
                if (err instanceof Error) {
                    setError(`Failed to load data: ${err.message}`);
                } else {
                    setError('Failed to load data: An unknown error occurred.');
                }
                console.error(err);
            }
        };

        const fetchReservedTableIds = async () => {
            try {
                const response = await fetch('/api/orders/reserved-tables');
                if (!response.ok) {
                    throw new Error('Failed to fetch reserved table IDs');
                }
                const data = await response.json();
                setReservedTableIds(data);
            } catch (err) {
                console.error("Failed to fetch reserved tables:", err);
            }
        };
        const fetchMenuItems = async () => {
            try {
                const response = await fetch("/api/menu");
                if (!response.ok) {
                    throw new Error(`Failed to fetch menu items: ${response.status}`);
                }
                const fetchedMenuItems: MenuItem[] = await response.json();
                setMenuItems(fetchedMenuItems);
            } catch (err) {
                console.error("Failed to fetch menu items:", err);
            }
        };
        fetchMenuItems();
        fetchInitialData();
        fetchReservedTableIds();
    }, []);

    useEffect(() => {
        const selectedBuffet = buffetTypes.find(
            (buffet) => buffet.buffetTypeID === order.BuffetTypes_buffetTypeID
        );
        setTotalPricePerItem(selectedBuffet ? selectedBuffet.buffetTypePrice : 0);
    }, [order.BuffetTypes_buffetTypeID, buffetTypes]);

    useEffect(() => {
        setGrandTotalPrice(totalPricePerItem * numberOfCustomers);
    }, [totalPricePerItem, numberOfCustomers]);

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setOrder((prev) => ({
            ...prev,
            [name]: name === "orderStatus" ? value : Number(value),
        }));
    };

    const filteredMenuItems = menuItems.filter(
        (item) => item.buffetTypeID === order.BuffetTypes_buffetTypeID
    );

    const handleAddOrder = async () => {
        console.log("handleAddOrder called");
        const selectedTable = tables.find((table) => table.tabID === order.Tables_tabID);
        const selectedEmployee = employees.find((employee) => employee.empID === order.Employee_empID);
        const selectedBuffet = buffetTypes.find((buffet) => buffet.buffetTypeID === order.BuffetTypes_buffetTypeID);

        if (selectedTable && reservedTableIds.includes(selectedTable.tabID)) {
            alert("This table is already reserved. Please select another table.");
            return null; // Return null if the order cannot be created
        }

        const newOrderItem: OrderItemType = {
            id: "temp-id", // ค่าชั่วคราว
            table: selectedTable ? `${selectedTable.tabTypes} - Table ${selectedTable.tabID}` : "N/A",
            employee: selectedEmployee ? `${selectedEmployee.empFname} ${selectedEmployee.empLname}` : "N/A",
            buffetType: selectedBuffet ? `${selectedBuffet.buffetTypesName} (฿${selectedBuffet.buffetTypePrice})` : "N/A",
            orderStatus: order.orderStatus || "PENDING",
            totalPricePerItem: totalPricePerItem,
            numberOfCustomers: numberOfCustomers,
            grandTotalPrice: grandTotalPrice,
            qrCode: "", // URL จะถูกสร้างหลังจากสร้าง order สำเร็จ
            BuffetTypes_buffetTypeID: selectedBuffet?.buffetTypeID || null as any,
        };
    
        setOrderItems((prevOrderItems) => {
            const updatedOrderItems = [...prevOrderItems, newOrderItem];
            console.log("setOrderItems updatedOrderItems:", updatedOrderItems);
            return updatedOrderItems;
        });
    
        return newOrderItem;
    };
     const handleDeleteOrder = (index: number) => {
        const newOrderItems = [...orderItems];
        newOrderItems.splice(index, 1);
        setOrderItems(newOrderItems);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newOrderItem = await handleAddOrder();
        if (!newOrderItem) return;
    
        const orderWithCustomerCount = {
            ...order,
            totalCustomerCount: numberOfCustomers,
            // qrCode: newOrderItem.qrCode, // ส่ง URL ไป API (ลบ code นี้)
            BuffetTypes_buffetTypeID: newOrderItem.BuffetTypes_buffetTypeID,
        };
    
        console.log("Order data sent to API (without QR Code):", orderWithCustomerCount); // เพิ่ม log เพื่อตรวจสอบ
    
        try {
            const response = await fetch("/api/orders/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderWithCustomerCount),
            });
    
            if (!response.ok) {
                const data = await response.json();
                if (data.error === "Table is already reserved") {
                    alert("This table is already reserved. Please select another table.");
                    return;
                }
                throw new Error("Failed to save order");
            }
    
            const data = await response.json();
    
            console.log("Response from API:", data); // เพิ่ม log เพื่อตรวจสอบข้อมูลที่กลับมา
    
            //localStorage.setItem("orderItems", JSON.stringify(orderItems));
    
            if (data && data.orderID && data.orderItemId) { // ตรวจสอบว่ามี orderID และ orderItemId
                router.push(`/order/${data.orderID}`); // Redirect to the order detail page
                 const menuUrl = `http://localhost:3000/user/menu/${data.orderItemId}?orderItemId=${data.orderItemId}`;
                alert(`Order saved successfully! Menu URL: ${menuUrl}`);
            } else {
                alert("Order saved successfully, but order ID or Item ID is missing!");
            }
    
            setOrder(initialOrderFormValues);
            setOrderItems([]);
        } catch (apiError) {
            console.error("Error:", apiError);
            alert("Failed to save order");
        }
    };
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Create New Order</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Table Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Table:</label>
                    <select
                        name="Tables_tabID"
                        value={order.Tables_tabID}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    >
                        {tables.map((table) => (
                            <option
                                key={table.tabID}
                                value={table.tabID}
                                disabled={reservedTableIds.includes(table.tabID)}
                            >
                                {table.tabTypes} - Table {table.tabID}
                                {reservedTableIds.includes(table.tabID) && " (Reserved)"}
                            </option>
                        ))}
                    </select>
                    {reservedTableIds.includes(order.Tables_tabID) && (
                        <p className="text-red-500 text-sm mt-1">This table is already reserved.</p>
                    )}
                </div>

                {/* Employee Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Employee:</label>
                    <select
                        name="Employee_empID"
                        value={order.Employee_empID}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    >
                        {employees.map((employee) => (
                            <option key={employee.empID} value={employee.empID}>
                                {employee.empFname} {employee.empLname} - {employee.position}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Buffet Type Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Buffet Type:</label>
                    <select
                        name="BuffetTypes_buffetTypeID"
                        value={order.BuffetTypes_buffetTypeID}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    >
                        {buffetTypes.map((buffetType) => (
                            <option key={buffetType.buffetTypeID} value={buffetType.buffetTypeID}>
                                {buffetType.buffetTypesName} (฿{buffetType.buffetTypePrice})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Order Status (Disabled) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Order Status:</label>
                    <input
                        type="text"
                        value="Pending"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        disabled // Disable the input
                    />
                    <input type="hidden" name="orderStatus" value="PENDING" />
                </div>

                {/* Number of Customers */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Customers:</label>
                    <input
                        type="number"
                        value={numberOfCustomers}
                        onChange={(e) => setNumberOfCustomers(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        min="1"
                    />
                </div>

                {/* Total Price */}
                <div>
                    <p className="text-lg font-semibold">Price per Item: ฿{totalPricePerItem}</p>
                    <p className="text-lg font-semibold">Total Price: ฿{grandTotalPrice}</p>
                </div>
                {/* Add Order */}
                <div>
                    <button
                        type="button"
                        onClick={handleAddOrder}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Add Order
                    </button>
                </div>

                <div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Save Order
                    </button>
                </div>
            </form>

            {/* Display Filtered Menu Items */}
            {filteredMenuItems.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Filtered Menu Items:</h3>
                    <ul>
                        {filteredMenuItems.map((item) => (
                            <li key={item.id} className="py-2 border-b border-gray-200">
                                <p>{item.name} - ฿{item.price}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Display Order Items (ไม่แสดง QR code) */}
            {orderItems.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Order Items:</h3>
                    <ul>
                        {orderItems.map((item, index) => (
                            <li key={index} className="py-2 border-b border-gray-200 flex items-center justify-between">
                                <div>
                                    <p>Table: {item.table}</p>
                                    <p>Employee: {item.employee}</p>
                                    <p>Buffet Type: {item.buffetType}</p>
                                    <p>Order Status: {item.orderStatus}</p>
                                    <p>Price per Item: ฿{item.totalPricePerItem}</p>
                                    <p>Number of Customers: {item.numberOfCustomers}</p>
                                    <p>Total Price: ฿{item.grandTotalPrice}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteOrder(index)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default OrderForm;