import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const categories = await db.category.findMany({
    include: { department: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ categories });
}
