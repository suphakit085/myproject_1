'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchMenuItems } from '@/lib/api';

interface OrderData {
  orderID: number;
  orderItemId: string;
  orderStatus: string;
  Tables_tabID: number;
  Employee_empID: number;
  BuffetTypes_buffetTypeID: number;
  totalCustomerCount: number;
  qrCode: string;
  table: string;
  employee: string;
  buffetType: string;
  pricePerItem: number;
  totalPrice: number;
}

interface MenuItem {
  menuItemsID: number;
  menuItemNameTHA: string;
  menuItemNameENG: string;
  menuItemsPrice: number;
  itemImage: string;
  description: string | null;
  category: string;
  BuffetTypes_buffetTypeID: number;
}

interface CartItem {
  menuItemsID: number;
  name: string;
  price: number;
  quantity: number;
}

interface Category {
  name: string;
  icon: string;
  color: string;
}

export default function MenuOrderPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.id as string;

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuData = useCallback(
    async (category?: string) => {
      if (!orderData?.BuffetTypes_buffetTypeID) {
        console.log('BuffetTypes_buffetTypeID is undefined:', orderData);
        setError('ไม่สามารถดึงข้อมูลบุฟเฟต์ได้');
        return;
      }

      try {
        console.log('Fetching menu with buffetTypeId:', orderData.BuffetTypes_buffetTypeID, 'category:', category);
        const data: MenuItem[] = await fetchMenuItems(orderData.BuffetTypes_buffetTypeID, category);
        console.log('Fetched menuItems:', data);
        setMenuItems(data);
        setError(data.length === 0 ? 'ไม่มีเมนูที่ตรงกับประเภทบุฟเฟต์นี้' : null);
      } catch (err: unknown) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเมนู:', err);
        setError('ไม่สามารถดึงข้อมูลเมนูได้');
      }
    },
    [orderData]
  );

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data: OrderData = await response.json();
        console.log('Fetched orderData:', data);
        setOrderData(data);
        if (data.orderStatus === 'CANCELLED') {
          setError('ออเดอร์นี้ถูกยกเลิกแล้ว ไม่สามารถสั่งอาหารได้');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลออเดอร์ได้');
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์:', err);
      }
    };

    const loadData = async () => {
      await fetchOrderData();
      setLoading(false);
    };

    if (orderId) loadData();
  }, [orderId]);

  useEffect(() => {
    const category = searchParams.get('category');
    if (orderData) fetchMenuData(category || undefined);
  }, [orderData, searchParams, fetchMenuData]);

  const addToCart = (menuItem: MenuItem): void => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.menuItemsID === menuItem.menuItemsID);
      if (existingItem) {
        return prevCart.map((item) =>
          item.menuItemsID === menuItem.menuItemsID ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        { menuItemsID: menuItem.menuItemsID, name: menuItem.menuItemNameTHA, price: menuItem.menuItemsPrice, quantity: 1 },
      ];
    });
  };

  const removeFromCart = (menuItemsID: number): void => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.menuItemsID === menuItemsID);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) =>
          item.menuItemsID === menuItemsID ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevCart.filter((item) => item.menuItemsID !== menuItemsID);
    });
  };

  const handleSubmitOrder = async (): Promise<void> => {
    if (cart.length === 0) {
      alert('กรุณาเพิ่มเมนูลงในตะกร้าก่อน');
      return;
    }

    setLoading(true);

    try {
      // เตรียมข้อมูลที่จะส่งไปยัง API
      const orderDataToSubmit = {
        orderID: orderData!.orderID,
        items: cart.map((item) => ({ menuItemsID: item.menuItemsID, quantity: item.quantity })),
      };

      // บันทึกข้อมูลรายการอาหารผ่าน API
      const response = await fetch('/api/order-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ไม่สามารถบันทึกรายการอาหารได้');
      }

      const result = await response.json();
      console.log('บันทึกรายการอาหารเรียบร้อย:', result);

      // ล้างตะกร้าหลังจากสั่งอาหารเรียบร้อยแล้ว
      setCart([]);
      
      // แสดงข้อความสำเร็จ
      alert('สั่งอาหารเรียบร้อยแล้ว กรุณารอสักครู่');
      
      // นำผู้ใช้ไปยังหน้าสรุปออเดอร์
      router.push(`/user/order-summary/${orderData!.orderID}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสั่งอาหาร';
      console.error('เกิดข้อผิดพลาดในการสั่งอาหาร:', error);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getThaiStatus = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'รอดำเนินการ';
      case 'IN_PROGRESS': return 'กำลังดำเนินการ';
      case 'COMPLETED': return 'เสร็จสิ้น';
      case 'CANCELLED': return 'ยกเลิกแล้ว';
      default: return status;
    }
  };

  const categories: Category[] =
    orderData?.BuffetTypes_buffetTypeID === 1
      ? [{ name: 'หมู', icon: '🐷', color: 'bg-pink-100 text-pink-600' }]
      : orderData?.BuffetTypes_buffetTypeID === 2
      ? [
          { name: 'หมู', icon: '🐷', color: 'bg-pink-100 text-pink-600' },
          { name: 'เนื้อ', icon: '🍖', color: 'bg-red-100 text-red-600' },
        ]
      : [];

  const cartTotal: number = cart.reduce((total, item) => total + item.price * item.quantity, 0);

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
          <h2 className="mb-4 text-xl font-bold text-red-600">ไม่สามารถเข้าสู่เมนูสั่งอาหาร</h2>
          <p className="mb-4 text-gray-700">{error}</p>
          <p className="mb-4 text-gray-500">orderItemId: {orderId}</p>
          <p className="mb-4 text-gray-500">กรุณาตรวจสอบว่า orderItemId นี้มีอยู่ในระบบ และ Foreign Key (Tables, Employee, BuffetTypes) สมบูรณ์</p>
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
          <h1 className="text-2xl font-bold">เมนูอาหาร</h1>
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
                {getThaiStatus(orderData.orderStatus)}
              </span>
            </p>
            <p className="text-sm text-gray-600">จำนวนลูกค้า: {orderData.totalCustomerCount} ท่าน</p>
          </div>
          <Link
            href={`/user/order-summary/${orderData.orderID}`}
            className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 sm:mt-0"
          >
            ดูรายการที่สั่งแล้ว
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => router.push(`/user/menu/${orderId}?category=${category.name}`)}
            className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow-sm hover:bg-gray-50"
          >
            <div className={`mb-2 h-12 w-12 rounded-full ${category.color} flex items-center justify-center`}>
              <span className="text-xl">{category.icon}</span>
            </div>
            <span className="text-center text-sm font-medium">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold border-b border-gray-200 pb-2">เมนูแนะนำ</h2>
        {menuItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {menuItems.map((item) => (
              <div key={item.menuItemsID} className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="w-1/3">
                  {item.itemImage ? (
                    <img src={item.itemImage} alt={item.menuItemNameTHA} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                </div>
                <div className="w-2/3 p-4">
                  <h3 className="font-medium">{item.menuItemNameTHA}</h3>
                  <p className="mt-1 text-sm text-gray-600">{item.description || 'ไม่มีคำอธิบาย'}</p>
                  <p className="mt-1 text-sm font-medium">ราคา: ฿{item.menuItemsPrice.toLocaleString()}</p>
                  <button
                    onClick={() => addToCart(item)}
                    className="mt-2 rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                  >
                    เพิ่มรายการ
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">ไม่มีเมนูในขณะนี้</p>
        )}
      </div>

      {cart.length > 0 && (
        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <h2 className="text-lg font-semibold mb-2">ตะกร้าสินค้า</h2>
          <ul className="space-y-2">
            {cart.map((item) => (
              <li key={item.menuItemsID} className="flex justify-between items-center">
                <span>{item.name} (x{item.quantity})</span>
                <div className="flex items-center space-x-2">
                  <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                  <button onClick={() => removeFromCart(item.menuItemsID)} className="text-red-600 hover:text-red-800">
                    ลบ
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-lg font-bold">ยอดรวม: ฿{cartTotal.toLocaleString()}</p>
            <button
              onClick={handleSubmitOrder}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              สั่งอาหาร
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold">ยอดรวม (จากระบบ): ฿{orderData.totalPrice.toLocaleString()}</p>
          </div>
          <button
            onClick={handleSubmitOrder}
            className="rounded-md bg-green-600 px-4 py-2 text-white shadow-sm hover:bg-green-700"
          >
            สั่งอาหาร
          </button>
        </div>
      </div>
    </div>
  );
}