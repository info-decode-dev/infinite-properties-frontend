import { NextResponse } from "next/server";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export function handleApiError(error: unknown): NextResponse {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  let message = error instanceof Error ? error.message : "Internal Server Error";
  let finalStatusCode = statusCode;

  if (
    error instanceof Error &&
    (error.message?.includes("MaxClientsInSessionMode") ||
      error.message?.includes("max clients reached") ||
      error.message?.includes("connection pool"))
  ) {
    finalStatusCode = 503;
    message = "Database connection pool is busy. Please try again in a moment.";
  }

  return NextResponse.json(
    {
      success: false,
      message,
      ...(process.env.NODE_ENV === "development" &&
        error instanceof Error && { stack: error.stack }),
    },
    { status: finalStatusCode }
  );
}

export async function withHandler<T>(
  fn: () => Promise<NextResponse<T>>
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (error) {
    return handleApiError(error);
  }
}
