import { S3Client } from "@aws-sdk/client-s3";

import { getR2AccountId } from "./config";

let client: S3Client | null = null;

export function getR2S3Client(): S3Client {
  if (!client) {
    const accountId = getR2AccountId();
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    if (!accessKeyId || !secretAccessKey) {
      throw new Error("R2_ACCESS_KEY_ID ou R2_SECRET_ACCESS_KEY manquant");
    }
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return client;
}
