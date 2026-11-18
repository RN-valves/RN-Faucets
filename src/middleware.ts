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

  // ── 0b. Prevent /index from matching [slug] and colliding with root / ISR cache ──
  const lowerPath = pathname.toLowerCase();
  if (
    lowerPath === "/index" ||
    lowerPath === "/index.html" ||
    lowerPath === "/index.php" ||
    lowerPath === "/index.htm"
  ) {
    return NextResponse.redirect(new URL(`/${search}`, request.url), 301);
  }

  // ── 0c. Redirect Legacy PHP / Google Indexed Product & Category Paths (301) ──
  // 1. Strip leading /index.php/... prefix (e.g. /index.php/product/cat/subcat/slug -> /product/cat/subcat/slug)
  if (lowerPath.startsWith("/index.php/")) {
    const stripped = pathname.slice("/index.php".length) || "/";
    const strippedLower = stripped.toLowerCase();

    // If it is /index.php/product/... or /index.php/products/... -> redirect directly to /faucets/subcat/product
    const prodMatch = stripped.match(/^\/products?\/(?:[^/]+\/)?([^/]+)\/([^/]+)\/?$/i);
    if (prodMatch) {
      return NextResponse.redirect(
        new URL(`/faucets/${prodMatch[1]}/${prodMatch[2]}${search}`, request.url),
        301
      );
    }
    const singleProdMatch = stripped.match(/^\/products?\/([^/]+)\/?$/i);
    if (singleProdMatch) {
      return NextResponse.redirect(
        new URL(`/faucets/all/${singleProdMatch[1]}${search}`, request.url),
        301
      );
    }
    const subMatch = stripped.match(/^\/(?:subcategory|sub-category|category|categories|collection|collections)\/(?:[^/]+\/)?([^/]+)\/?$/i);
    if (subMatch && !strippedLower.startsWith("/admin")) {
      return NextResponse.redirect(
        new URL(`/faucets/${subMatch[1]}${search}`, request.url),
        301
      );
    }

    return NextResponse.redirect(new URL(`${stripped}${search}`, request.url), 301);
  }

  // 2. Legacy /product/... or /products/... URLs indexed in Google
  // Examples:
  //   /product/ptmt-taps-or-faucets/g20-pine-collection/bib-cock-foam-flow-with-flange-rng2019a32
  //   /product/amara-collection/wall-mounted-sink-cock-with-swivel-spout-flange-rnama32g09
  //   /product/wall-mounted-sink-cock-with-swivel-spout-flange-rnama32g09
  if (lowerPath.startsWith("/product/") || lowerPath.startsWith("/products/")) {
    const segments = pathname.split("/").filter(Boolean); // ["product", ...]
    if (segments.length >= 3) {
      const productSlug = segments[segments.length - 1];
      const subcatSlug = segments[segments.length - 2];
      return NextResponse.redirect(
        new URL(`/faucets/${subcatSlug}/${productSlug}${search}`, request.url),
        301
      );
    } else if (segments.length === 2) {
      const productSlug = segments[1];
      return NextResponse.redirect(
        new URL(`/faucets/all/${productSlug}${search}`, request.url),
        301
      );
    }
  }

  // 3. Legacy /category/... or /subcategory/... or /collection/... URLs indexed in Google
  if (
    lowerPath.startsWith("/category/") ||
    lowerPath.startsWith("/categories/") ||
    lowerPath.startsWith("/subcategory/") ||
    lowerPath.startsWith("/subcategories/") ||
    lowerPath.startsWith("/sub-category/") ||
    lowerPath.startsWith("/collection/") ||
    lowerPath.startsWith("/collections/")
  ) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length >= 2) {
      const targetSlug = segments[segments.length - 1];
      return NextResponse.redirect(
        new URL(`/faucets/${targetSlug}${search}`, request.url),
        301
      );
    }
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
