import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import { getQueryParams } from "@/lib/server/request";
import { getAllReels, createReel } from "@/lib/server/services/collections";
import { createReelSchema } from "@/lib/server/validators/collection";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const result = await getAllReels(getQueryParams(request));
    return NextResponse.json(result);
  });
}

export async function POST(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const body = await request.json();
    const validated = validateBody(createReelSchema, body);
    if ("error" in validated) return validated.error;

    const result = await createReel(validated.data);
    return NextResponse.json(result, { status: 201 });
  });
}
