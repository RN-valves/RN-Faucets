import { NextResponse } from "next/server";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const key = formData.get("key") as string | null;

    if (!file || !key) {
      return NextResponse.json(
        { success: false, error: "File and Key are required for R2 upload" },
        { status: 400 }
      );
    }

    // Limit to 100MB for video/media uploads
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size exceeds the 100MB limit" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Detect MIME type and extension accurately
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isVideo = file.type?.startsWith("video/") || ["mp4", "webm", "mov", "m4v", "mkv"].includes(ext);

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

    // Sanitize key extension based on media type
    let finalKey = key;
    if (isVideo) {
      const videoExt = ["mp4", "webm", "mov"].includes(ext) ? ext : "mp4";
      finalKey = finalKey.replace(/\.(webp|jpg|jpeg|png|gif)$/i, `.${videoExt}`);
      if (!/\.[a-zA-Z0-9]+$/.test(finalKey)) {
        finalKey = `${finalKey}.${videoExt}`;
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
    const { key } = await req.json();
    if (!key) {
      return NextResponse.json({ success: false, error: "Key required" }, { status: 400 });
    }

    await deleteFromR2(key);
    return NextResponse.json({ success: true, message: "R2 object deleted" });
  } catch (error: any) {
    console.error("DELETE /api/upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
