import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getQueryParams } from "@/lib/server/request";
import { getAllPropertiesPublic } from "@/lib/server/services/properties";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    const result = await getAllPropertiesPublic(getQueryParams(request));
    return NextResponse.json(result);
  });
}
