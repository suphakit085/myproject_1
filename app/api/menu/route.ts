import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const buffetTypeId = searchParams.get("buffetTypeId");
  const category = searchParams.get("category");

  try {
    // กำหนดหมวดหมู่ที่อนุญาตตาม BuffetTypes_buffetTypeID
    let allowedCategories: string[] = [];
    let buffetTypeIds: number[] = []; // เพิ่ม array เพื่อเก็บ BuffetTypes_buffetTypeID ที่อนุญาต

    if (buffetTypeId === "1") {
      allowedCategories = ["หมู"];
      buffetTypeIds = [1]; // เฉพาะ Buffet Type 1
    } else if (buffetTypeId === "2") {
      allowedCategories = ["หมู", "เนื้อ"];
      buffetTypeIds = [1, 2]; // ดึงเมนูจากทั้ง Buffet Type 1 (หมู) และ 2 (เนื้อ)
    } else {
      allowedCategories = [];
      buffetTypeIds = [];
    }

    console.log("buffetTypeId:", buffetTypeId);
    console.log("category:", category);
    console.log("allowedCategories:", allowedCategories);
    console.log("buffetTypeIds:", buffetTypeIds);

    const menuItems = await prisma.menuItems.findMany({
      where: {
        BuffetTypes_buffetTypeID: { in: buffetTypeIds }, // ดึงเมนูจาก Buffet Type ที่อนุญาต
        category: category ? category : { in: allowedCategories },
      },
      orderBy: { menuItemCreateAt: "asc" },
    });

    console.log("Fetched menuItems:", menuItems);

    return NextResponse.json(menuItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}