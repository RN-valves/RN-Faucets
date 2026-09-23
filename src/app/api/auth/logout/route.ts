import { NextResponse } from "next/server";
import { getSessionCookieOptions } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  const cookieOpts = getSessionCookieOptions();
  // Clear HTTP-only session cookie
  response.cookies.set(cookieOpts.name, "", {
    ...cookieOpts,
    maxAge: 0,
  });

  return response;
}
