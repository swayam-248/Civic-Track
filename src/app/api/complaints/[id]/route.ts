import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const complaint = await db.complaint.findUnique({
    where: { id },
    include: {
      category: true,
      department: true,
      reportedBy: { select: { id: true, name: true, email: true } },
      statusUpdates: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!complaint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = (session.user as any).role === "ADMIN";
  if (!isAdmin && complaint.reportedById !== (session.user as any).id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ complaint });
}

const VALID_STATUSES = ["SUBMITTED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"];

// PATCH /api/complaints/:id - admin-only status update
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status, note } = await req.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const complaint = await db.complaint.update({
    where: { id },
    data: {
      status,
      resolutionNote: note ?? undefined,
      resolvedAt: status === "RESOLVED" ? new Date() : undefined,
      statusUpdates: { create: { status, note: note ?? null } },
    },
    include: { category: true, department: true, statusUpdates: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ complaint });
}
