import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getR2BucketName } from "./config";
import { getR2S3Client } from "./client";

const UPLOAD_URL_EXPIRY_SECONDS = 5 * 60;

export type PresignedUploadUrl = {
  uploadUrl: string;
  contentType: string;
  contentDisposition?: string;
  cacheControl?: string;
};

/**
 * URL présignée (PUT) permettant au navigateur d’envoyer un fichier
 * directement à R2, sans passer par le serveur Next.js (contourne la limite
 * de payload des Server Actions / fonctions serverless en production).
 *
 * Tout en-tête retourné ici (`contentType`, `contentDisposition`,
 * `cacheControl`) doit être renvoyé tel quel comme en-tête de la requête PUT
 * par le client : il fait partie de la signature.
 */
export async function createPresignedUploadUrl(params: {
  objectKey: string;
  contentType: string;
  contentDisposition?: string;
  cacheControl?: string;
}): Promise<PresignedUploadUrl> {
  const contentType =
    params.contentType.split(";")[0]?.trim() || "application/octet-stream";

  const client = getR2S3Client();
  const command = new PutObjectCommand({
    Bucket: getR2BucketName(),
    Key: params.objectKey,
    ContentType: contentType,
    ContentDisposition: params.contentDisposition,
    CacheControl: params.cacheControl,
  });
  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: UPLOAD_URL_EXPIRY_SECONDS,
  });

  return {
    uploadUrl,
    contentType,
    contentDisposition: params.contentDisposition,
    cacheControl: params.cacheControl,
  };
}

export type R2ObjectMetadata = {
  sizeBytes: number;
  contentType: string;
};

/** Métadonnées réelles de l’objet dans R2 (source de vérité après un upload direct). */
export async function headR2Object(
  objectKey: string
): Promise<R2ObjectMetadata | null> {
  const client = getR2S3Client();
  try {
    const result = await client.send(
      new HeadObjectCommand({ Bucket: getR2BucketName(), Key: objectKey })
    );
    return {
      sizeBytes: result.ContentLength ?? 0,
      contentType: result.ContentType || "application/octet-stream",
    };
  } catch (e) {
    const name = (e as { name?: string })?.name;
    if (name === "NotFound" || name === "NoSuchKey") return null;
    throw e;
  }
}

export async function deleteR2ObjectIfPresent(
  objectKey: string | null | undefined
): Promise<void> {
  const key = objectKey?.trim();
  if (!key) return;
  const client = getR2S3Client();
  await client.send(
    new DeleteObjectCommand({ Bucket: getR2BucketName(), Key: key })
  );
}
