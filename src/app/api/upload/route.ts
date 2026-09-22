import { NextResponse } from "next/server";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";
import { validateMediaUpload, sanitizeStorageKey, validateAdminAuth } from "@/lib/security";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawKey = formData.get("key") as string | null;

    if (!file) {
      return apiError("No file was received in upload request.", { status: 400 });
    }
    if (!rawKey) {
      return apiError("Media storage key is missing.", { status: 400 });
    }

    const key = sanitizeStorageKey(rawKey);
    if (!key) {
      return apiError("Invalid storage key format.", { status: 400 });
    }

    // Strict media type & file extension validation
    const validation = validateMediaUpload(file.name, file.type, file.size);
    if (!validation.valid) {
      return apiError(validation.error || "File validation failed.", { status: 400 });
    }

    const isVideo = validation.mediaType === "video";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Detect accurate MIME type
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    let contentType = file.type;
    if (!contentType || contentType === "application/octet-stream") {
      if (ext === "mp4" || ext === "m4v") contentType = "video/mp4";
      else if (ext === "webm") contentType = "video/webm";
      else if (ext === "mov") contentType = "video/quicktime";
      else if (ext === "png") contentType = "image/png";
      else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
      else if (ext === "webp") contentType = "image/webp";
      else if (ext === "svg") contentType = "image/svg+xml";
      else contentType = isVideo ? "video/mp4" : "image/webp";
    }

    if (ext === "svg" || file.type?.includes("svg")) {
      contentType = "image/svg+xml";
    }

    // Sanitize extension matching
    let finalKey = key;
    if (isVideo) {
      const videoExt = ["mp4", "webm", "mov"].includes(ext) ? ext : "mp4";
      finalKey = finalKey.replace(/\.(webp|jpg|jpeg|png|gif|svg)$/i, `.${videoExt}`);
      if (!/\.[a-zA-Z0-9]+$/.test(finalKey)) {
        finalKey = `${finalKey}.${videoExt}`;
      }
    } else if (ext === "svg" || file.type?.includes("svg")) {
      finalKey = finalKey.replace(/\.(webp|jpg|jpeg|png|gif|mp4|webm|mov|m4v)$/i, ".svg");
      if (!/\.svg$/i.test(finalKey)) {
        finalKey = `${finalKey}.svg`;
      }
    }

    const result = await uploadToR2(finalKey, buffer, contentType);

    return apiSuccess({
      key: result.key,
      url: result.publicUrl,
      mediaType: isVideo ? "video" : "image",
    });
  } catch (error: any) {
    return handleApiError(error, "POST /api/upload");
  }
}

export async function DELETE(req: Request) {
  try {
    // Require admin authorization to delete media assets
    const isAdmin = validateAdminAuth(req);
    if (!isAdmin) {
      return apiError("Unauthorized: Only administrators can delete media assets.", { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const rawKey = body.key;
    if (!rawKey) {
      return apiError("Media storage key is required.", { status: 400 });
    }

    const key = sanitizeStorageKey(rawKey);
    await deleteFromR2(key);
    return apiSuccess({ message: "Media object deleted successfully." });
  } catch (error: any) {
    return handleApiError(error, "DELETE /api/upload");
  }
}
