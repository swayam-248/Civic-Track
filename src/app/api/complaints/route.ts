import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function generateReferenceCode() {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `CT-${year}-${rand}`;
}

// GET /api/complaints
// Citizens see only their own complaints. Admins see everything
// (optionally filtered with ?status=IN_PROGRESS or ?department=<id>).
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const departmentId = searchParams.get("department") || undefined;

  const isAdmin = (session.user as any).role === "ADMIN";

  const complaints = await db.complaint.findMany({
    where: {
      ...(isAdmin ? {} : { reportedById: (session.user as any).id }),
      ...(status ? { status: status as any } : {}),
      ...(departmentId ? { departmentId } : {}),
    },
    include: {
      category: true,
      department: true,
      reportedBy: { select: { id: true, name: true, email: true } },
      statusUpdates: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ complaints });
}

// POST /api/complaints - citizen files a new complaint
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { categoryId, description, location, latitude, longitude, imageUrl, confidenceScore } = body;

  if (!categoryId || !description || !location) {
    return NextResponse.json(
      { error: "categoryId, description and location are required" },
      { status: 400 }
    );
  }

  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Unknown category" }, { status: 400 });
  }

  const complaint = await db.complaint.create({
    data: {
      referenceCode: generateReferenceCode(),
      description,
      location,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      imageUrl: imageUrl ?? null,
      confidenceScore: confidenceScore ?? null,
      status: "SUBMITTED",
      categoryId: category.id,
      departmentId: category.departmentId,
      reportedById: (session.user as any).id,
      statusUpdates: {
        create: { status: "SUBMITTED" },
      },
    },
    include: { category: true, department: true, statusUpdates: true },
  });

  return NextResponse.json({ complaint }, { status: 201 });
}
