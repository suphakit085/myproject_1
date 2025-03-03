// app/components/Navbar.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // ตรวจสอบการเลื่อนหน้าจอเพื่อเปลี่ยนสี navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // เช็คว่าลิงก์ปัจจุบันตรงกับ path หรือไม่
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg dark:bg-gray-900' : 'bg-white/90 backdrop-blur-sm dark:bg-gray-800/90'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo และเมนูด้านซ้าย */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-bold text-lg text-gray-800 dark:text-white">
                Buffet<span className="text-blue-500">Hub</span>
              </span>
            </Link>
            
            {/* เมนูสำหรับหน้าจอขนาดใหญ่ */}
            <div className="hidden md:block ml-6">
              <div className="flex items-center space-x-1">
                <Link 
                  href="/" 
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                    isActive('/') 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                >
                  หน้าหลัก
                </Link>
                <Link 
                  href="/order" 
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                    isActive('/order') 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                >
                  สั่งอาหาร
                </Link>
                <Link 
                  href="/menu" 
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                    isActive('/menu') 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                >
                  เมนูอาหาร
                </Link>
                <div className="relative group">
                  <button className="px-3 py-1 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors duration-200 flex items-center">
                    <span>จัดการ</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left">
                    <Link 
                      href="/admin/orders-manage" 
                      className={`block px-3 py-1.5 text-xs ${
                        isActive('/admin/orders-manage') 
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      จัดการออเดอร์
                    </Link>
                    <Link 
                      href="/admin/menu" 
                      className={`block px-3 py-1.5 text-xs ${
                        isActive('/admin/menu') 
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      จัดการเมนู
                    </Link>
                    <Link 
                      href="/admin/tables" 
                      className={`block px-3 py-1.5 text-xs ${
                        isActive('/admin/tables') 
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      จัดการโต๊ะ
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ปุ่ม Auth และ Theme สำหรับหน้าจอขนาดใหญ่ */}
          <div className="hidden md:flex items-center space-x-2">
            {/* ปุ่ม Login/Register */}
            <Link 
              href="/login" 
              className="px-3 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              เข้าสู่ระบบ
            </Link>
            <Link 
              href="/register" 
              className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              สมัครสมาชิก
            </Link>
          </div>

          {/* ปุ่ม Hamburger สำหรับหน้าจอมือถือ */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">เปิดเมนู</span>
              {/* Icon เมื่อเมนูปิด */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-5 w-5`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Icon เมื่อเมนูเปิด */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-5 w-5`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMenuOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible'
        } md:hidden overflow-hidden transition-all duration-300 ease-in-out absolute w-full bg-white dark:bg-gray-800 shadow-lg`}
      >
        <div className="px-4 pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`block px-3 py-1.5 rounded-md text-sm font-medium ${
              isActive('/') 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            หน้าหลัก
          </Link>
          <Link
            href="/order"
            className={`block px-3 py-1.5 rounded-md text-sm font-medium ${
              isActive('/order') 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            สั่งอาหาร
          </Link>
          <Link
            href="/menu"
            className={`block px-3 py-1.5 rounded-md text-sm font-medium ${
              isActive('/menu') 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            เมนูอาหาร
          </Link>
          
          {/* เมนูจัดการสำหรับมือถือ */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
            <div className="px-3 py-1 font-medium text-xs text-gray-500 dark:text-gray-400">จัดการระบบ</div>
            <Link
              href="/admin/orders-manage"
              className={`block px-3 py-1.5 rounded-md text-sm font-medium ${
                isActive('/admin/orders-manage') 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 pl-6'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              จัดการออเดอร์
            </Link>
            <Link
              href="/admin/menu"
              className={`block px-3 py-1.5 rounded-md text-sm font-medium ${
                isActive('/admin/menu') 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 pl-6'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              จัดการเมนู
            </Link>
            <Link
              href="/admin/tables"
              className={`block px-3 py-1.5 rounded-md text-sm font-medium ${
                isActive('/admin/tables') 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 pl-6'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              จัดการโต๊ะ
            </Link>
          </div>
        </div>
        
        {/* ปุ่ม Login/Register บนมือถือ */}
        <div className="pt-2 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 flex space-x-2">
            <Link
              href="/login"
              className="w-1/2 flex justify-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="w-1/2 flex justify-center px-3 py-1.5 border border-transparent rounded-md font-medium text-xs text-white bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>
      
      {/* พื้นที่ว่างสำหรับ fixed navbar */}
      <div className="h-12"></div>
    </nav>
  );
};

export default Navbar;