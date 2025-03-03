// app/test-auth/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestAuth() {
  const [token, setToken] = useState<string>('');
  const [path, setPath] = useState<string>('');
  const router = useRouter();
  
  // สร้าง sample token สำหรับการทดสอบ
  // ในสถานการณ์จริง นี่เป็นเพียงตัวอย่างสำหรับการทดสอบเท่านั้น
  // ควรใช้ JWT ที่ถูกต้องจากระบบ authentication ของคุณ
  
  // User token (ID: 1) - Payload: {"role":"user","userId":1}
  const testUserToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsInVzZXJJZCI6MX0.Jv4ogh4XUoZ8EnIlS7q0ykXcOMbd4uNIvl_efJH8Ajk';
  
  // User token (ID: 2) - Payload: {"role":"user","userId":2}
  const testUser2Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsInVzZXJJZCI6Mn0.B3Fr9EdTa8eXnLrQJc9Id9Gj53smVlAz4UVbZ15dJwQ';
  
  // Cashier token - Payload: {"role":"cashier","userId":99}
  const testCashierToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiY2FzaGllciIsInVzZXJJZCI6OTl9.DkHRrEqV7y1NV5VCMK9kUI0oF-DP0piLnZJQrPJGPEQ';
  
  const setCookie = (token: string) => {
    document.cookie = `auth_token=${token}; path=/`;
    setToken(token);
  };
  
  const clearCookie = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setToken('');
  };
  
  const navigate = () => {
    if (path) {
      router.push(path);
    }
  };
  
  // แยกข้อมูลจาก token สำหรับแสดงผล
  const getTokenInfo = (token: string): string => {
    if (!token) return 'ไม่มี token';
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return `Role: ${payload.role}, UserID: ${payload.userId}`;
    } catch (e) {
      return 'Invalid token';
    }
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">ทดสอบ Middleware Authentication</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">1. เลือก Token</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <button 
            onClick={() => setCookie(testUserToken)} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            ตั้งค่า User Token (ID: 1)
          </button>
          
          <button 
            onClick={() => setCookie(testUser2Token)} 
            className="bg-blue-300 hover:bg-blue-400 text-white px-4 py-2 rounded-lg transition"
          >
            ตั้งค่า User Token (ID: 2)
          </button>
          
          <button 
            onClick={() => setCookie(testCashierToken)} 
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
          >
            ตั้งค่า Cashier Token
          </button>
        </div>
        
        <button 
          onClick={clearCookie} 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition w-full"
        >
          ลบ Token (Logout)
        </button>
        
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="font-medium">สถานะปัจจุบัน: {getTokenInfo(token)}</p>
          {token && (
            <p className="text-xs text-gray-500 mt-1 break-all">
              Token: {token}
            </p>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">2. ทดสอบเส้นทาง</h2>
        
        <div className="mb-4">
          <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-1">ใส่เส้นทางที่ต้องการทดสอบ:</label>
          <input
            id="path"
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="เช่น /admin/menu หรือ /user/menu/1"
            className="w-full p-2 border rounded-lg"
          />
        </div>
        
        <button 
          onClick={navigate} 
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition w-full"
        >
          ไปยังเส้นทาง
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">เส้นทางทดสอบสำหรับคลิก:</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-blue-800 mb-2 border-b pb-1">เส้นทางแคชเชียร์:</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setPath('/')} className="text-blue-600 hover:underline">
                  หน้าหลัก (/)
                </button>
              </li>
              <li>
                <button onClick={() => setPath('/admin/menu')} className="text-blue-600 hover:underline">
                  /admin/menu
                </button>
              </li>
              <li>
                <button onClick={() => setPath('/admin/orders-manage')} className="text-blue-600 hover:underline">
                  /admin/orders-manage
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-blue-800 mb-2 border-b pb-1">เส้นทางผู้ใช้:</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setPath('/user/menu/1')} className="text-blue-600 hover:underline">
                  /user/menu/1 (User ID 1)
                </button>
              </li>
              <li>
                <button onClick={() => setPath('/user/menu/2')} className="text-blue-600 hover:underline">
                  /user/menu/2 (User ID 2)
                </button>
              </li>
              <li>
                <button onClick={() => setPath('/user/order-summary/1')} className="text-blue-600 hover:underline">
                  /user/order-summary/1 (User ID 1)
                </button>
              </li>
              <li>
                <button onClick={() => setPath('/user/order-summary/2')} className="text-blue-600 hover:underline">
                  /user/order-summary/2 (User ID 2)
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>ข้อควรระวัง: หน้านี้ใช้สำหรับการทดสอบเท่านั้น ไม่ควรใช้ในระบบที่มีการใช้งานจริง</p>
        <p>Token ที่ใช้ในตัวอย่างนี้เป็นเพียงตัวอย่างและไม่ได้มีการเข้ารหัสที่ปลอดภัย</p>
      </div>
    </div>
  );
}