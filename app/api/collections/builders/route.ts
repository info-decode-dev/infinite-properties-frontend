import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import { getQueryParams } from "@/lib/server/request";
import { getAllBuilders, createBuilder } from "@/lib/server/services/builders";
import { parseFormDataFields, extractFile } from "@/lib/server/form-data";
import { createBuilderSchema } from "@/lib/server/validators/builder";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const result = await getAllBuilders(getQueryParams(request));
    return NextResponse.json(result);
  });
}

export async function POST(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const formData = await request.formData();
    const body = parseFormDataFields(formData);

    const validated = validateBody(createBuilderSchema, body);
    if ("error" in validated) return validated.error;

    const result = await createBuilder(
      validated.data,
      extractFile(formData, "profilePicture")
    );
    return NextResponse.json(result, { status: 201 });
  });
}
