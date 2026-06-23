import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import { getQueryParams } from "@/lib/server/request";
import {
  getAllFeaturedProperties,
  createFeaturedProperty,
} from "@/lib/server/services/collections";
import { parseFormDataFields, extractFiles } from "@/lib/server/form-data";
import { createFeaturedPropertySchema } from "@/lib/server/validators/collection";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const result = await getAllFeaturedProperties(getQueryParams(request));
    return NextResponse.json(result);
  });
}

export async function POST(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const formData = await request.formData();
    const body = parseFormDataFields(formData);

    const validated = validateBody(createFeaturedPropertySchema, body);
    if ("error" in validated) return validated.error;

    const result = await createFeaturedProperty(
      validated.data,
      extractFiles(formData, "gallery"),
      extractFiles(formData, "logos")
    );
    return NextResponse.json(result, { status: 201 });
  });
}
