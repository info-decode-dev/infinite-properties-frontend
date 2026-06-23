import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import { getQueryParams } from "@/lib/server/request";
import {
  getAllProperties,
  createProperty,
} from "@/lib/server/services/properties";
import {
  parseFormDataFields,
  extractFiles,
} from "@/lib/server/form-data";
import { createPropertySchema } from "@/lib/server/validators/property";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const result = await getAllProperties(getQueryParams(request));
    return NextResponse.json(result);
  });
}

export async function POST(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const formData = await request.formData();
    const body = parseFormDataFields(formData);
    const imageFiles = extractFiles(formData, "images");

    const validated = validateBody(createPropertySchema, body);
    if ("error" in validated) return validated.error;

    const result = await createProperty(validated.data, imageFiles);
    return NextResponse.json(result, { status: 201 });
  });
}
