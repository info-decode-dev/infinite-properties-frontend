import { NextRequest } from "next/server";

export function getQueryParams(request: NextRequest): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}
