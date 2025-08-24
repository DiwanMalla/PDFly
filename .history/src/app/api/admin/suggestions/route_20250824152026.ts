import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    if (!prisma || !prisma.suggestion) {
      console.error("Prisma client is undefined or not initialized correctly.");
      return NextResponse.json([], { status: 200 });
    }

    const suggestions = await prisma.suggestion.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Failed to fetch suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
