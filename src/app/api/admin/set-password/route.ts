import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, password, confirmPassword } = await req.json();
  if (!email || !password || !confirmPassword) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }
  const bcryptjs = await import("bcryptjs");
  const hash = await bcryptjs.hash(password, 10);
  await prisma.admin.update({
    where: { email },
    data: { password: hash },
  });
  return NextResponse.json({ success: true });
}