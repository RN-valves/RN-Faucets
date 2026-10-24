import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

const ADMIN_ROLES = new Set([
  "Super Admin",
  "Admin",
  "Employee",
  "Staff",
  "Manager",
  "Catalogue Manager",
  "Order Dispatcher",
  "Customer Support Manager",
]);

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // ── 0. Enforce Preferred Domain (non-www: https://rnvalves.com) with 301 ────
  const rawHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const host = rawHost.split(",")[0].trim().toLowerCase();
  if (host === "www.rnvalves.com" || host.startsWith("www.rnvalves.com:")) {
    return NextResponse.redirect(
      `https://rnvalves.com${pathname}${search}`,
      301
    );
  }

  // ── 1. Admin Route Protection ───────────────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
    const cleanMobile = String(session?.mobile || "").replace(/\D/g, "").slice(-10);
    const isAuthorizedAdmin =
      session &&
      (cleanMobile === "8737029643" ||
        ADMIN_ROLES.has(session.role) ||
        session.userType === "Admin" ||
        session.userType === "Employee" ||
        session.role === "Super Admin" ||
        session.role === "Admin");

    if (!isAuthorizedAdmin) {
      const loginUrl = new URL("/login-user", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 2. Response with Production Security Headers ────────────────────────────
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.png, manifest, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)",
  ],
};
