import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/server/db";
import { withHandler } from "@/lib/server/errors";

export const runtime = "nodejs";

export async function GET() {
  return withHandler(async () => {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      success: true,
      message: "Server is running",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  });
}
