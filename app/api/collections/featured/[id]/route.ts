import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import {
  updateFeaturedProperty,
  deleteFeaturedProperty,
} from "@/lib/server/services/collections";
import { parseFormDataFields, extractFiles } from "@/lib/server/form-data";
import { createFeaturedPropertySchema } from "@/lib/server/validators/collection";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withHandler(async () => {
    await getAuthUser(request);
    const { id } = await params;
    const formData = await request.formData();
    const body = parseFormDataFields(formData);

    const validated = validateBody(createFeaturedPropertySchema, body);
    if ("error" in validated) return validated.error;

    const result = await updateFeaturedProperty(
      id,
      validated.data,
      extractFiles(formData, "gallery"),
      extractFiles(formData, "logos")
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
    const result = await deleteFeaturedProperty(id);
    return NextResponse.json(result);
  });
}
