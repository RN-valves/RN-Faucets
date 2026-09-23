/**
 * RN Valves & Faucets - Security, Sanitization & Authentication Layer
 * Provides ReDoS protection, NoSQL injection defenses, sliding-window rate limiting,
 * media upload validation, path traversal guards, and cryptographic session verification.
 */

import { verifySessionToken, SessionPayload, SESSION_COOKIE_NAME } from "./session";

// ── In-Memory Rate Limiter Storage ──
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection for rate limit store (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Escapes special characters from a string for safe usage in RegExp / MongoDB $regex queries.
 * Prevents ReDoS (Regular Expression Denial of Service) and Mongo regex syntax crashes.
 */
export function escapeRegex(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Sanitizes primitive string inputs: trims, enforces max length, and removes null bytes.
 */
export function sanitizeString(val: unknown, maxLength: number = 255): string {
  if (val === null || val === undefined) return "";
  const str = String(val).replace(/\0/g, "").trim();
  return str.slice(0, maxLength);
}

/**
 * Validates 10-digit Indian mobile numbers (starts with 6-9).
 */
export function isValidIndianPhone(val: unknown): boolean {
  if (typeof val !== "string" && typeof val !== "number") return false;
  const digits = String(val).replace(/\D/g, "").slice(-10);
  return /^[6-9]\d{9}$/.test(digits);
}

/**
 * Validates standard email addresses.
 */
export function isValidEmail(val: unknown): boolean {
  if (typeof val !== "string") return false;
  const trimmed = val.trim();
  if (trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Recursively sanitizes JSON request bodies by stripping keys starting with '$' or containing '.'
 * to prevent NoSQL query operator injection.
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    // Drop keys containing MongoDB operators or dot notation
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }
    if (value && typeof value === "object") {
      cleaned[key] = sanitizeObject(value);
    } else if (typeof value === "string") {
      cleaned[key] = value.replace(/\0/g, "");
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

/**
 * Sliding window in-memory rate limiter.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Extracts client IP address safely from standard proxy headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",");
    return ips[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * Whitelist check for allowed media upload extensions and MIME types.
 */
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);
const ALLOWED_VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "m4v"]);
const ALLOWED_MIME_PREFIXES = ["image/", "video/"];

export function validateMediaUpload(
  filename: string,
  mimeType: string,
  sizeBytes: number,
  maxSizeBytes: number = 500 * 1024 * 1024
): { valid: boolean; error?: string; mediaType?: "image" | "video" } {
  if (!filename) {
    return { valid: false, error: "Filename is missing." };
  }

  const ext = filename.split(".").pop()?.toLowerCase() || "";

  const isImage = ALLOWED_IMAGE_EXTENSIONS.has(ext);
  const isVideo = ALLOWED_VIDEO_EXTENSIONS.has(ext);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `File type .${ext} is not allowed. Supported formats: JPG, PNG, WEBP, SVG, GIF, MP4, WEBM, MOV.`,
    };
  }

  const mimeLower = (mimeType || "").toLowerCase();
  const isMimeValid =
    !mimeLower ||
    mimeLower === "application/octet-stream" ||
    ALLOWED_MIME_PREFIXES.some((p) => mimeLower.startsWith(p));

  if (!isMimeValid) {
    return {
      valid: false,
      error: `Invalid MIME type (${mimeType}) for uploaded media.`,
    };
  }

  if (sizeBytes > maxSizeBytes) {
    const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size (${sizeMb}MB) exceeds the ${maxMb}MB limit.`,
    };
  }

  return {
    valid: true,
    mediaType: isVideo ? "video" : "image",
  };
}

/**
 * Sanitizes S3/R2 storage keys to prevent path traversal (`../` or `..\`).
 */
export function sanitizeStorageKey(rawKey: string): string {
  if (!rawKey) return "";
  return rawKey
    .replace(/\\/g, "/")
    .replace(/(\.\.\/)+/g, "")
    .replace(/^\/+/, "")
    .replace(/\0/g, "")
    .trim();
}

/**
 * Authorized admin roles
 */
export const ADMIN_ROLES = new Set([
  "Super Admin",
  "Admin",
  "Catalogue Manager",
  "Order Dispatcher",
  "Customer Support Manager",
]);

/**
 * Parses cookies from raw request cookie header
 */
function parseCookieHeader(header: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const pair of header.split(";")) {
    const [name, ...valParts] = pair.trim().split("=");
    if (name) {
      cookies[name] = decodeURIComponent(valParts.join("="));
    }
  }
  return cookies;
}

/**
 * Extracts and verifies session payload from request cookie or Bearer header
 */
export async function getSessionFromRequest(req: Request): Promise<SessionPayload | null> {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const session = await verifySessionToken(token);
    if (session) return session;
  }

  // 2. Check Cookie header
  const cookieHeader = req.headers.get("cookie");
  const cookies = parseCookieHeader(cookieHeader);
  const sessionCookie = cookies[SESSION_COOKIE_NAME];
  if (sessionCookie) {
    const session = await verifySessionToken(sessionCookie);
    if (session) return session;
  }

  return null;
}

/**
 * Requires an authenticated user session. Returns session or null.
 */
export async function requireAuth(req: Request): Promise<SessionPayload | null> {
  return await getSessionFromRequest(req);
}

/**
 * Validates admin request authorization via session token or admin API secret.
 */
export async function requireAdminAuth(req: Request): Promise<SessionPayload | null> {
  // Machine-to-machine internal API secret check if configured
  const authHeader = req.headers.get("authorization") || "";
  const adminSecret = process.env.ADMIN_API_SECRET;
  if (adminSecret && (authHeader === `Bearer ${adminSecret}` || authHeader === adminSecret)) {
    return {
      id: "system-admin",
      mobile: "system",
      name: "System Admin API",
      role: "Super Admin",
      userType: "Admin",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
  }

  const session = await getSessionFromRequest(req);
  if (!session) return null;

  const isAdmin =
    ADMIN_ROLES.has(session.role) ||
    session.userType === "Admin" ||
    session.role === "Super Admin" ||
    session.role === "Admin";

  if (!isAdmin) return null;

  return session;
}
