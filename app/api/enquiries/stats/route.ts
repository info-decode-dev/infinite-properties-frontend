import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import { getEnquiryStats } from "@/lib/server/services/about-enquiries";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const result = await getEnquiryStats();
    return NextResponse.json(result);
  });
}
