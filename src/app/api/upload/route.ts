import { NextResponse } from "next/server";
import { uploadToR2, deleteFromR2, getPresignedUploadUrl } from "@/lib/r2";
import { requireAdminAuth, validateMediaUpload, sanitizeStorageKey } from "@/lib/security";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET /api/upload - Generates presigned S3/R2 direct upload URLs for large files (videos, high-res images).
 * Bypasses all server body size limits by uploading directly from browser to Cloudflare R2.
 */
export async function GET(req: Request) {
  try {
    const adminSession = await requireAdminAuth(req);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required to upload assets." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const filename = searchParams.get("filename") || "media";
    const rawContentType = searchParams.get("contentType") || "";
    const size = parseInt(searchParams.get("size") || "0", 10);

    if (!key) {
      return NextResponse.json({ success: false, error: "Storage key is required." }, { status: 400 });
    }

    // Validate media format & size
    const validation = validateMediaUpload(filename, rawContentType, size);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const sanitizedKey = sanitizeStorageKey(key);
    if (!sanitizedKey) {
      return NextResponse.json({ success: false, error: "Invalid storage key specified." }, { status: 400 });
    }

    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const isVideo = validation.mediaType === "video";
    const isDoc = validation.mediaType === "document" || ext === "pdf";

    let contentType = rawContentType;
    if (!contentType || contentType === "application/octet-stream") {
      if (ext === "mp4" || ext === "m4v") contentType = "video/mp4";
      else if (ext === "webm") contentType = "video/webm";
      else if (ext === "mov") contentType = "video/quicktime";
      else if (ext === "png") contentType = "image/png";
      else if (["jpg", "jpeg", "jfif", "pjpeg", "pjp"].includes(ext)) contentType = "image/jpeg";
      else if (ext === "webp") contentType = "image/webp";
      else if (ext === "avif") contentType = "image/avif";
      else if (ext === "gif") contentType = "image/gif";
      else if (ext === "svg") contentType = "image/svg+xml";
      else if (ext === "pdf") contentType = "application/pdf";
      else contentType = isVideo ? "video/mp4" : isDoc ? "application/pdf" : "image/jpeg";
    }

    // Sanitize key extension based on media type
    let finalKey = sanitizedKey;
    if (isVideo) {
      const videoExt = ["mp4", "webm", "mov"].includes(ext) ? ext : "mp4";
      finalKey = finalKey.replace(/\.(webp|jpg|jpeg|jfif|png|gif|svg|avif)$/i, `.${videoExt}`);
      if (!/\.[a-zA-Z0-9]+$/.test(finalKey)) {
        finalKey = `${finalKey}.${videoExt}`;
      }
    } else if (isDoc || ext === "pdf") {
      finalKey = finalKey.replace(/\.(webp|jpg|jpeg|jfif|png|gif|svg|avif|mp4|webm|mov|m4v)$/i, ".pdf");
      if (!/\.pdf$/i.test(finalKey)) {
        finalKey = `${finalKey}.pdf`;
      }
    } else if (ext === "svg" || rawContentType.includes("svg")) {
      finalKey = finalKey.replace(/\.(webp|jpg|jpeg|jfif|png|gif|mp4|webm|mov|m4v|pdf)$/i, ".svg");
      if (!/\.svg$/i.test(finalKey)) {
        finalKey = `${finalKey}.svg`;
      }
    }

    const presigned = await getPresignedUploadUrl(finalKey, contentType);

    return NextResponse.json({
      success: true,
      presignedUrl: presigned.uploadUrl,
      publicUrl: presigned.publicUrl,
      key: presigned.key,
      contentType,
      mediaType: isVideo ? "video" : "image",
    });
  } catch (error: any) {
    console.error("GET /api/upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate presigned upload URL" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const adminSession = await requireAdminAuth(req);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required to upload assets." },
        { status: 401 }
      );
    }

    let buffer: Buffer;
    let filename = "";
    let rawKey = "";
    let contentType = req.headers.get("content-type") || "application/octet-stream";

    const headerKey = req.headers.get("x-file-key");
    const headerFilename = req.headers.get("x-file-name");

    if (headerKey) {
      // ── Method A: Direct binary stream (bypasses all multipart FormData limits!) ──
      rawKey = decodeURIComponent(headerKey);
      filename = headerFilename ? decodeURIComponent(headerFilename) : rawKey.split("/").pop() || "media";
      const arrayBuffer = await req.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // ── Method B: Multipart FormData fallback ──
      let formData: FormData;
      try {
        formData = await req.formData();
      } catch (parseErr: any) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Failed to parse file upload body. For large files (>10MB), use direct presigned uploads.",
            details: parseErr?.message,
          },
          { status: 400 }
        );
      }

      const file = formData.get("file") as File | null;
      rawKey = (formData.get("key") as string) || "";

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file was received in upload request" },
          { status: 400 }
        );
      }
      filename = file.name;
      contentType = file.type || contentType;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    if (!rawKey) {
      return NextResponse.json(
        { success: false, error: "Media storage key is missing" },
        { status: 400 }
      );
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Uploaded file is empty" },
        { status: 400 }
      );
    }

    // Validate media format & size
    const validation = validateMediaUpload(filename, contentType, buffer.length);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const sanitizedKey = sanitizeStorageKey(rawKey);
    if (!sanitizedKey) {
      return NextResponse.json(
        { success: false, error: "Invalid storage key specified." },
        { status: 400 }
      );
    }

    // Detect MIME type and extension accurately
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const isVideo = validation.mediaType === "video";
    const isDoc = validation.mediaType === "document" || ext === "pdf";

    if (!contentType || contentType === "application/octet-stream") {
      if (ext === "mp4" || ext === "m4v") contentType = "video/mp4";
      else if (ext === "webm") contentType = "video/webm";
      else if (ext === "mov") contentType = "video/quicktime";
      else if (ext === "png") contentType = "image/png";
      else if (["jpg", "jpeg", "jfif", "pjpeg", "pjp"].includes(ext)) contentType = "image/jpeg";
      else if (ext === "webp") contentType = "image/webp";
      else if (ext === "avif") contentType = "image/avif";
      else if (ext === "gif") contentType = "image/gif";
      else if (ext === "svg") contentType = "image/svg+xml";
      else if (ext === "pdf") contentType = "application/pdf";
      else contentType = isVideo ? "video/mp4" : isDoc ? "application/pdf" : "image/jpeg";
    }

    if (ext === "svg" || contentType?.includes("svg")) {
      contentType = "image/svg+xml";
    } else if (["jfif", "pjpeg", "pjp"].includes(ext) || contentType?.includes("jfif")) {
      contentType = "image/jpeg";
    } else if (ext === "pdf" || contentType?.includes("pdf")) {
      contentType = "application/pdf";
    }

    // Sanitize key extension based on media type
    let finalKey = sanitizedKey;
    if (isVideo) {
      const videoExt = ["mp4", "webm", "mov"].includes(ext) ? ext : "mp4";
      finalKey = finalKey.replace(/\.(webp|jpg|jpeg|jfif|png|gif|svg|avif)$/i, `.${videoExt}`);
      if (!/\.[a-zA-Z0-9]+$/.test(finalKey)) {
        finalKey = `${finalKey}.${videoExt}`;
      }
    } else if (isDoc || ext === "pdf") {
      finalKey = finalKey.replace(/\.(webp|jpg|jpeg|jfif|png|gif|svg|avif|mp4|webm|mov|m4v)$/i, ".pdf");
      if (!/\.pdf$/i.test(finalKey)) {
        finalKey = `${finalKey}.pdf`;
      }
    } else if (ext === "svg" || contentType?.includes("svg")) {
      finalKey = finalKey.replace(/\.(webp|jpg|jpeg|jfif|png|gif|mp4|webm|mov|m4v|pdf)$/i, ".svg");
      if (!/\.svg$/i.test(finalKey)) {
        finalKey = `${finalKey}.svg`;
      }
    }

    const result = await uploadToR2(finalKey, buffer, contentType);

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.publicUrl,
      mediaType: isVideo ? "video" : "image",
    });
  } catch (error: any) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload to Cloudflare R2" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const adminSession = await requireAdminAuth(req);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required to delete assets." },
        { status: 401 }
      );
    }

    const { key } = await req.json();
    if (!key) {
      return NextResponse.json({ success: false, error: "Key required" }, { status: 400 });
    }

    const sanitizedKey = sanitizeStorageKey(key);
    await deleteFromR2(sanitizedKey);
    return NextResponse.json({ success: true, message: "R2 object deleted" });
  } catch (error: any) {
    console.error("DELETE /api/upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
