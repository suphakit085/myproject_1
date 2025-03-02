'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    category: string;
  };
  order: {
    orderID: number;
    table: {
      tabID: number;
      tabTypes: string;
    };
  };
}

export default function AdminMenuPage() {
  const router = useRouter();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('PENDING');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // ดึงรายการอาหารทั้งหมด
  const fetchOrderItems = async () => {
    try {
      const response = await fetch('/api/admin/order-menu');
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data: OrderItem[] = await response.json();
      setOrderItems(data);
      filterItems(data, filter);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลรายการอาหารได้');
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายการอาหาร:', err);
    } finally {
      setLoading(false);
    }
  };

  // กรองรายการตามสถานะ
  const filterItems = (items: OrderItem[], status: string) => {
    if (status === 'ALL') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.menuStatus === status));
    }
  };

  useEffect(() => {
    fetchOrderItems();
    
    // ตั้งค่าให้รีเฟรชข้อมูลทุก 15 วินาที
    const interval = window.setInterval(() => {
      fetchOrderItems();
    }, 15000);
    
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  useEffect(() => {
    filterItems(orderItems, filter);
  }, [filter, orderItems]);

  // แปลงสถานะเป็นภาษาไทย
  const getThaiMenuStatus = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'รอดำเนินการ';
      case 'SERVED': return 'เสิร์ฟแล้ว';
      case 'CANCELLED': return 'ยกเลิกแล้ว';
      default: return status;
    }
  };

  // กำหนดสีของสถานะ
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SERVED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // อัปเดตสถานะของรายการอาหาร
  const updateMenuStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/order-menu/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menuStatus: newStatus }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถอัปเดตสถานะได้');
      }

      // อัปเดตข้อมูลในสเตท
      const updatedItem = await response.json();
      setOrderItems(orderItems.map(item => 
        item.id === id ? {...item, menuStatus: newStatus} : item
      ));
      
      // แสดงข้อความสำเร็จ
      alert(`อัปเดตสถานะเมนู ${updatedItem.menuItem.menuItemNameTHA} เป็น ${getThaiMenuStatus(newStatus)} เรียบร้อยแล้ว`);
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ:', err);
      alert('ไม่สามารถอัปเดตสถานะได้');
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
          <h2 className="mb-4 text-xl font-bold text-red-600">ไม่สามารถดึงข้อมูลรายการอาหารได้</h2>
          <p className="mb-4 text-gray-700">{error}</p>
          <button
            onClick={handleRefresh}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      <header className="mb-6 border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">จัดการรายการอาหาร (ครัว)</h1>
          <button 
            onClick={handleRefresh}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            รีเฟรชข้อมูล
          </button>
        </div>
      </header>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`rounded-md px-4 py-2 ${filter === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`rounded-md px-4 py-2 ${filter === 'PENDING' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800'}`}
          >
            รอดำเนินการ
          </button>
          <button
            onClick={() => setFilter('SERVED')}
            className={`rounded-md px-4 py-2 ${filter === 'SERVED' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
          >
            เสิร์ฟแล้ว
          </button>
          <button
            onClick={() => setFilter('CANCELLED')}
            className={`rounded-md px-4 py-2 ${filter === 'CANCELLED' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'}`}
          >
            ยกเลิกแล้ว
          </button>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">โต๊ะ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เมนู</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.order.table.tabTypes} - {item.order.table.tabID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.menuItem.menuItemNameTHA}</div>
                    <div className="text-xs text-gray-500">{item.menuItem.menuItemNameENG}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.Quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.menuItem.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.menuStatus)}`}>
                      {getThaiMenuStatus(item.menuStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {item.menuStatus === 'PENDING' && (
                        <button
                          onClick={() => updateMenuStatus(item.id, 'SERVED')}
                          className="text-green-600 hover:text-green-900 bg-green-100 px-2 py-1 rounded"
                        >
                          เสิร์ฟแล้ว
                        </button>
                      )}
                      {item.menuStatus === 'PENDING' && (
                        <button
                          onClick={() => updateMenuStatus(item.id, 'CANCELLED')}
                          className="text-red-600 hover:text-red-900 bg-red-100 px-2 py-1 rounded"
                        >
                          ยกเลิก
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">ไม่มีรายการอาหารที่ตรงกับเงื่อนไข</p>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>ข้อมูลจะรีเฟรชอัตโนมัติทุก 15 วินาที</p>
      </div>
    </div>
  );
}