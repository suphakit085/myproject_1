// app/components/OrderFrom.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
//import QRCode from 'qrcode';

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
    //const [isLoadingQrCode, setIsLoadingQrCode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orderForm');
    const router = useRouter();

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
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
            } finally {
                setIsLoading(false);
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
        if (order.Tables_tabID === 0 || order.Employee_empID === 0 || order.BuffetTypes_buffetTypeID === 0) {
            showNotification('error', 'กรุณาเลือกข้อมูลให้ครบถ้วน');
            return null;
        }
        
        const selectedTable = tables.find((table) => table.tabID === order.Tables_tabID);
        const selectedEmployee = employees.find((employee) => employee.empID === order.Employee_empID);
        const selectedBuffet = buffetTypes.find((buffet) => buffet.buffetTypeID === order.BuffetTypes_buffetTypeID);

        if (selectedTable && reservedTableIds.includes(selectedTable.tabID)) {
            showNotification('error', 'โต๊ะนี้ถูกจองแล้ว กรุณาเลือกโต๊ะอื่น');
            return null;
        }

        if (numberOfCustomers < 1) {
            showNotification('error', 'กรุณาระบุจำนวนลูกค้าอย่างน้อย 1 คน');
            return null;
        }

        const newOrderItem: OrderItemType = {
            id: "temp-id",
            table: selectedTable ? `${selectedTable.tabTypes} - Table ${selectedTable.tabID}` : "N/A",
            employee: selectedEmployee ? `${selectedEmployee.empFname} ${selectedEmployee.empLname}` : "N/A",
            buffetType: selectedBuffet ? `${selectedBuffet.buffetTypesName} (฿${selectedBuffet.buffetTypePrice})` : "N/A",
            orderStatus: order.orderStatus || "PENDING",
            totalPricePerItem: totalPricePerItem,
            numberOfCustomers: numberOfCustomers,
            grandTotalPrice: grandTotalPrice,
            qrCode: "",
            BuffetTypes_buffetTypeID: selectedBuffet?.buffetTypeID || 0,
        };
    
        setOrderItems((prevOrderItems) => {
            const updatedOrderItems = [...prevOrderItems, newOrderItem];
            return updatedOrderItems;
        });
        
        showNotification('success', 'เพิ่มรายการสำเร็จ');
        setActiveTab('orderItems');
        return newOrderItem;
    };
    
    const handleDeleteOrder = (index: number) => {
        const newOrderItems = [...orderItems];
        newOrderItems.splice(index, 1);
        setOrderItems(newOrderItems);
        showNotification('info', 'ลบรายการสำเร็จ');
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (orderItems.length === 0) {
            const newOrderItem = await handleAddOrder();
            if (!newOrderItem) return;
        }
        
        setIsLoading(true);
        
        try {
            // ใช้รายการล่าสุดในกรณีที่เพิ่งกดเพิ่มรายการ
            const currentOrderItem = orderItems[orderItems.length - 1];
            
            const orderWithCustomerCount = {
                ...order,
                totalCustomerCount: currentOrderItem.numberOfCustomers,
                BuffetTypes_buffetTypeID: currentOrderItem.BuffetTypes_buffetTypeID,
            };
        
            const response = await fetch("/api/orders/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderWithCustomerCount),
            });
        
            if (!response.ok) {
                const data = await response.json();
                if (data.error === "Table is already reserved") {
                    showNotification('error', 'โต๊ะนี้ถูกจองแล้ว กรุณาเลือกโต๊ะอื่น');
                    setIsLoading(false);
                    return;
                }
                throw new Error("Failed to save order");
            }
        
            const data = await response.json();
            
            if (data && data.orderID && data.orderItemId) {
                router.push(`/order/${data.orderID}`);
                const menuUrl = `http://localhost:3000/user/menu/${data.orderItemId}?orderItemId=${data.orderItemId}`;
                showNotification('success', `สร้างออเดอร์สำเร็จ! เลขออเดอร์: ${data.orderID}`);
            } else {
                showNotification('warning', 'สร้างออเดอร์สำเร็จ แต่ข้อมูลไม่ครบถ้วน');
            }
        
            setOrder(initialOrderFormValues);
            setOrderItems([]);
            setNumberOfCustomers(1);
        } catch (apiError) {
            console.error("Error:", apiError);
            showNotification('error', 'ไม่สามารถบันทึกออเดอร์ได้');
        } finally {
            setIsLoading(false);
        }
    };
    
    // ฟังก์ชันแสดงการแจ้งเตือน
    const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
        } transition-opacity duration-500 flex items-center z-50`;
        
        // Add icon based on type
        const icon = document.createElement('span');
        icon.className = 'mr-2 text-xl';
        icon.innerHTML = type === 'success' ? '✓' : 
                        type === 'error' ? '✗' : 
                        type === 'warning' ? '⚠' : 'ℹ';
        notification.appendChild(icon);
        
        const messageEl = document.createElement('span');
        messageEl.textContent = message;
        notification.appendChild(messageEl);
        
        document.body.appendChild(notification);
        
        // Fade out and remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    };
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl shadow-lg p-6 mb-4">
                    <h1 className="text-3xl font-bold text-white">สร้างออเดอร์ใหม่</h1>
                    <p className="text-blue-100 mt-2">กรอกข้อมูลและเลือกบริการบุฟเฟ่ต์ที่ต้องการ</p>
                </div>
                
                {/* Main content card */}
                <div className="bg-white rounded-b-xl shadow-lg overflow-hidden mb-8">
                    {/* Tabs */}
                    <div className="flex border-b">
                        <button 
                            onClick={() => setActiveTab('orderForm')}
                            className={`px-6 py-3 font-medium text-sm flex items-center ${
                                activeTab === 'orderForm' 
                                    ? 'border-b-2 border-blue-500 text-blue-600' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            ข้อมูลออเดอร์
                        </button>
                        <button 
                            onClick={() => setActiveTab('menuItems')}
                            className={`px-6 py-3 font-medium text-sm flex items-center ${
                                activeTab === 'menuItems' 
                                    ? 'border-b-2 border-blue-500 text-blue-600' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            รายการเมนู ({filteredMenuItems.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('orderItems')}
                            className={`px-6 py-3 font-medium text-sm flex items-center ${
                                activeTab === 'orderItems' 
                                    ? 'border-b-2 border-blue-500 text-blue-600' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            รายการออเดอร์ ({orderItems.length})
                        </button>
                    </div>
                    
                    <div className="p-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Order Form Tab */}
                        {activeTab === 'orderForm' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Table Select */}
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">เลือกโต๊ะ:</label>
                                        <select
                                            name="Tables_tabID"
                                            value={order.Tables_tabID}
                                            onChange={handleInputChange}
                                            className="block w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                            required
                                        >
                                            <option value="0">-- เลือกโต๊ะ --</option>
                                            {tables.map((table) => (
                                                <option
                                                    key={table.tabID}
                                                    value={table.tabID}
                                                    disabled={reservedTableIds.includes(table.tabID)}
                                                >
                                                  {table.tabTypes.toLowerCase() === 'vip' ? '🌟 VIP' : '📌 Standard'} - โต๊ะ {table.tabID}
                                                    {reservedTableIds.includes(table.tabID) && " (จองแล้ว)"}
                                                </option>
                                            ))}
                                        </select>
                                        {reservedTableIds.includes(order.Tables_tabID) && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                โต๊ะนี้ถูกจองแล้ว
                                            </p>
                                        )}
                                    </div>

                                    {/* Employee Select */}
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">เลือกพนักงาน:</label>
                                        <select
                                            name="Employee_empID"
                                            value={order.Employee_empID}
                                            onChange={handleInputChange}
                                            className="block w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                            required
                                        >
                                            <option value="0">-- เลือกพนักงาน --</option>
                                            {employees.map((employee) => (
                                                <option key={employee.empID} value={employee.empID}>
                                                    {employee.empFname} {employee.empLname} - {employee.position}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Buffet Type Select */}
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">เลือกประเภทบุฟเฟ่ต์:</label>
                                        <select
                                            name="BuffetTypes_buffetTypeID"
                                            value={order.BuffetTypes_buffetTypeID}
                                            onChange={handleInputChange}
                                            className="block w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                            required
                                        >
                                            <option value="0">-- เลือกประเภทบุฟเฟ่ต์ --</option>
                                            {buffetTypes.map((buffetType) => (
                                                <option key={buffetType.buffetTypeID} value={buffetType.buffetTypeID}>
                                                    {buffetType.buffetTypesName} (฿{buffetType.buffetTypePrice})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Number of Customers */}
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนลูกค้า:</label>
                                        <div className="flex items-center">
                                            <button
                                                type="button"
                                                onClick={() => setNumberOfCustomers(Math.max(1, numberOfCustomers - 1))}
                                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-l-lg hover:bg-gray-300 focus:outline-none"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={numberOfCustomers}
                                                onChange={(e) => setNumberOfCustomers(Math.max(1, Number(e.target.value)))}
                                                className="w-full px-4 py-2 bg-white border-t border-b border-gray-300 text-center"
                                                min="1"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setNumberOfCustomers(numberOfCustomers + 1)}
                                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-r-lg hover:bg-gray-300 focus:outline-none"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Order Status (Hidden) */}
                                <input type="hidden" name="orderStatus" value="PENDING" />
                                
                                {/* Order Summary */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-2">สรุปรายการ</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="text-gray-600">สถานะออเดอร์:</div>
                                        <div className="font-medium">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                รอดำเนินการ
                                            </span>
                                        </div>
                                        <div className="text-gray-600">ราคาต่อคน:</div>
                                        <div className="font-medium">฿{totalPricePerItem.toLocaleString()}</div>
                                        <div className="text-gray-600">จำนวนลูกค้า:</div>
                                        <div className="font-medium">{numberOfCustomers} คน</div>
                                        <div className="text-gray-600">ราคารวม:</div>
                                        <div className="font-medium text-lg text-blue-700">฿{grandTotalPrice.toLocaleString()}</div>
                                    </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex space-x-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleAddOrder}
                                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex justify-center items-center transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        เพิ่มรายการ
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex justify-center items-center transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        บันทึกออเดอร์
                                    </button>
                                </div>
                            </form>
                        )}
                        
                        {/* Menu Items Tab */}
                        {activeTab === 'menuItems' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        รายการเมนูบุฟเฟ่ต์
                                        {order.BuffetTypes_buffetTypeID > 0 && (
                                            <span> - {buffetTypes.find(b => b.buffetTypeID === order.BuffetTypes_buffetTypeID)?.buffetTypesName}</span>
                                        )}
                                    </h2>
                                    
                                    {order.BuffetTypes_buffetTypeID === 0 && (
                                        <div className="text-blue-600 bg-blue-50 px-4 py-2 rounded-lg text-sm">
                                            กรุณาเลือกประเภทบุฟเฟ่ต์เพื่อดูรายการเมนู
                                        </div>
                                    )}
                                </div>
                                
                                {filteredMenuItems.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredMenuItems.map((item) => (
                                            <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                                <div className="p-4">
                                                    <div className="bg-gray-100 h-40 mb-3 rounded flex items-center justify-center">
                                                        <span className="text-gray-400 text-sm">รูปภาพเมนู</span>
                                                    </div>
                                                    <h3 className="font-medium text-gray-800 text-lg mb-1">{item.name}</h3>
                                                    <p className="text-blue-600 font-semibold">฿{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 px-4">
                                        <svg 
                                            className="mx-auto h-12 w-12 text-gray-400" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24" 
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={1.5} 
                                                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
                                            />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบรายการเมนู</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {order.BuffetTypes_buffetTypeID === 0 
                                                ? "กรุณาเลือกประเภทบุฟเฟ่ต์ก่อน" 
                                                : "ไม่มีรายการเมนูสำหรับประเภทบุฟเฟ่ต์นี้"}
                                        </p>
                                        {order.BuffetTypes_buffetTypeID === 0 && (
                                            <div className="mt-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('orderForm')}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    ไปที่แบบฟอร์มออเดอร์
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                </div>
                        )}
                        
                        {/* Order Items Tab */}
                        {activeTab === 'orderItems' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800">รายการออเดอร์ที่เลือก</h2>
                                    
                                    {orderItems.length === 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('orderForm')}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            เพิ่มรายการใหม่
                                        </button>
                                    )}
                                </div>
                                
                                {orderItems.length > 0 ? (
                                    <div className="space-y-6">
                                        {orderItems.map((item, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                                <div className="p-5">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.buffetType}</h3>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-4">
                                                                {item.orderStatus === 'PENDING' ? 'รอดำเนินการ' : item.orderStatus}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteOrder(index)}
                                                            className="text-red-500 hover:text-red-700 focus:outline-none"
                                                            title="ลบรายการ"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="p-3 bg-gray-50 rounded-lg">
                                                            <p className="text-sm text-gray-500 mb-1">โต๊ะ</p>
                                                            <p className="font-medium">{item.table}</p>
                                                        </div>
                                                        <div className="p-3 bg-gray-50 rounded-lg">
                                                            <p className="text-sm text-gray-500 mb-1">พนักงาน</p>
                                                            <p className="font-medium">{item.employee}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="bg-blue-50 rounded-lg p-4">
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">ราคาต่อคน</p>
                                                                <p className="font-semibold">฿{item.totalPricePerItem.toLocaleString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">จำนวนลูกค้า</p>
                                                                <p className="font-semibold">{item.numberOfCustomers} คน</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500 mb-1">ราคารวม</p>
                                                                <p className="font-semibold text-blue-700">฿{item.grandTotalPrice.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div className="flex justify-between mt-8">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('orderForm')}
                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors"
                                            >
                                                กลับไปแบบฟอร์ม
                                            </button>
                                            
                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                บันทึกออเดอร์
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 px-4 bg-gray-50 rounded-lg">
                                        <svg 
                                            className="mx-auto h-12 w-12 text-gray-400" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24" 
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={1.5} 
                                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                                            />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่มีรายการออเดอร์</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            เริ่มสร้างรายการออเดอร์ใหม่เพื่อดำเนินการต่อ
                                        </p>
                                        <div className="mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('orderForm')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                เพิ่มรายการใหม่
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Footer */}
                <div className="text-center text-gray-500 text-sm mt-8">
                    <p>© 2025 BuffetHub - ระบบจัดการร้านบุฟเฟ่ต์</p>
                </div>
            </div>
        </div>
    );
};

export default OrderForm;