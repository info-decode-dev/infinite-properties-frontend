import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import { getQueryParams } from "@/lib/server/request";
import {
  getAllTestimonials,
  createTestimonial,
} from "@/lib/server/services/testimonials";
import {
  parseFormDataFields,
  extractFile,
} from "@/lib/server/form-data";
import { createTestimonialSchema } from "@/lib/server/validators/testimonial";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const result = await getAllTestimonials(getQueryParams(request));
    return NextResponse.json(result);
  });
}

export async function POST(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const formData = await request.formData();
    const body = parseFormDataFields(formData);

    const validated = validateBody(createTestimonialSchema, body);
    if ("error" in validated) return validated.error;

    const result = await createTestimonial(
      validated.data,
      extractFile(formData, "profilePicture"),
      extractFile(formData, "media")
    );
    return NextResponse.json(result, { status: 201 });
  });
}
