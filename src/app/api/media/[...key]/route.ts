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
    const requestedWidthRaw = parseInt(url.searchParams.get("w") || "0", 10);
    const requestedQualityRaw = parseInt(url.searchParams.get("q") || "80", 10);
    const requestedWidth =
      !isNaN(requestedWidthRaw) && requestedWidthRaw > 0
        ? Math.min(Math.max(requestedWidthRaw, 32), 2560)
        : 0;
    const requestedQuality =
      !isNaN(requestedQualityRaw) && requestedQualityRaw > 0
        ? Math.min(Math.max(requestedQualityRaw, 40), 95)
        : 80;
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
          "Cache-Control": "public, max-age=31536000, immutable",
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

    // Use long 1-year cache lifetime for all static R2 media assets (satisfies Lighthouse efficient cache lifetimes)
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    const isRasterImage =
      contentType === "image/png" ||
      contentType === "image/jpeg" ||
      contentType === "image/webp" ||
      contentType === "image/avif";

    const shouldOptimizeWithSharp =
      isRasterImage &&
      !rangeHeader &&
      (requestedWidth > 0 ||
        (lowerKey.endsWith(".webp") && contentType !== "image/webp") ||
        (response.ContentLength !== undefined && response.ContentLength > 140000));

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
          const targetWidth =
            requestedWidth > 0
              ? requestedWidth
              : lowerKey.includes("catalogue/categories/") && lowerKey.includes("home_")
              ? 640
              : 1600;
          pipeline = pipeline.resize({
            width: targetWidth,
            withoutEnlargement: true,
          });
          const optimized = await pipeline
            .webp({ quality: requestedQuality, effort: 3 })
            .toBuffer();

          if (optimized.length < buffer.length || requestedWidth > 0 || contentType !== "image/webp") {
            buffer = optimized;
            contentType = "image/webp";
            headers.set("Content-Type", "image/webp");
          }
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
