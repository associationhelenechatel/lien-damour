import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

import { getR2BucketName } from "./config";
import { getR2S3Client } from "./client";

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export function assertAllowedImageType(contentType: string): string {
  const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  const ext = ALLOWED_TYPES.get(normalized);
  if (!ext) {
    throw new Error(
      "Format non pris en charge. Utilisez JPEG, PNG, WebP ou GIF."
    );
  }
  return ext;
}

export function memberPictureObjectKey(memberId: number, extension: string): string {
  const safeExt = extension.replace(/^\./, "").toLowerCase();
  return `family-members/${memberId}/${randomUUID()}.${safeExt}`;
}

export function isMemberPictureObjectKeyForMember(
  key: string,
  memberId: number
): boolean {
  return key.startsWith(`family-members/${memberId}/`);
}

export async function putMemberPictureObject(
  objectKey: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  if (body.length > MAX_BYTES) {
    throw new Error("Fichier trop volumineux (maximum 5 Mo).");
  }
  const client = getR2S3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: objectKey,
      Body: body,
      ContentType: contentType.split(";")[0]?.trim(),
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
}

export async function deleteMemberPictureObjectIfPresent(
  objectKey: string | null | undefined
): Promise<void> {
  const key = objectKey?.trim();
  if (!key) return;
  const client = getR2S3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    })
  );
}
