import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getQueryParams } from "@/lib/server/request";
import { getAllReels } from "@/lib/server/services/collections";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    const result = await getAllReels(getQueryParams(request));
    return NextResponse.json(result);
  });
}
