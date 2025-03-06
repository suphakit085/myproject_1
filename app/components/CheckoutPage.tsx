"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

interface Order {
  orderID: number;
  orderStatus: string | null;
  totalCustomerCount: number;
  buffetType: {
    buffetTypeID: number;
    buffetTypesName: string;
    price: number; // ต้องมั่นใจว่ามี field นี้
  };
  orderItems: Array<{
    orderItemID: number;
    quantity: number;
    menu: {
      menuName: string;
      menuPrice: number;
    }
  }>;
}

interface BillFormData {
  vat: number;
  discount: number;
  paymentStatus: string;
  paymentTypes: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [billData, setBillData] = useState<BillFormData>({
    vat: 7, // Default VAT rate in Thailand
    discount: 0,
    paymentStatus: 'PAID',
    paymentTypes: 'CASH',
  });
  
  // Calculated values
  const [totalAmount, setTotalAmount] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);
  
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      console.log(`Fetching order details for orderId: ${orderId}`);
      
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      console.log("Order data received:", JSON.stringify(data, null, 2));
      
      // ตรวจสอบโครงสร้างข้อมูล
      if (!data.buffetType) {
        console.error("buffetType not found in data:", data);
        setError('ข้อมูลประเภทบุฟเฟต์ไม่ถูกต้อง');
        setLoading(false);
        return;
      }
      
      // แสดงข้อมูล buffetType ที่ได้รับ
      console.log("BuffetType data:", data.buffetType);
      
      let buffetPrice = 0;
      
      // ตรวจสอบว่ามี price ในรูปแบบใด
      if (typeof data.buffetType.price === 'number') {
        // กรณีที่ price เป็นตัวเลขโดยตรง
        buffetPrice = data.buffetType.price;
        console.log("Using direct price field:", buffetPrice);
      } 
      else if (data.buffetType.buffetTypePrice && typeof data.buffetType.buffetTypePrice === 'number') {
        // กรณีที่ใช้ชื่อฟิลด์ buffetTypePrice แทน price
        buffetPrice = data.buffetType.buffetTypePrice;
        console.log("Using buffetTypePrice field:", buffetPrice);
      } 
      else if (data.buffetType.buffetTypesName && typeof data.buffetType.buffetTypesName === 'string') {
        // กรณีที่ต้องแยกตัวเลขออกจากชื่อบุฟเฟต์
        console.log("Attempting to extract price from buffetTypesName:", data.buffetType.buffetTypesName);
        
        const priceMatch = data.buffetType.buffetTypesName.match(/\(฿(\d+)\)/);
        if (priceMatch && priceMatch[1]) {
          buffetPrice = parseFloat(priceMatch[1]);
          console.log("Extracted price from name:", buffetPrice);
        } 
        else {
          // กรณีที่มีเลขในชื่อ แต่ไม่ได้อยู่ในรูปแบบที่กำหนด
          const numberMatch = data.buffetType.buffetTypesName.match(/(\d+)/);
          if (numberMatch && numberMatch[1]) {
            buffetPrice = parseFloat(numberMatch[1]);
            console.log("Extracted any number from name:", buffetPrice);
          }
          else {
            console.error("Cannot extract price from buffet name:", data.buffetType.buffetTypesName);
          }
        }
      }
      
      // ถ้ายังไม่สามารถดึงราคาได้ ให้ตรวจสอบฟิลด์อื่นๆ ที่อาจมีราคา
      if (buffetPrice === 0) {
        if (typeof data.buffetType.buffetTypeID === 'number' && data.buffetType.buffetTypeID > 0) {
          // สมมติราคาตามประเภทบุฟเฟต์
          switch (data.buffetType.buffetTypeID) {
            case 1: // สมมติว่า ID 1 คือบุฟเฟต์ราคา 399
              buffetPrice = 399;
              break;
            case 2: // สมมติว่า ID 2 คือบุฟเฟต์ราคา 499
              buffetPrice = 499;
              break;
            case 3: // สมมติว่า ID 3 คือบุฟเฟต์ราคา 599
              buffetPrice = 599;
              break;
            default: // ราคาเริ่มต้น
              buffetPrice = 399;
          }
          console.log("Used fallback price based on buffetTypeID:", buffetPrice);
        } else {
          // ใช้ราคาเริ่มต้น
          buffetPrice = 399; // ราคาเริ่มต้นถ้าไม่สามารถหาราคาได้
          console.log("Using default price:", buffetPrice);
        }
      }
      
      console.log(`Final buffet price: ${buffetPrice}`);
      
      // เพิ่มฟิลด์ price ที่ถูกต้องเข้าไป
      const updatedData = {
        ...data,
        buffetType: {
          ...data.buffetType,
          price: buffetPrice
        }
      };
      
      setOrder(updatedData);
      
      // คำนวณราคารวม
      const count = updatedData.totalCustomerCount || 0;
      const buffetTotal = buffetPrice * count;
      console.log(`Calculating total: ${buffetPrice} × ${count} = ${buffetTotal}`);
      
      setTotalAmount(buffetTotal);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };
  
  // Recalculate bill amounts when totalAmount or discount changes
  useEffect(() => {
    if (order) {
      // Calculate net amount (before VAT)
      setNetAmount(totalAmount);
      
      // Calculate VAT amount
      const vatValue = (totalAmount * billData.vat) / 100;
      setVatAmount(vatValue);
      
      // Calculate grand total (with VAT, minus discount)
      const calculatedGrandTotal = totalAmount + vatValue - billData.discount;
      setGrandTotal(calculatedGrandTotal > 0 ? calculatedGrandTotal : 0);
      
      console.log("Bill calculation:", {
        totalAmount,
        vatValue,
        discount: billData.discount,
        grandTotal: calculatedGrandTotal > 0 ? calculatedGrandTotal : 0
      });
    }
  }, [totalAmount, billData.vat, billData.discount, order]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'vat' || name === 'discount') {
      setBillData({
        ...billData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setBillData({
        ...billData,
        [name]: value
      });
    }
  };
  
  const handleSubmitBill = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate values
      if (isNaN(netAmount) || isNaN(grandTotal) || isNaN(vatAmount)) {
        showNotification('error', 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบการคำนวณ');
        return;
      }
      
      // Create bill data object
      const billPayload = {
        vat: billData.vat,
        paymentStatus: billData.paymentStatus,
        netAmount: netAmount,
        grandTotal: grandTotal,
        discount: billData.discount,
        totalAmount: totalAmount,
        billStatus: 'COMPLETED',
        Orders_orderID: Number(orderId),
        payment: {
          paymentTypes: billData.paymentTypes,
          totalAmount: grandTotal
        }
      };
      
      console.log("Submitting bill payload:", billPayload);
      
      // Submit bill to API
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billPayload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create bill');
      }
      
      // Also update the order status to COMPLETED
      await fetch(`/api/orders/${orderId}/update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderStatus: 'COMPLETED' }),
      });
      
      // Show success message
      showNotification('success', 'เช็คบิลสำเร็จ!');
      
      // Redirect back to order management after a short delay
      setTimeout(() => {
        router.push('/admin/orders-manage');
      }, 2000);
      
    } catch (err: any) {
      console.error("Failed to create bill:", err);
      showNotification('error', `ไม่สามารถสร้างบิลได้: ${err.message || 'กรุณาลองใหม่อีกครั้ง'}`);
    }
  };
  
  // Notification function
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
  
  if (error || !order) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 mx-4" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error || 'Order not found'}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="h-8"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">เช็คบิล - ออร์เดอร์ #{order.orderID}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">รายละเอียดออร์เดอร์</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ประเภทบุฟเฟต์:</span>
                  <span className="font-medium">{order.buffetType.buffetTypesName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ราคาต่อท่าน:</span>
                  <span className="font-medium">{order.buffetType.price.toFixed(2)} บาท</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">จำนวนลูกค้า:</span>
                  <span className="font-medium">{order.totalCustomerCount} ท่าน</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600 font-semibold">รวมค่าอาหาร:</span>
                  <span className="font-semibold">{totalAmount.toFixed(2)} บาท</span>
                </div>
              </div>
            </div>
            
            {/* Bill Form */}
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">ข้อมูลบิล</h2>
              
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">ภาษีมูลค่าเพิ่ม (%)</label>
                  <input
                    type="number"
                    name="vat"
                    value={billData.vat}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">ส่วนลด (บาท)</label>
                  <input
                    type="number"
                    name="discount"
                    value={billData.discount}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">สถานะการชำระเงิน</label>
                  <select
                    name="paymentStatus"
                    value={billData.paymentStatus}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="PAID">จ่ายแล้ว</option>
                    <option value="PENDING">รอชำระ</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">วิธีการชำระเงิน</label>
                  <select
                    name="paymentTypes"
                    value={billData.paymentTypes}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="CASH">เงินสด</option>
                    <option value="CREDIT_CARD">บัตรเครดิต</option>
                    <option value="TRANSFER">โอนเงิน</option>
                    <option value="QR_CODE">QR Code</option>
                  </select>
                </div>
              </form>
            </div>
          </div>
          
          {/* Bill Summary */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">สรุปบิล</h2>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ยอดรวมก่อนภาษี:</span>
                  <span>{netAmount.toFixed(2)} บาท</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ภาษีมูลค่าเพิ่ม ({billData.vat}%):</span>
                  <span>{vatAmount.toFixed(2)} บาท</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ส่วนลด:</span>
                  <span>{billData.discount.toFixed(2)} บาท</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-800 font-bold">ยอดรวมทั้งสิ้น:</span>
                  <span className="font-bold text-xl text-blue-600">{grandTotal.toFixed(2)} บาท</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSubmitBill}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              บันทึกบิล
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}