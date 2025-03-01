'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode'; // นำเข้า qrcode

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

export default function OrderPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string>(''); // เพิ่ม state สำหรับเก็บรูป QR Code
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setOrderData(data);

        // สร้าง QR Code จาก URL ใน data.qrCode
        if (data.qrCode) {
          const qrCodeDataUrl = await QRCode.toDataURL(data.qrCode);
          setQrCodeImage(qrCodeDataUrl);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลออเดอร์ได้');
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  if (loading) return <div>กำลังโหลด...</div>;
  if (error) return <div>เกิดข้อผิดพลาด: {error}</div>;
  if (!orderData) return <div>ไม่พบข้อมูลออเดอร์</div>;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-bold mb-4">ข้อมูลออเดอร์ #{orderData.orderID}</h1>
      <p>สถานะ: {orderData.orderStatus}</p>
      <p>โต๊ะ: {orderData.table}</p>
      <p>พนักงาน: {orderData.employee}</p>
      <p>ประเภทบุฟเฟต์: {orderData.buffetType}</p>
      <p>จำนวนลูกค้า: {orderData.totalCustomerCount}</p>
      <p>ยอดรวม: ฿{orderData.totalPrice}</p>

      {/* แสดง QR Code */}
      {qrCodeImage ? (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">QR Code สำหรับสั่งอาหาร:</h2>
          <img src={qrCodeImage} alt="QR Code" className="mt-2 w-32 h-32" />
          <p className="text-sm text-gray-600">สแกนเพื่อไปที่หน้าเมนู</p>
        </div>
      ) : (
        <p className="mt-4 text-red-600">ไม่สามารถสร้าง QR Code ได้</p>
      )}
    </div>
  );
}