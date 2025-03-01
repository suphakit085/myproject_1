// app/api/employees.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma'; // Replace with your actual Prisma client import

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const employees = await prisma.employee.findMany();
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}