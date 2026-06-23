import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getPropertyById } from "@/lib/server/services/properties";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withHandler(async () => {
    const { id } = await params;
    const result = await getPropertyById(id);
    return NextResponse.json(result);
  });
}
