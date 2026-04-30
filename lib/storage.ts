import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

/**
 * Buat signed URL untuk upload file (berlaku 1 jam)
 */
export async function createUploadSignedUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

/**
 * Buat signed URL untuk download/akses file (berlaku 4 jam)
 */
export async function createDownloadSignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 14400 }); // 4 jam
}

/**
 * Generate key unik untuk file
 */
export function generateFileKey(
  folder: string,
  filename: string,
  userId: string
): string {
  const timestamp = Date.now();
  const ext = filename.split(".").pop() ?? "bin";
  return `${folder}/${userId}/${timestamp}.${ext}`;
}

/**
 * Tipe file yang diizinkan
 */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB
