// app/admin/orders/page.tsx
"use client";
import Navbar from '@/app/components/Navbar';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
}

const AdminOrderPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/orders"); // API สำหรับดึงข้อมูล Order ทั้งหมด
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError('Failed to fetch orders');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderID === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
      
      // แสดง notification แบบสวยงาม
      showNotification('success', 'Order status updated successfully!');
    } catch (err) {
      console.error("Failed to update order status:", err);
      showNotification('error', 'Failed to update order status');
    }
  };

  const handleSoftDeleteOrder = async (orderId: number) => {
    try {
      // เปลี่ยนจาก hard delete เป็น soft delete โดยส่ง isDeleted: true
      const response = await fetch(`/api/orders/${orderId}/soft-delete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDeleted: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to soft delete order');
      }

      // อัปเดตสถานะ isDeleted ใน state แทนที่จะลบออกจาก array
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderID === orderId ? { ...order, isDeleted: true } : order
        )
      );
      
      showNotification('success', 'Order has been archived successfully!');
    } catch (err) {
      console.error("Failed to archive order:", err);
      showNotification('error', 'Failed to archive order');
    }
  };

  const handleRestoreOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/restore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDeleted: false }),
      });

      if (!response.ok) {
        throw new Error('Failed to restore order');
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderID === orderId ? { ...order, isDeleted: false } : order
        )
      );
      
      showNotification('success', 'Order has been restored successfully!');
    } catch (err) {
      console.error("Failed to restore order:", err);
      showNotification('error', 'Failed to restore order');
    }
  };

  // แสดง notification สวยงาม
  const showNotification = (type: 'success' | 'error', message: string) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } transition-opacity duration-500 flex items-center`;
    
    // Add icon based on type
    const icon = document.createElement('span');
    icon.className = 'mr-2 text-xl';
    icon.innerHTML = type === 'success' ? '✓' : '✗';
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

  // กรองออเดอร์ตามสถานะการลบ
  const filteredOrders = showDeleted 
    ? orders.filter(order => order.isDeleted) 
    : orders.filter(order => !order.isDeleted);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* เพิ่มพื้นที่ว่างด้านบนเพิ่มเติมเพื่อไม่ให้เนื้อหาซ้อนทับกับ navbar */}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {showDeleted ? (
                          <button
                            onClick={() => handleRestoreOrder(order.orderID)}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm transition-colors mr-2 flex items-center"
                          >
                            <span className="mr-1">↩</span> Restore
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order.orderID, 'COMPLETED')}
                              className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md text-sm transition-colors mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={order.orderStatus === 'COMPLETED'}
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleSoftDeleteOrder(order.orderID)}
                              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm transition-colors"
                            >
                              Archive
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
};

export default AdminOrderPage;