import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import { getQueryParams } from "@/lib/server/request";
import { createEnquiry, getAllEnquiries } from "@/lib/server/services/about-enquiries";
import { createEnquirySchema } from "@/lib/server/validators/enquiry";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return withHandler(async () => {
    const body = await request.json();
    const validated = validateBody(createEnquirySchema, body);
    if ("error" in validated) return validated.error;

    const result = await createEnquiry(validated.data);
    return NextResponse.json(result, { status: 201 });
  });
}

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const result = await getAllEnquiries(getQueryParams(request));
    return NextResponse.json(result);
  });
}
