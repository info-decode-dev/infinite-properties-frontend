import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import { getDashboardStats } from "@/lib/server/services/properties";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const result = await getDashboardStats();
    return NextResponse.json(result);
  });
}
