// lib/api.ts

interface SubmitOrderData {
  orderID: number;
  buffetTypeID: number;
  items: { menuItemsID: number; quantity: number }[];
}

export async function fetchBuffetTypes() {
    const res = await fetch('/api/buffet'); // เรียก API route ที่เราจะสร้าง
    if (!res.ok) {
      throw new Error('Failed to fetch buffet types');
    }
    return res.json();
  }
  
  export async function fetchMenuItems(buffetTypeId?: number, category?: string) {
    const params = new URLSearchParams();
    if (buffetTypeId) params.append('buffetTypeId', buffetTypeId.toString());
    if (category) params.append('category', category);

    const res = await fetch(`/api/menu?${params.toString()}`); // ถูกต้อง
    if (!res.ok) {
        throw new Error('Failed to fetch menu items');
    }
     return res.json();
}
  
export async function fetchOrderSummary(orderId: string) {
    const res = await fetch(`/api/order-summary/${orderId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch order summary');
    }
    return res.json();
}
export async function submitOrder(orderData: {
  orderID: number;
  buffetTypeID: number;
  items: { menuItemsID: number; quantity: number }[];
}): Promise<void> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to submit order');
  }
}
