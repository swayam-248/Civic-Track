import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "name, email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Anyone signing up with an @civictrack.gov.in address becomes an admin.
    // This is a placeholder policy for the class project - swap for a real
    // invite/approval flow before this ever goes near production.
    const role = normalizedEmail.endsWith("@civictrack.gov.in") ? "ADMIN" : "CITIZEN";

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: { name, email: normalizedEmail, passwordHash, role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
