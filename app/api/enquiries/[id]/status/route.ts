import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import { updateEnquiryStatus } from "@/lib/server/services/about-enquiries";
import { updateEnquiryStatusSchema } from "@/lib/server/validators/enquiry";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withHandler(async () => {
    await getAuthUser(request);
    const { id } = await params;
    const body = await request.json();
    const validated = validateBody(updateEnquiryStatusSchema, body);
    if ("error" in validated) return validated.error;

    const result = await updateEnquiryStatus(id, validated.data.status);
    return NextResponse.json(result);
  });
}
