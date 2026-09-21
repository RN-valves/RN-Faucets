import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET } from "@/lib/r2";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: keyParts } = await params;
    const key = keyParts.join("/");

    if (!key) {
      return new NextResponse("Media Key is required", { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      return new NextResponse("Media Asset Not Found", { status: 404 });
    }

    const byteArray = await response.Body.transformToByteArray();
    const contentType = response.ContentType || "image/webp";

    return new NextResponse(Buffer.from(byteArray), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.Code === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return new NextResponse("Media Asset Not Found", { status: 404 });
    }
    console.error("GET /api/media error:", error);
    return new NextResponse("Media Asset Not Found", { status: 404 });
  }
}
