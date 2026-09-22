/**
 * RN Valves & Faucets - Standardized API Response Utilities
 * Provides consistent response formats, status codes, and error sanitation.
 */

import { NextResponse } from "next/server";

export interface ApiResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}

/**
 * Returns a standardized JSON success response.
 */
export function apiSuccess<T>(data: T, options: ApiResponseOptions = {}) {
  const { status = 200, headers = {} } = options;
  const body =
    typeof data === "object" && data !== null && !Array.isArray(data)
      ? { success: true, ...data }
      : { success: true, data };

  return NextResponse.json(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/**
 * Returns a standardized JSON error response.
 */
export function apiError(
  message: string,
  options: { status?: number; code?: string; details?: any } = {}
) {
  const { status = 400, code, details } = options;
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(code ? { code } : {}),
      ...(details ? { details } : {}),
    },
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Safely logs internal error details and returns a clean 500 error to clients
 * preventing sensitive stack traces or database connection strings from leaking.
 */
export function handleApiError(error: unknown, context: string) {
  console.error(`[API Error in ${context}]:`, error);

  let message = "An unexpected internal error occurred. Please try again later.";
  if (error instanceof Error && process.env.NODE_ENV === "development") {
    message = error.message;
  }

  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 500 }
  );
}
