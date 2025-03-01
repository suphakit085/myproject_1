"use client";
import React, { useState, useEffect } from 'react';

// เราแยก interface ออกมาให้ชัดเจนเพื่อให้เข้าใจโครงสร้างข้อมูลได้ง่ายขึ้น
interface BuffetType {
  buffetTypeID: number;
  buffetTypePrice: number;
  buffetTypesName: string;
  menuItems: MenuItem[];
}

interface MenuItem {
  menuItemsID: number;
  menuItemNameTHA: string;
  menuItemNameENG: string;
  menuItemsPrice: number;
  itemImage: string;
  category: string;
  BuffetTypes_buffetTypeID: number;
  description?: string;
}

const BuffetManagement: React.FC = () => {
  // กำหนด state สำหรับจัดการข้อมูลทั้งหมด
  const [buffetTypes, setBuffetTypes] = useState<BuffetType[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedBuffetType, setSelectedBuffetType] = useState<number | null>(null);

  // จำลองการโหลดข้อมูลเริ่มต้น
  useEffect(() => {
    // ในการใช้งานจริง เราจะดึงข้อมูลจาก API แทน
    const fetchInitialData = async () => {
      try {
        // ข้อมูลประเภทบุฟเฟ่ต์
        const initialBuffetTypes: BuffetType[] = [
          {
            buffetTypeID: 1,
            buffetTypesName: "บุฟเฟ่ต์หมู",
            buffetTypePrice: 299,
            menuItems: []
          },
          {
            buffetTypeID: 2,
            buffetTypesName: "บุฟเฟ่ต์เนื้อ",
            buffetTypePrice: 399,
            menuItems: []
          }
        ];

        // ข้อมูลเมนูอาหาร
        const initialMenuItems: MenuItem[] = [
          {
            menuItemsID: 1,
            menuItemNameTHA: 'บุฟเฟ่ต์หมู',
            menuItemNameENG: 'Pork Buffet',
            menuItemsPrice: 299,
            itemImage: '/images/pork-buffet.jpg',
            category: 'pork',
            BuffetTypes_buffetTypeID: 1
          },
          {
            menuItemsID: 2,
            menuItemNameTHA: 'บุฟเฟ่ต์เนื้อ',
            menuItemNameENG: 'Beef Buffet',
            menuItemsPrice: 399,
            itemImage: '/images/beef-buffet.jpg',
            category: 'beef',
            BuffetTypes_buffetTypeID: 2
          }
        ];

        setBuffetTypes(initialBuffetTypes);
        setMenuItems(initialMenuItems);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  // ฟังก์ชันสำหรับดึงเมนูตามประเภทบุฟเฟ่ต์
  const getMenuItemsByBuffetType = (buffetTypeID: number) => {
    return menuItems.filter(item => item.BuffetTypes_buffetTypeID === buffetTypeID);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">จัดการบุฟเฟ่ต์</h2>

      {/* แสดงรายการประเภทบุฟเฟ่ต์ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buffetTypes.map(buffet => (
          <div 
            key={buffet.buffetTypeID} 
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">{buffet.buffetTypesName}</h3>
                <p className="text-2xl font-bold text-green-600">฿{buffet.buffetTypePrice}</p>
              </div>
              <button
                onClick={() => setSelectedBuffetType(buffet.buffetTypeID)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                ดูรายละเอียด
              </button>
            </div>

            {/* แสดงรายการเมนูเมื่อเลือกประเภทบุฟเฟ่ต์ */}
            {selectedBuffetType === buffet.buffetTypeID && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium mb-3">รายการอาหารในเซ็ต</h4>
                <div className="space-y-2">
                  {getMenuItemsByBuffetType(buffet.buffetTypeID).map(item => (
                    <div key={item.menuItemsID} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.menuItemNameTHA}</p>
                        <p className="text-sm text-gray-600">{item.menuItemNameENG}</p>
                      </div>
                      <span className="text-sm text-gray-500">{item.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* คำอธิบายเพิ่มเติมเกี่ยวกับบุฟเฟ่ต์ */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">เงื่อนไขการรับประทาน</h3>
        <ul className="space-y-2 text-gray-600">
          <li>• รับประทานได้ไม่จำกัดภายในเวลา 1.5 ชั่วโมง</li>
          <li>• เหลือทานไม่หมดปรับจานละ 50 บาท</li>
          <li>• ราคานี้ยังไม่รวม VAT 7%</li>
        </ul>
      </div>
    </div>
  );
};

export default BuffetManagement;