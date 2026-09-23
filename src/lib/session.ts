/**
 * Cryptographically Secure Session Management
 * Uses standard Web Crypto API (HMAC-SHA256) for zero-dependency,
 * high-performance session signing & verification across Edge (Middleware) and Node.js.
 */

export interface SessionPayload {
  id: string;
  mobile: string;
  name?: string;
  email?: string;
  role: string;
  userType: string;
  userCode?: string;
  exp: number; // Unix timestamp in seconds
}

export const SESSION_COOKIE_NAME = "rn_session";
const SESSION_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Universal Base64url utilities compatible with Edge and Node.js
function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = typeof btoa !== "undefined"
    ? btoa(binary)
    : Buffer.from(bytes).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlEncodeString(str: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(str));
}

function base64UrlDecodeToString(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = typeof atob !== "undefined"
    ? atob(base64)
    : Buffer.from(base64, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function base64UrlDecodeToBytes(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = typeof atob !== "undefined"
    ? atob(base64)
    : Buffer.from(base64, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getSecretKey(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.ADMIN_API_SECRET ||
    "rn-valves-secure-session-key-production-2026-safe-default"
  );
}

async function getCryptoKey(): Promise<CryptoKey> {
  const secret = getSecretKey();
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a signed HMAC-SHA256 session token string
 */
export async function createSessionToken(
  user: Omit<SessionPayload, "exp">,
  expiresInSeconds: number = SESSION_EXPIRY_SECONDS
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload: SessionPayload = { ...user, exp };

  const encoder = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64UrlEncodeString(payloadStr);

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(encodedPayload)
  );

  const encodedSignature = base64UrlEncodeBytes(new Uint8Array(signatureBuffer));
  return `${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies and decodes a signed HMAC-SHA256 session token string
 * Returns null if token is invalid, expired, or tampered with.
 */
export async function verifySessionToken(token: string | null | undefined): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  try {
    const [encodedPayload, encodedSignature] = token.split(".");
    if (!encodedPayload || !encodedSignature) return null;

    const key = await getCryptoKey();
    const encoder = new TextEncoder();
    const signatureBytes = base64UrlDecodeToBytes(encodedSignature);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      encoder.encode(encodedPayload) as unknown as BufferSource
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecodeToString(encodedPayload);
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Expiry check
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Helper to get cookie options for the session cookie.
 * Secure flag is only set if explicitly enabled via COOKIE_SECURE=true or isSecureProtocol.
 * This guarantees the browser never rejects the cookie on HTTP or behind non-SSL reverse proxies.
 */
export function getSessionCookieOptions(maxAge: number = SESSION_EXPIRY_SECONDS, isSecureProtocol: boolean = false) {
  const forceSecure = process.env.COOKIE_SECURE === "true";
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: forceSecure || isSecureProtocol,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
