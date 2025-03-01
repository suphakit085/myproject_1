// app/admin/orders/page.tsx
"use client";
import Navbar from '@/app/components/Navbar';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  orderID: number;
  orderStatus: string | null;
  Tables_tabID: number;
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
      alert('Order status updated successfully!');
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      setOrders((prevOrders) => prevOrders.filter((order) => order.orderID !== orderId));
      alert('Order deleted successfully!');
    } catch (err) {
      console.error("Failed to delete order:", err);
      alert('Failed to delete order');
    }
  };

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Manage Orders</h1>
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Order ID</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Table Type</th>
            <th className="px-4 py-2">Employee Name</th>
            <th className="px-4 py-2">Buffet Type Name</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderID}>
              <td className="border px-4 py-2">{order.orderID}</td>
              <td className="border px-4 py-2">{order.orderStatus}</td>
              <td className="border px-4 py-2">{order.table?.tabTypes}</td>
              <td className="border px-4 py-2">
                {order.employee.empFname} {order.employee.empLname}  {/* แสดงชื่อ employee */}
              </td>
              <td className="border px-4 py-2">{order.buffetType?.buffetTypesName}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleUpdateStatus(order.orderID, 'COMPLETED')}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                  disabled={order.orderStatus === 'COMPLETED'}
                >
                  Set to Completed
                </button>
                <button
                  onClick={() => handleDeleteOrder(order.orderID)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete Order
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderPage;