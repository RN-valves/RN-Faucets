import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";

export const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || "rnfaucets-media";
export const R2_ENDPOINT =
  process.env.CLOUDFLARE_R2_ENDPOINT ||
  (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "https://bf7e318076e373b40fa58fda9d78bfc4.r2.cloudflarestorage.com");

export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function getPresignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  const publicUrl = `/api/media/${key}?v=${Date.now()}`;
  return { key, uploadUrl, publicUrl };
}

export async function uploadToR2(key: string, buffer: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Return local media proxy URL with cache-busting timestamp version
  const publicUrl = `/api/media/${key}?v=${Date.now()}`;
  return { key, publicUrl };
}

export async function deleteFromR2(key: string) {
  if (!key) return;
  try {
    // Strip query string and proxy prefix if present
    let cleanKey = key.split("?")[0];
    cleanKey = cleanKey.replace(/^\/api\/media\//, "");
    cleanKey = cleanKey.replace(`${R2_ENDPOINT}/${R2_BUCKET}/`, "");

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: cleanKey,
    });
    await r2Client.send(command);
  } catch (err) {
    console.error("R2 Delete error for key:", key, err);
  }
}
