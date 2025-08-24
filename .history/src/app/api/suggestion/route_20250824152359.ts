import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, message } = await req.json();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  await prisma.suggestion.create({
    data: {
      name: name || "Anonymous",
      email: email || "",
      message,
    },
  });
  return NextResponse.json({ success: true });
}
