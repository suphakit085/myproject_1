// pages/api/orders/[orderId]/update-status.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    try {
      const { orderId } = req.query;
      const { orderStatus } = req.body;

      if (!orderId || Array.isArray(orderId) || isNaN(parseInt(orderId as string))) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }
      if (!orderStatus) {
        return res.status(400).json({ error: 'Order status is required' });
      }

      const updatedOrder = await prisma.orders.update({
        where: { orderID: parseInt(orderId as string) },
        data: { orderStatus },
      });

      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}