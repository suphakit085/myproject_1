'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import Link from 'next/link';

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
  const router = useRouter();
  const orderId = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
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

        // สร้าง QR Code จาก URL
        if (data.qrCode) {
          const qrCodeDataUrl = await QRCode.toDataURL(data.qrCode);
          setQrCodeImage(qrCodeDataUrl);
        } else if (data.orderItemId) {
          // ถ้าไม่มี qrCode แต่มี orderItemId ให้สร้าง URL จาก orderItemId
          const menuUrl = `${window.location.origin}/user/menu/${data.orderItemId}`;
          const qrCodeDataUrl = await QRCode.toDataURL(menuUrl);
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

  // ฟังก์ชั่นสำหรับการพิมพ์
  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;

      // สร้าง stylesheet สำหรับการพิมพ์
      const printStyles = `
        <style>
          @media print {
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
            }
            .print-info {
              margin-bottom: 15px;
            }
            .print-qr {
              text-align: center;
              margin: 20px 0;
            }
            .print-qr img {
              width: 150px;
              height: 150px;
            }
            .print-footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      `;

      // เตรียมเนื้อหาสำหรับพิมพ์
      document.body.innerHTML = printStyles + `
        <div class="print-wrapper">
          <div class="print-header">
            <h1>ร้านอาหารของเรา</h1>
            <h2>รายละเอียดออเดอร์ #${orderData?.orderID}</h2>
          </div>
          <div class="print-info">
            <p><strong>สถานะ:</strong> ${getThaiStatus(orderData?.orderStatus || '')}</p>
            <p><strong>โต๊ะ:</strong> ${orderData?.table}</p>
            <p><strong>พนักงาน:</strong> ${orderData?.employee}</p>
            <p><strong>ประเภทบุฟเฟต์:</strong> ${orderData?.buffetType}</p>
            <p><strong>จำนวนลูกค้า:</strong> ${orderData?.totalCustomerCount} ท่าน</p>
            <p><strong>ยอดรวม:</strong> ฿${orderData?.totalPrice.toLocaleString()}</p>
          </div>
          <div class="print-qr">
            <h3>สแกน QR Code เพื่อสั่งอาหาร</h3>
            <img src="${qrCodeImage}" alt="QR Code" />
          </div>
          <div class="print-footer">
            <p>ขอบคุณที่ใช้บริการ</p>
            <p>วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}</p>
          </div>
        </div>
      `;

      window.print();
      document.body.innerHTML = originalContents;
    }
  };

  // แปลงสถานะเป็นภาษาไทย
  const getThaiStatus = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'รอดำเนินการ';
      case 'IN_PROGRESS': return 'กำลังดำเนินการ';
      case 'COMPLETED': return 'เสร็จสิ้น';
      case 'CANCELLED': return 'ยกเลิกแล้ว';
      default: return status;
    }
  };

  // สีของสถานะ
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h2 className="mb-4 text-xl font-bold text-red-600">ไม่สามารถดึงข้อมูลออเดอร์ได้</h2>
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
          <Link 
            href="/"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6 px-4">
          <Link 
            href="/"
            className="flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
            </svg>
            กลับหน้าหลัก
          </Link>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
              <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
            </svg>
            พิมพ์ QR Code
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" ref={printRef}>
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold">รายละเอียดออเดอร์</h1>
            <p className="text-blue-100">Order #{orderData.orderID}</p>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">ข้อมูลทั่วไป</h2>
              <span 
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderData.orderStatus)}`}
              >
                {getThaiStatus(orderData.orderStatus)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-1">โต๊ะ</p>
                <p className="font-medium">{orderData.table}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">พนักงาน</p>
                <p className="font-medium">{orderData.employee}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">ประเภทบุฟเฟต์</p>
                <p className="font-medium">{orderData.buffetType}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">จำนวนลูกค้า</p>
                <p className="font-medium">{orderData.totalCustomerCount} ท่าน</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">ข้อมูลการชำระเงิน</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ราคาต่อท่าน</span>
                <span className="font-medium">฿{orderData.pricePerItem.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">จำนวนลูกค้า</span>
                <span className="font-medium">{orderData.totalCustomerCount} ท่าน</span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                <span className="text-lg font-medium">ยอดรวมทั้งสิ้น</span>
                <span className="text-lg font-bold text-blue-600">฿{orderData.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="p-6 flex flex-col items-center">
            <h2 className="text-lg font-medium mb-4 text-center">QR Code สำหรับสั่งอาหาร</h2>
            
            {qrCodeImage ? (
              <div className="text-center">
                <div className="bg-white border border-gray-200 rounded-lg p-4 inline-block">
                  <img src={qrCodeImage} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="mt-3 text-sm text-gray-600 max-w-xs mx-auto">
                  สแกน QR Code นี้เพื่อไปยังหน้าเมนูอาหารและเริ่มสั่งอาหารได้ทันที
                </p>
              </div>
            ) : (
              <div className="bg-red-50 text-red-600 rounded-lg p-4 w-full text-center">
                <p>ไม่สามารถสร้าง QR Code ได้</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 text-center text-gray-500 text-sm">
            <p>Order ID: {orderData.orderID} | Order Item ID: {orderData.orderItemId}</p>
            <p className="mt-1">วันที่ออกเอกสาร: {new Date().toLocaleDateString('th-TH')}</p>
          </div>
        </div>

      
        </div>
      </div>
   
  );
}