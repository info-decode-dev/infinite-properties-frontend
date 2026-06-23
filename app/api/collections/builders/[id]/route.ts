import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import {
  getBuilderById,
  updateBuilder,
  deleteBuilder,
} from "@/lib/server/services/builders";
import { parseFormDataFields, extractFile } from "@/lib/server/form-data";
import { updateBuilderSchema } from "@/lib/server/validators/builder";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withHandler(async () => {
    await getAuthUser(request);
    const { id } = await params;
    const result = await getBuilderById(id);
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

    const validated = validateBody(updateBuilderSchema, body);
    if ("error" in validated) return validated.error;

    const result = await updateBuilder(
      id,
      validated.data,
      extractFile(formData, "profilePicture")
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
    const result = await deleteBuilder(id);
    return NextResponse.json(result);
  });
}
