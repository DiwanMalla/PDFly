import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 Configuration
const R2_CONFIG = {
  region: "auto", // Cloudflare R2 uses 'auto' for region
  endpoint:
    process.env.CLOUDFLARE_R2_ENDPOINT ||
    "https://ea9ab527d039f10a64b07aaadf30cded.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId:
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
      "b7cc1177192e7fbff3defd0fc2006fac",
    secretAccessKey:
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
      "26554cf0b6933249fc129989bbb33db95339a3574ab84f09494061289f8183fe",
  },
};

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "pdfly-storage"; // You'll need to create this bucket in Cloudflare

// Initialize S3 client for Cloudflare R2
export const r2Client = new S3Client(R2_CONFIG);

// Upload file to Cloudflare R2
export async function uploadToR2(
  file: File,
  fileName: string,
  folder: string = "uploads"
): Promise<string> {
  try {
    const fileBuffer = await file.arrayBuffer();
    const key = `${folder}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: new Uint8Array(fileBuffer),
      ContentType: file.type,
      Metadata: {
        "original-name": file.name,
        "upload-date": new Date().toISOString(),
      },
    });

    await r2Client.send(command);
    return key; // Return the key for later retrieval
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error("Failed to upload file to storage");
  }
}

// Get file URL from Cloudflare R2 (for preview)
export function getR2FileUrl(key: string): string {
  // For public access, you might need to configure your R2 bucket for public access
  // or use signed URLs for private access
  return `${R2_CONFIG.endpoint}/${BUCKET_NAME}/${key}`;
}

// Generate a unique filename
export function generateFileName(originalName: string, action: string): string {
  const timestamp = Date.now();
  const extension = originalName.split(".").pop();
  const baseName = originalName.replace(`.${extension}`, "");
  return `${baseName}_${action}_${timestamp}.${extension}`;
}

// TODO: Implement file processing functions
export async function processPDF(
  file: File,
  action: "merge" | "split" | "compress" | "convert"
): Promise<{ previewUrl: string; downloadKey?: string }> {
  // For now, just upload the original file and return preview URL
  // In a real implementation, you'd process the PDF here

  const uploadKey = await uploadToR2(file, file.name, `processed/${action}`);
  const previewUrl = URL.createObjectURL(file); // Local preview for unregistered users

  return {
    previewUrl,
    downloadKey: uploadKey, // Only available for registered users
  };
}
