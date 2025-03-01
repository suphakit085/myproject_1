//app/api/buffet/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export async function GET() {
  try {
    const buffetTypes = await prisma.buffetTypes.findMany();
    return NextResponse.json(buffetTypes);
  } catch (error) {
    console.error("Error fetching buffet types:", error);
    return NextResponse.json({ error: "Failed to fetch buffet types" }, { status: 500 });
  }
}