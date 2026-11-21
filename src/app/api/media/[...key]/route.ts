import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { sanitizeStorageKey } from "@/lib/security";
import sharp from "sharp";

export const dynamic = "force-dynamic";

// Fast L1 in-memory LRU cache for resized/optimized WebP images (prevents repeat sharp CPU & R2 fetches)
const MAX_MEDIA_CACHE_ENTRIES = 250;
const mediaOptimizationCache = new Map<
  string,
  { buffer: Buffer; contentType: string; etag: string }
>();

function getCachedOptimizedMedia(cacheKey: string) {
  const entry = mediaOptimizationCache.get(cacheKey);
  if (!entry) return null;
  mediaOptimizationCache.delete(cacheKey);
  mediaOptimizationCache.set(cacheKey, entry);
  return entry;
}

function setCachedOptimizedMedia(
  cacheKey: string,
  value: { buffer: Buffer; contentType: string; etag: string }
) {
  if (mediaOptimizationCache.size >= MAX_MEDIA_CACHE_ENTRIES && !mediaOptimizationCache.has(cacheKey)) {
    const oldestKey = mediaOptimizationCache.keys().next().value;
    if (oldestKey) mediaOptimizationCache.delete(oldestKey);
  }
  mediaOptimizationCache.set(cacheKey, value);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: keyParts } = await params;
    const key = sanitizeStorageKey(keyParts.join("/"));

    if (!key) {
      return new NextResponse("Media Key is required and must be valid", { status: 400 });
    }

    const url = new URL(req.url);
    const hasExplicitWidth = url.searchParams.has("w");
    const hasExplicitQuality = url.searchParams.has("q");
    const requestedWidthRaw = parseInt(url.searchParams.get("w") || "0", 10);
    const requestedQualityRaw = parseInt(url.searchParams.get("q") || "92", 10);
    const requestedWidth =
      hasExplicitWidth && !isNaN(requestedWidthRaw) && requestedWidthRaw > 0
        ? Math.min(Math.max(requestedWidthRaw, 32), 3840)
        : 0;
    const requestedQuality =
      hasExplicitQuality && !isNaN(requestedQualityRaw) && requestedQualityRaw > 0
        ? Math.min(Math.max(requestedQualityRaw, 60), 100)
        : 92;
    const versionParam = url.searchParams.get("v") || url.searchParams.get("t") || "";

    const lowerKey = key.toLowerCase();
    const isMediaVideoOrDoc =
      lowerKey.endsWith(".mp4") ||
      lowerKey.endsWith(".m4v") ||
      lowerKey.endsWith(".webm") ||
      lowerKey.endsWith(".mov") ||
      lowerKey.endsWith(".pdf") ||
      lowerKey.endsWith(".svg") ||
      lowerKey.endsWith(".gif");

    const cacheKey = `${key}|v=${versionParam}|w=${requestedWidth}|q=${requestedQuality}`;
    if (!isMediaVideoOrDoc) {
      const cached = getCachedOptimizedMedia(cacheKey);
      if (cached) {
        const ifNoneMatch = req.headers.get("if-none-match");
        const cachedHeaders = new Headers({
          "Content-Type": cached.contentType,
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          ETag: cached.etag,
          "Content-Length": String(cached.buffer.length),
        });
        if (ifNoneMatch && (ifNoneMatch === cached.etag || ifNoneMatch === `"${cached.etag}"` || ifNoneMatch.replace(/"/g, "") === cached.etag.replace(/"/g, ""))) {
          return new Response(null, { status: 304, headers: cachedHeaders });
        }
        return new Response(new Uint8Array(cached.buffer), {
          status: 200,
          headers: cachedHeaders,
        });
      }
    }

    const rangeHeader = req.headers.get("range");

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Range: rangeHeader || undefined,
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      return new NextResponse("Media Asset Not Found", { status: 404 });
    }

    // Determine accurate content type
    let contentType = response.ContentType || "application/octet-stream";

    // If R2 stored image/svg+xml or if key ends in .svg, guarantee SVG Content-Type
    if (response.ContentType === "image/svg+xml" || response.ContentType?.startsWith("image/svg") || lowerKey.endsWith(".svg")) {
      contentType = "image/svg+xml";
    } else if (
      !response.ContentType ||
      response.ContentType === "application/octet-stream" ||
      response.ContentType === "binary/octet-stream" ||
      response.ContentType === "text/plain"
    ) {
      if (lowerKey.endsWith(".mp4") || lowerKey.endsWith(".m4v")) {
        contentType = "video/mp4";
      } else if (lowerKey.endsWith(".webm")) {
        contentType = "video/webm";
      } else if (lowerKey.endsWith(".mov")) {
        contentType = "video/quicktime";
      } else if (lowerKey.endsWith(".webp")) {
        contentType = "image/webp";
      } else if (lowerKey.endsWith(".png")) {
        contentType = "image/png";
      } else if (lowerKey.endsWith(".jpg") || lowerKey.endsWith(".jpeg") || lowerKey.endsWith(".jfif")) {
        contentType = "image/jpeg";
      } else if (lowerKey.endsWith(".avif")) {
        contentType = "image/avif";
      } else if (lowerKey.endsWith(".gif")) {
        contentType = "image/gif";
      } else if (lowerKey.endsWith(".pdf")) {
        contentType = "application/pdf";
      }
    }

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Accept-Ranges", "bytes");
    headers.set("Vary", "Range, Accept-Encoding");

    if (contentType === "image/svg+xml") {
      headers.set(
        "Content-Security-Policy",
        "default-src 'none'; style-src 'unsafe-inline'; sandbox"
      );
    }

    headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");

    const isRasterImage =
      contentType === "image/png" ||
      contentType === "image/jpeg" ||
      contentType === "image/webp" ||
      contentType === "image/avif";

    // Only run sharp when explicitly requested via ?w= or ?q= query params so default images retain 100% original studio quality
    const shouldOptimizeWithSharp =
      isRasterImage &&
      !rangeHeader &&
      (requestedWidth > 0 || hasExplicitQuality);

    if (!shouldOptimizeWithSharp && response.ETag) {
      headers.set("ETag", response.ETag);
      const ifNoneMatch = req.headers.get("if-none-match");
      if (ifNoneMatch && (ifNoneMatch === response.ETag || ifNoneMatch === `"${response.ETag}"` || ifNoneMatch === response.ETag.replace(/"/g, ""))) {
        return new Response(null, {
          status: 304,
          headers,
        });
      }
    }

    if (response.LastModified) {
      headers.set("Last-Modified", response.LastModified.toUTCString());
    }

    if (response.ContentRange) {
      headers.set("Content-Range", response.ContentRange);
    }

    const status = response.$metadata?.httpStatusCode || (response.ContentRange ? 206 : 200);
    const isStreamable =
      !shouldOptimizeWithSharp &&
      (contentType.startsWith("video/") ||
        contentType === "application/pdf" ||
        (response.ContentLength !== undefined && response.ContentLength > 524288));
    let body: any;

    if (isStreamable && typeof (response.Body as any)?.transformToWebStream === "function") {
      body = (response.Body as any).transformToWebStream();
      if (response.ContentLength !== undefined) {
        headers.set("Content-Length", String(response.ContentLength));
      }
    } else {
      const byteArray = await response.Body.transformToByteArray();
      let buffer: Buffer = Buffer.from(byteArray);

      // Check if R2 stored SVG bytes under a .webp key (e.g. header/logo.webp)
      const headSnippet = buffer.subarray(0, 120).toString("utf8").trimStart();
      if (headSnippet.startsWith("<svg") || headSnippet.startsWith("<?xml")) {
        contentType = "image/svg+xml";
        headers.set("Content-Type", "image/svg+xml");
        headers.set(
          "Content-Security-Policy",
          "default-src 'none'; style-src 'unsafe-inline'; sandbox"
        );
      } else if (shouldOptimizeWithSharp) {
        try {
          let pipeline = sharp(buffer, { failOn: "none" });
          if (requestedWidth > 0) {
            pipeline = pipeline.resize({
              width: requestedWidth,
              withoutEnlargement: true,
            });
          }
          const optimized = await pipeline
            .webp({ quality: requestedQuality, effort: 4 })
            .toBuffer();

          buffer = optimized;
          contentType = "image/webp";
          headers.set("Content-Type", "image/webp");
        } catch {
          // Fallback to raw buffer if sharp fails on unexpected bytes
        }

        const baseEtag = (response.ETag || `"${buffer.length}"`).replace(/"/g, "");
        const finalEtag = `"${baseEtag}-w${requestedWidth}-q${requestedQuality}"`;
        headers.set("ETag", finalEtag);
        setCachedOptimizedMedia(cacheKey, {
          buffer,
          contentType,
          etag: finalEtag,
        });
      }

      body = new Uint8Array(buffer);
      headers.set("Content-Length", buffer.length.toString());
    }

    return new Response(body, {
      status,
      headers,
    });
  } catch (error: any) {
    if (
      error.name === "NoSuchKey" ||
      error.Code === "NoSuchKey" ||
      error.$metadata?.httpStatusCode === 404
    ) {
      return new NextResponse("Media Asset Not Found", { status: 404 });
    }
    console.error("GET /api/media error:", error);
    return new NextResponse("Media Asset Not Found", { status: 404 });
  }
}
