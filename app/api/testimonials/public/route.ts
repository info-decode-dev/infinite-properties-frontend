import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getQueryParams } from "@/lib/server/request";
import { getAllTestimonials } from "@/lib/server/services/testimonials";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    const result = await getAllTestimonials(getQueryParams(request));
    return NextResponse.json(result);
  });
}
