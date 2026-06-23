import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import {
  getPropertyById,
  updateProperty,
  deleteProperty,
} from "@/lib/server/services/properties";
import {
  parseFormDataFields,
  extractFiles,
} from "@/lib/server/form-data";
import { updatePropertySchema } from "@/lib/server/validators/property";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withHandler(async () => {
    await getAuthUser(request);
    const { id } = await params;
    const result = await getPropertyById(id);
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
    const imageFiles = extractFiles(formData, "images");

    const validated = validateBody(updatePropertySchema, body);
    if ("error" in validated) return validated.error;

    const result = await updateProperty(id, validated.data, imageFiles);
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
    const result = await deleteProperty(id);
    return NextResponse.json(result);
  });
}
