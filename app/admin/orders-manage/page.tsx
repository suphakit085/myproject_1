"use client";
import Navbar from '@/app/components/Navbar';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Order {
  orderID: number;
  orderStatus: string | null;
  Tables_tabID: number;
  isDeleted: boolean;
  employee: {
    empFname: string;
    empLname: string;
  };
  table: {
    tabTypes: string;
  } | null;
  buffetType: {
    buffetTypeID: number;
    buffetTypesName: string;
  };
  orderCreatedAt: Date;
  bill?: {
    billID: number;
    billStatus: string;
  } | null;
}

export default function AdminOrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders?includeBill=true"); // เพิ่มพารามิเตอร์เพื่อระบุว่าต้องการ include bill
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      console.log("Orders with bills:", data); // ดู log ว่ามีข้อมูล bill หรือไม่
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/update-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refetch orders to reflect the latest state
      await fetchOrders();
      showNotification('success', 'Order status updated successfully!');
    } catch (err) {
      console.error("Failed to update order status:", err);
      showNotification('error', 'Failed to update order status');
    }
  };

  const handleSoftDeleteOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/soft-delete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to soft delete order');
      }

      // Refetch orders to reflect the latest state
      await fetchOrders();
      showNotification('success', 'จัดเก็บออร์เดอร์สำเร็จแล้ว!');
    } catch (err) {
      console.error("Failed to archive order:", err);
      showNotification('error', 'ไม่สามารถจัดเก็บออร์เดอร์ได้');
    }
  };

  const handleRestoreOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/restore`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: false }),
      });

      if (response.status === 400) {
        const errorData = await response.json();
        showNotification('error', errorData.error || 'ไม่สามารถคืนสถานะออร์เดอร์ได้: โต๊ะไม่ว่าง');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to restore order');
      }

      // Refetch orders to reflect the latest state
      await fetchOrders();
      showNotification('success', 'คืนสถานะออร์เดอร์สำเร็จแล้ว!');
    } catch (err) {
      console.error("Failed to restore order:", err);
      showNotification('error', 'ไม่สามารถคืนสถานะออร์เดอร์ได้');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } transition-opacity duration-500 flex items-center`;
    
    const icon = document.createElement('span');
    icon.className = 'mr-2 text-xl';
    icon.innerHTML = type === 'success' ? '✓' : '✗';
    notification.appendChild(icon);
    
    const messageEl = document.createElement('span');
    messageEl.textContent = message;
    notification.appendChild(messageEl);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  const filteredOrders = showDeleted 
    ? orders.filter(order => order.isDeleted) 
    : orders.filter(order => !order.isDeleted);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-8"></div>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Orders</h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowDeleted(!showDeleted)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  showDeleted 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showDeleted ? (
                  <>
                    <span className="mr-2">◀</span>
                    <span>View Active Orders</span>
                  </>
                ) : (
                  <>
                    <span>View Archived Orders</span>
                    <span className="ml-2">▶</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">
                {showDeleted ? "No archived orders found." : "No active orders found."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buffet Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.orderID} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.orderID}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.orderStatus === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800' 
                            : order.orderStatus === 'CANCELLED' 
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.orderStatus || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.table?.tabTypes || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.employee.empFname} {order.employee.empLname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.buffetType?.buffetTypesName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                         {order.bill ? (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                 ชำระแล้ว
                             </span>
                            ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                 ยังไม่ชำระ
                                  </span>
                                )}
                              </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex">
                        {showDeleted ? (
                          <>
                            <Link
                              href={`/order/${order.orderID}`}
                              className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded-md text-sm transition-colors mr-2 flex items-center"
                            >
                              <span className="mr-1">🔍</span> ดูข้อมูล
                            </Link>
                            <button
                              onClick={() => handleRestoreOrder(order.orderID)}
                              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm transition-colors flex items-center"
                            >
                              <span className="mr-1">↩</span> คืนสถานะ
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`/order/${order.orderID}`}
                              className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded-md text-sm transition-colors mr-2 flex items-center"
                            >
                              <span className="mr-1">🔍</span> ดูข้อมูล
                            </Link>
                            {!order.bill && (
                              <Link
                                href={`/admin/checkout/${order.orderID}`}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm transition-colors mr-2 flex items-center"
                              >
                                <span className="mr-1">💰</span> เช็คบิล
                              </Link>
                            )}
                           {order.bill && (
                    <Link
                      href={`/admin/bill/${order.bill.billID}`}
                       className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md text-sm transition-colors mr-2 flex items-center"
  >
                          <span className="mr-1">🧾</span> ดูบิล
                            </Link>
                              )}
                            <button
                              onClick={() => handleSoftDeleteOrder(order.orderID)}
                              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm transition-colors flex items-center"
                            >
                              <span className="mr-1">🗑️</span> จัดเก็บ
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}