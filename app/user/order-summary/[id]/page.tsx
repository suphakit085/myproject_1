'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  id: string;
  Orders_orderID: number;
  MenuItems_menuItemsID: number;
  Quantity: number;
  menuStatus: string;
  createdAt: string;
  menuItem: {
    menuItemsID: number;
    menuItemNameTHA: string;
    menuItemNameENG: string;
    menuItemsPrice: number;
    itemImage: string;
    description: string | null;
    category: string;
  };
}

interface OrderData {
  orderID: number;
  orderItemId: string;
  orderStatus: string;
  Tables_tabID: number;
  table: string;
  buffetType: string;
  totalCustomerCount: number;
}

export default function OrderSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string, 10);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // ฟังก์ชันดึงข้อมูลรายการอาหาร
  const fetchOrderItems = async () => {
    try {
      const response = await fetch(`/api/order-menu?orderID=${orderId}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data: OrderItem[] = await response.json();
      setOrderItems(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลรายการอาหารได้');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายการอาหาร:', err);
    }
  };

  // ฟังก์ชันดึงข้อมูลออเดอร์
  const fetchOrderData = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data: OrderData = await response.json();
      setOrderData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลออเดอร์ได้');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOrderData(), fetchOrderItems()]);
      setLoading(false);
    };

    if (orderId) {
      loadData();
      
      // ตั้งค่าให้รีเฟรชข้อมูลทุก 30 วินาที
      const interval = window.setInterval(() => {
        fetchOrderItems();
      }, 30000);
      
      setRefreshInterval(interval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [orderId]);

  // แปลงสถานะเป็นภาษาไทย
  const getThaiMenuStatus = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'รอดำเนินการ';
      case 'COOKING': return 'กำลังปรุง';
      case 'SERVED': return 'เสิร์ฟแล้ว';
      case 'CANCELLED': return 'ยกเลิกแล้ว';
      default: return status;
    }
  };

  // กำหนดสีของสถานะ
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COOKING': return 'bg-blue-100 text-blue-800';
      case 'SERVED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getThaiOrderStatus = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'รอดำเนินการ';
      case 'IN_PROGRESS': return 'กำลังดำเนินการ';
      case 'COMPLETED': return 'เสร็จสิ้น';
      case 'CANCELLED': return 'ยกเลิกแล้ว';
      default: return status;
    }
  };

  const handleRefresh = () => {
    fetchOrderItems();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-xl font-semibold">กำลังโหลดข้อมูล...</div>
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-8 text-center shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-red-600">ไม่สามารถดูรายการอาหารได้</h2>
          <p className="mb-4 text-gray-700">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-yellow-50 p-8 text-center shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-yellow-600">ไม่พบข้อมูลออเดอร์</h2>
          <p className="mb-4 text-gray-700">ไม่พบออเดอร์ที่มีรหัส: {orderId}</p>
          <p className="text-gray-700">กรุณาติดต่อพนักงานเพื่อขอความช่วยเหลือ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <header className="mb-6 border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">รายการอาหารที่สั่งแล้ว</h1>
          <div className="text-right">
            <p className="text-sm text-gray-600">โต๊ะ: {orderData.table}</p>
            <p className="text-sm text-gray-600">{orderData.buffetType}</p>
          </div>
        </div>
      </header>

      <div className="mb-6 rounded-lg bg-blue-50 p-4">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <p className="font-medium">
              สถานะออเดอร์:
              <span
                className={`ml-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                  orderData.orderStatus === 'COMPLETED'
                    ? 'bg-green-100 text-green-800'
                    : orderData.orderStatus === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-blue-800'
                    : orderData.orderStatus === 'CANCELLED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {getThaiOrderStatus(orderData.orderStatus)}
              </span>
            </p>
            <p className="text-sm text-gray-600">จำนวนลูกค้า: {orderData.totalCustomerCount} ท่าน</p>
          </div>
          <Link
            href={`/user/menu/${orderData.orderItemId}`}
            className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 sm:mt-0"
          >
            สั่งอาหารเพิ่ม
          </Link>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">รายการอาหารทั้งหมด</h2>
        <button 
          onClick={handleRefresh}
          className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
        >
          รีเฟรชข้อมูล
        </button>
      </div>

      {orderItems.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รายการ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orderItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.menuItem.itemImage && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={item.menuItem.itemImage} 
                            alt={item.menuItem.menuItemNameTHA} 
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.menuItem.menuItemNameTHA}</div>
                        <div className="text-sm text-gray-500">{item.menuItem.menuItemNameENG}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.Quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ฿{(item.menuItem.menuItemsPrice * item.Quantity).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.menuStatus)}`}>
                      {getThaiMenuStatus(item.menuStatus)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">ยังไม่มีรายการอาหารที่สั่ง</p>
          <Link 
            href={`/user/menu/${orderData.orderItemId}`}
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            กลับไปสั่งอาหาร
          </Link>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>ข้อมูลจะรีเฟรชอัตโนมัติทุก 30 วินาที</p>
      </div>
    </div>
  );
}