import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET } from "@/lib/r2";

import { sanitizeStorageKey } from "@/lib/security";

export const dynamic = "force-dynamic";

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
    const lowerKey = key.toLowerCase();
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
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    if (response.ContentRange) {
      headers.set("Content-Range", response.ContentRange);
    }
    if (response.ContentLength !== undefined) {
      headers.set("Content-Length", response.ContentLength.toString());
    }

    const status = response.$metadata?.httpStatusCode || (response.ContentRange ? 206 : 200);

    let body: any;
    if (typeof (response.Body as any)?.transformToWebStream === "function") {
      body = (response.Body as any).transformToWebStream();
    } else {
      const byteArray = await response.Body.transformToByteArray();
      body = Buffer.from(byteArray);
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
