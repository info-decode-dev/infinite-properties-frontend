import { NextRequest, NextResponse } from "next/server";
import { withHandler, AppError } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import { getQueryParams } from "@/lib/server/request";
import {
  getAllCollections,
  createCollection,
} from "@/lib/server/services/collections";
import { parseFormDataFields, extractFile } from "@/lib/server/form-data";
import { createCollectionSchema } from "@/lib/server/validators/collection";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const result = await getAllCollections(getQueryParams(request));
    return NextResponse.json(result);
  });
}

export async function POST(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const formData = await request.formData();
    const body = parseFormDataFields(formData);
    const imageFile = extractFile(formData, "image");
    if (!imageFile) throw new AppError("Image is required", 400);

    const validated = validateBody(createCollectionSchema, body);
    if ("error" in validated) return validated.error;

    const result = await createCollection(validated.data, imageFile);
    return NextResponse.json(result, { status: 201 });
  });
}
