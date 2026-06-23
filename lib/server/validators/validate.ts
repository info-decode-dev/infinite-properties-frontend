import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

export function validateBody<T>(
  schema: ZodSchema<T>,
  data: unknown
): { data: T } | { error: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(", ");
    return {
      error: NextResponse.json({ success: false, message }, { status: 400 }),
    };
  }
  return { data: result.data };
}

export function formatZodError(error: ZodError): string {
  return error.issues.map((i) => i.message).join(", ");
}
