import { NextResponse } from "next/server";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type || "image/webp";

    const result = await uploadToR2(key, buffer, contentType);

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.publicUrl,
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
