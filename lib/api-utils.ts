import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * @param data - Response payload (any type)
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with JSON body
 */
export function apiResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * 
 * @param message - Error message for client
 * @param status - HTTP status code (default: 500)
 * @returns NextResponse with error body
 */
export function apiError(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * 
 * @returns Object with userId
 * @throws NextResponse with 401 if not authenticated
 */
export async function withAuth(): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId) {
    throw apiError("Unauthorized", 401);
  }
  return { userId };
}
