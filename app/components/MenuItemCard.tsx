// components/MenuItemCard.tsx
import React from "react";

interface BuffetType {
  buffetTypesName: string;
}

interface MenuItem {
  menuItemsID: number;
  menuItemNameTHA: string;
  menuItemNameENG: string;
  menuItemsPrice: number;
  itemImage: string;
  description: string;
  category: string;
  buffetType: BuffetType;
}

interface MenuItemCardProps {
  item: MenuItem;
  onAddToOrder: (item: MenuItem) => void;
  onRemoveFromOrder: (item: MenuItem) => void;
  selected: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToOrder, onRemoveFromOrder, selected }) => {
  return (
    <div
      key={item.menuItemsID}
      className="flex items-center border-b p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300"
    >
      <img
        src={item.itemImage}
        alt={item.menuItemNameTHA}
        className="w-24 h-24 object-cover rounded-md mr-4"
      />
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800">{item.menuItemNameTHA} / {item.menuItemNameENG}</h2>
        <p className="text-gray-600 text-sm">{item.description}</p>
        <p className="text-lg font-bold text-green-500">฿{item.menuItemsPrice}</p>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min="1"
          defaultValue="1"
          className="w-12 text-center border border-gray-300 rounded-md"
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Add
        </button>
      </div>
    </div>
  );
};

export default MenuItemCard;
