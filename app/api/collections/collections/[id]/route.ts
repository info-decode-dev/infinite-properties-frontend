import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import {
  getCollectionById,
  updateCollection,
  deleteCollection,
} from "@/lib/server/services/collections";
import { parseFormDataFields, extractFile } from "@/lib/server/form-data";
import { createCollectionSchema } from "@/lib/server/validators/collection";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withHandler(async () => {
    await getAuthUser(request);
    const { id } = await params;
    const result = await getCollectionById(id);
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
    const formData = await request.formData();
    const body = parseFormDataFields(formData);

    const validated = validateBody(createCollectionSchema, body);
    if ("error" in validated) return validated.error;

    const result = await updateCollection(
      id,
      validated.data,
      extractFile(formData, "image")
    );
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
    const result = await deleteCollection(id);
    return NextResponse.json(result);
  });
}
