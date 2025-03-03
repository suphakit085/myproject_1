//ไม่ได้ใช้งาน
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { submitOrder } from '@/lib/api';

interface OrderItem {
  orderItemsID?: number;
  Orders_orderID: number;
  MenuItems_menuItemsID: number;
  quantity: number;
  status?: string;
  menuItemName: string;
  menuItemPrice: number;
  totalPrice: number;
}

interface OrderData {
  orderID: number;
  orderStatus: string;
  table: string;
  buffetType: string;
  totalCustomerCount: number;
  totalPrice: number;
  items: OrderItem[];
}

interface CartData {
  orderID: number;
  buffetTypeID: number;
  items: { menuItemsID: number; quantity: number }[];
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data: OrderData = await response.json();
        console.log('Fetched order data:', data);

        // ดึงข้อมูลตะกร้าจาก localStorage
        const cartData: CartData | null = JSON.parse(localStorage.getItem(`cart_${orderId}`) || 'null');
        if (cartData) {
          const itemsWithDetails = await Promise.all(
            cartData.items.map(async (item) => {
              const menuResponse = await fetch(`/api/menu/${item.menuItemsID}`);
              if (!menuResponse.ok) throw new Error(`Failed to fetch menu item ${item.menuItemsID}`);
              const menuItem = await menuResponse.json();
              return {
                Orders_orderID: cartData.orderID,
                MenuItems_menuItemsID: item.menuItemsID,
                quantity: item.quantity,
                menuItemName: menuItem.menuItemNameTHA || 'Unknown Item',
                menuItemPrice: menuItem.menuItemsPrice || 0,
                totalPrice: (menuItem.menuItemsPrice || 0) * item.quantity,
              };
            })
          );
          setOrderData({
            ...data,
            items: itemsWithDetails,
          });
        } else {
          setOrderData({ ...data, items: data.items || [] }); // ตรวจสอบ items จาก API
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลสรุปออเดอร์ได้');
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสรุปออเดอร์:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrderSummary();
  }, [orderId]);

  const handleConfirmOrder = async (): Promise<void> => {
    if (!orderData) return;

    setProcessing(true);
    try {
      const cartData: CartData | null = JSON.parse(localStorage.getItem(`cart_${orderId}`) || 'null');
      if (!cartData) throw new Error('ไม่พบข้อมูลตะกร้า');

      await submitOrder(cartData);
      alert('ยืนยันคำสั่งซื้อสำเร็จ! กรุณารอเสิร์ฟอาหาร');
      localStorage.removeItem(`cart_${orderId}`);
      router.push(`/user/order-summary/${orderId}`);
    } catch (err: unknown) {
      console.error('เกิดข้อผิดพลาดในการยืนยันออเดอร์:', err);
      alert('เกิดข้อผิดพลาดในการยืนยันออเดอร์: ' + (err instanceof Error ? err.message : 'ไม่ทราบสาเหตุ'));
    } finally {
      setProcessing(false);
    }
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
          <h2 className="mb-4 text-xl font-bold text-red-600">ไม่สามารถเข้าถึงหน้าชำระเงิน</h2>
          <p className="mb-4 text-gray-700">{error}</p>
          <p className="mb-4 text-gray-500">orderID: {orderId}</p>
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
          <h1 className="text-2xl font-bold">ยืนยันการสั่งอาหาร</h1>
          <div className="text-right">
            <p className="text-sm text-gray-600">โต๊ะ: {orderData.table}</p>
            <p className="text-sm text-gray-600">{orderData.buffetType}</p>
          </div>
        </div>
      </header>

      <div className="mb-6 rounded-lg bg-green-50 p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-green-800">ตรวจสอบรายการอาหารของคุณ</h2>
          <p className="mt-2 text-gray-700">กรุณาตรวจสอบรายการอาหารให้ถูกต้องก่อนยืนยันการสั่ง</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold border-b border-gray-200 pb-2">รายการอาหารที่สั่ง</h2>
        {(orderData.items && orderData.items.length > 0) ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 text-left">รายการ</th>
                  <th className="border border-gray-200 px-4 py-2 text-center">จำนวน</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">ราคา/ชิ้น</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">ราคารวม</th>
                </tr>
              </thead>
              <tbody>
                {orderData.items.map((item, index) => (
                  <tr key={item.orderItemsID || index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">{item.menuItemName}</td>
                    <td className="border border-gray-200 px-4 py-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-200 px-4 py-2 text-right">฿{item.menuItemPrice.toLocaleString()}</td>
                    <td className="border border-gray-200 px-4 py-2 text-right">฿{item.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-medium">
                <tr>
                  <td colSpan={3} className="border border-gray-200 px-4 py-2 text-right">ยอดรวมทั้งสิ้น:</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">฿{orderData.totalPrice.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-600">ยังไม่มีรายการอาหารที่สั่ง</p>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Link
          href={`/user/menu/${orderId}`}
          className="rounded-md bg-gray-600 px-4 py-2 text-white shadow-sm hover:bg-gray-700"
        >
          กลับไปเมนูอาหาร
        </Link>
        <button
          onClick={handleConfirmOrder}
          disabled={processing || !orderData.items || orderData.items.length === 0}
          className={`rounded-md px-4 py-2 text-white shadow-sm ${
            processing || !orderData.items || orderData.items.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {processing ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งอาหาร'}
        </button>
      </div>

      <div className="mt-8 rounded-lg bg-yellow-50 p-4">
        <h3 className="font-medium text-yellow-800">หมายเหตุ:</h3>
        <ul className="mt-2 list-disc pl-5 space-y-1 text-gray-700">
          <li>เมื่อยืนยันคำสั่งซื้อแล้ว คำสั่งของคุณจะถูกส่งไปยังครัวเพื่อเริ่มปรุงอาหาร</li>
          <li>คุณสามารถตรวจสอบสถานะของคำสั่งซื้อได้ที่หน้าสรุปรายการอาหาร</li>
          <li>หากต้องการเพิ่มรายการอาหาร คุณสามารถกลับไปที่หน้าเมนูและสั่งเพิ่มได้</li>
        </ul>
      </div>
    </div>
  );
}