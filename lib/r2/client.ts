import { S3Client } from "@aws-sdk/client-s3";

import { getR2AccountId } from "./config";

let client: S3Client | null = null;

/**
 * `R2_ENDPOINT` bascule le SDK sur un stockage S3 local (LocalStack, voir
 * docker-compose.yml) au lieu de l'API R2 de production — pratique pour
 * développer sans écrire dans le bucket de prod. LocalStack exige
 * l'adressage "path-style" (`forcePathStyle`) et, contrairement à R2, une
 * vraie région AWS plutôt que le pseudo-code `auto` (d'où `R2_REGION`).
 */
export function getR2S3Client(): S3Client {
  if (!client) {
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    if (!accessKeyId || !secretAccessKey) {
      throw new Error("R2_ACCESS_KEY_ID ou R2_SECRET_ACCESS_KEY manquant");
    }

    const customEndpoint = process.env.R2_ENDPOINT?.trim();
    const region = process.env.R2_REGION?.trim() || "auto";

    client = new S3Client({
      region,
      endpoint: customEndpoint || `https://${getR2AccountId()}.r2.cloudflarestorage.com`,
      forcePathStyle: Boolean(customEndpoint),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return client;
}
