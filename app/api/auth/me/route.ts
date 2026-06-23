import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import { getMe } from "@/lib/server/services/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    const user = await getAuthUser(request);
    const result = await getMe(user.userId);
    return NextResponse.json(result);
  });
}
