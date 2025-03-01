// app/admin/orders/actions.ts (Server Actions)
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma'; // Import your Prisma client

export async function updateOrderStatus(orderId: number, newStatus: string) {
  try {
    await prisma.orders.update({
      where: {
        orderID: orderId,
      },
      data: {
        orderStatus: newStatus,
      },
    });

    revalidatePath('/admin/orders'); // Clear the cache and trigger a re-fetch

    return { success: true, message: 'Order status updated successfully!' };
  } catch (err: any) {
    console.error("Failed to update order status:", err);
    return { success: false, message: `Failed to update order status: ${err.message}` };
  }
}

export async function deleteOrder(orderId: number) {
  try {
    await prisma.orders.delete({
      where: {
        orderID: orderId,
      },
    });
    // await Promise.all(deletes); // Uncomment and define 'deletes' if needed

    revalidatePath('/admin/orders'); // Clear the cache and trigger a re-fetch

    return { success: true, message: 'Order deleted successfully!' };
  } catch (err: any) {
    console.error("Failed to delete order:", err);
    return { success: false, message: `Failed to delete order: ${err.message}` };
  }
}