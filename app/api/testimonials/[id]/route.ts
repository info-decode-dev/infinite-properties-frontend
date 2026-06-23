import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import {
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/server/services/testimonials";
import {
  parseFormDataFields,
  extractFile,
} from "@/lib/server/form-data";
import { updateTestimonialSchema } from "@/lib/server/validators/testimonial";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withHandler(async () => {
    await getAuthUser(request);
    const { id } = await params;
    const result = await getTestimonialById(id);
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

    const validated = validateBody(updateTestimonialSchema, body);
    if ("error" in validated) return validated.error;

    const result = await updateTestimonial(
      id,
      validated.data,
      extractFile(formData, "profilePicture"),
      extractFile(formData, "media")
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
    const result = await deleteTestimonial(id);
    return NextResponse.json(result);
  });
}
