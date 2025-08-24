import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// Use dynamic import for bcryptjs to avoid module resolution issues

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }
  // Find admin by email
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }
  // Compare password
  const bcryptjs = await import("bcryptjs");
  const valid = await bcryptjs.compare(password, admin.password);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }
  // TODO: Set session/cookie for admin authentication
  return NextResponse.json({ success: true });
}
