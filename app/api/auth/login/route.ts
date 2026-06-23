import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { loginUser } from "@/lib/server/services/auth";
import { loginSchema } from "@/lib/server/validators/auth";
import { validateBody } from "@/lib/server/validators/validate";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return withHandler(async () => {
    const body = await request.json();
    const validated = validateBody(loginSchema, body);
    if ("error" in validated) return validated.error;

    const result = await loginUser(validated.data);
    return NextResponse.json(result);
  });
}
