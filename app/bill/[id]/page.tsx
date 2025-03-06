"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';

interface Bill {
  billID: number;
  vat: number;
  paymentStatus: string;
  netAmount: number;
  grandTotal: number;
  discount: number;
  totalAmount: number;
  billCreateAt: string;
  billStatus: string;
  Orders_orderID: number;
  payment: {
    paymentID: number;
    paymentTypes: string;
    totalAmount: number;
  };
  order: {
    orderID: number;
    orderStatus: string;
    totalCustomerCount: number;
    buffetType: {
      buffetTypeID: number;
      buffetTypesName: string;
      price: number;
    };
    table: {
      tabID: number;
      tabTypes: string;
    };
    employee: {
      empID: number;
      empFname: string;
      empLname: string;
    };
  };
}

const BillDetailPage: React.FC = () => {
  const router = useRouter();
  const { billId } = router.query;
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (billId) {
      fetchBillDetails();
    }
  }, [billId]);
  
  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bills/${billId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bill details');
      }
      const data = await response.json();
      setBill(data);
    } catch (err) {
      setError('Failed to fetch bill details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Function to handle printing the bill
  const handlePrintBill = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !bill) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error || 'Bill not found'}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden">
        <Navbar />
        <div className="h-8"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Header with Print Button */}
          <div className="flex justify-between items-center mb-8 print:hidden">
            <h1 className="text-3xl font-bold text-gray-800">รายละเอียดบิล #{bill.billID}</h1>
            <div className="flex space-x-4">
              <button
                onClick={handlePrintBill}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm transition-colors flex items-center"
              >
                <span className="mr-2">🖨️</span> พิมพ์บิล
              </button>
              <Link href="/admin/order-manage">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm transition-colors">
                  กลับไปยังหน้าออร์เดอร์
                </button>
              </Link>
            </div>
          </div>
          
          {/* Print-friendly header */}
          <div className="hidden print:block text-center mb-8">
            <h1 className="text-3xl font-bold">ใบเสร็จรับเงิน</h1>
            <p className="text-lg mt-2">ร้านอาหารบุฟเฟต์</p>
            <p className="text-sm mt-1">123 ถนนสุขุมวิท กรุงเทพฯ 10110</p>
            <p className="text-sm">โทร: 02-123-4567</p>
          </div>
          
          {/* Bill Info */}
          <div className="border-b pb-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">เลขที่บิล:</span> #{bill.billID}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">วันที่:</span> {formatDate(bill.billCreateAt)}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">สถานะการชำระเงิน:</span> {bill.paymentStatus === 'PAID' ? 'ชำระแล้ว' : 'รอชำระ'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">ออร์เดอร์:</span> #{bill.Orders_orderID}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">โต๊ะ:</span> {bill.order.table.tabTypes}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">พนักงาน:</span> {bill.order.employee.empFname} {bill.order.employee.empLname}
                </p>
              </div>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">รายละเอียดออร์เดอร์</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 font-medium">ประเภทบุฟเฟต์:</span>
                <span>{bill.order.buffetType.buffetTypesName}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 font-medium">ราคาต่อท่าน:</span>
                <span>{bill.order.buffetType.price.toFixed(2)} บาท</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 font-medium">จำนวนลูกค้า:</span>
                <span>{bill.order.totalCustomerCount} ท่าน</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600 font-medium">รวมค่าอาหาร:</span>
                <span>{bill.totalAmount.toFixed(2)} บาท</span>
              </div>
            </div>
          </div>
          
          {/* Bill Summary */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">สรุปค่าใช้จ่าย</h2>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ยอดรวมก่อนภาษี:</span>
                  <span>{bill.netAmount.toFixed(2)} บาท</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ภาษีมูลค่าเพิ่ม ({bill.vat}%):</span>
                  <span>{((bill.netAmount * bill.vat) / 100).toFixed(2)} บาท</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ส่วนลด:</span>
                  <span>{bill.discount.toFixed(2)} บาท</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-800 font-bold">ยอดรวมทั้งสิ้น:</span>
                  <span className="font-bold text-xl text-blue-600">{bill.grandTotal.toFixed(2)} บาท</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">วิธีการชำระเงิน:</span>
                  <span>{
                    bill.payment.paymentTypes === 'CASH' ? 'เงินสด' :
                    bill.payment.paymentTypes === 'CREDIT_CARD' ? 'บัตรเครดิต' :
                    bill.payment.paymentTypes === 'TRANSFER' ? 'โอนเงิน' :
                    bill.payment.paymentTypes === 'QR_CODE' ? 'คิวอาร์โค้ด' :
                    bill.payment.paymentTypes
                  }</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer for print only */}
          <div className="hidden print:block text-center mt-12 pt-6 border-t">
            <p className="text-sm">ขอบคุณที่ใช้บริการ</p>
            <p className="text-xs mt-2">เอกสารนี้เป็นใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetailPage;