// app/components/Navbar.tsx
"use client";
import React, { useState } from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State สำหรับ toggle mobile menu

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="font-bold text-xl text-gray-800 dark:text-white">
                Your Logo
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/order" className="text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  order
                </Link>
                <Link href="/menu" className="text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Menu
                </Link>
                <Link href="/admin/orders" className="text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Manage Orders
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            {/* Authentication Links (ตัวอย่าง) */}
            <div className="ml-4 flex items-center md:ml-6">
              <Link href="/login" className="text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link href="/register" className="text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Register
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Menu open: "hidden", Menu closed: "block" */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Menu open: "block", Menu closed: "hidden" */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className="text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">
            Home
          </Link>
          <Link href="/menu" className="text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">
            Menu
          </Link>
          <Link href="/admin/orders" className="text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">
            Manage Orders
          </Link>
        </div>
        {/* Mobile Authentication Links (ตัวอย่าง) */}
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="mt-3 space-y-1">
            <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700">
              Login
            </Link>
            <Link href="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700">
              Register
            </Link>
          </div>
        </div>
      </div>
      
    </nav>
  );
};

export default Navbar;