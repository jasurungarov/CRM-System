import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME || "";
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

/** Mijoz hujjati uchun noyob R2 kaliti: documents/<clientId>/<docId>-<vaqt>-<fayl-nomi> */
export function buildDocumentKey(clientId: string, docId: string, originalFileName: string): string {
  const safeName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `documents/${clientId}/${docId}-${Date.now()}-${safeName}`;
}

export function extractKeyFromUrl(fileUrl: string): string | null {
  if (!fileUrl || !R2_PUBLIC_URL) return null;
  if (!fileUrl.startsWith(R2_PUBLIC_URL)) return null;
  return fileUrl.slice(R2_PUBLIC_URL.length).replace(/^\//, "");
}

export async function uploadBufferToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `${R2_PUBLIC_URL}/${key}`;
}

export async function deleteObjectFromR2(fileUrl: string): Promise<void> {
  const key = extractKeyFromUrl(fileUrl);
  if (!key) return;
  try {
    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch {
    // Fayl allaqachon yo'q bo'lishi mumkin — kritik xato emas
  }
}
