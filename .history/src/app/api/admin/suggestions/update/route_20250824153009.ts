import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { id, status } = await req.json();
  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }
  const updated = await prisma.suggestion.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json(updated);
}
