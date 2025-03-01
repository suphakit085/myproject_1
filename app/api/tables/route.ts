// pages/api/tables.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Replace with your actual Prisma client import
export async function GET() {
  try {
    const tables = await prisma.tables.findMany();
    return NextResponse.json(tables);
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}