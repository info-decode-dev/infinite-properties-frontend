import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import {
  getReelById,
  updateReel,
  deleteReel,
} from "@/lib/server/services/collections";
import { createReelSchema } from "@/lib/server/validators/collection";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withHandler(async () => {
    await getAuthUser(request);
    const { id } = await params;
    const result = await getReelById(id);
    return NextResponse.json(result);
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withHandler(async () => {
    await getAuthUser(request);
    const { id } = await params;
    const body = await request.json();
    const validated = validateBody(createReelSchema, body);
    if ("error" in validated) return validated.error;

    const result = await updateReel(id, validated.data);
    return NextResponse.json(result);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withHandler(async () => {
    await getAuthUser(request);
    const { id } = await params;
    const result = await deleteReel(id);
    return NextResponse.json(result);
  });
}
