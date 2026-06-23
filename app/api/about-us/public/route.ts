import { NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAboutUs } from "@/lib/server/services/about-enquiries";

export const runtime = "nodejs";

export async function GET() {
  return withHandler(async () => {
    const result = await getAboutUs();
    return NextResponse.json(result);
  });
}
