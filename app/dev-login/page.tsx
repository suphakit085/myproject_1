'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DevLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // รหัสผ่านสำหรับโหมด developer
  const devPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD || 'dev123456';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === devPassword) {
      // ตั้งค่า cookie สำหรับโหมด developer แบบไม่ใช้ js-cookie
      document.cookie = `dev_mode=true;path=/;max-age=${60*60*24}`; // หมดอายุใน 1 วัน
      
      // redirect ไปยังหน้าแรก หรือหน้าที่ต้องการ
      router.push('/');
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Developer Login</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              รหัสผ่าน Developer
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}