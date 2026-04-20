/**
 * Cloudflare R2 (API compatible S3).
 *
 * Upload (serveur) :
 * - R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 *
 * Affichage dans le navigateur :
 * - R2_PUBLIC_BASE_URL = URL publique du bucket, sans slash final.
 *   Ce doit être l’URL « Public bucket » (.r2.dev) ou un domaine personnalisé
 *   configuré sur le bucket (R2 → bucket → Settings → Public access).
 *
 * Ne pas utiliser l’endpoint API S3 (...r2.cloudflarestorage.com) : le GET
 * anonyme depuis le navigateur y renvoie 400.
 */

function trimEnv(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v || undefined;
}

/** True si la valeur ressemble à l’hôte API S3 R2 (inadapté au src d’une image). */
export function isR2S3ApiEndpointUrl(url: string): boolean {
  const trimmed = url.trim();
  try {
    const { hostname } = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    );
    return hostname.endsWith("r2.cloudflarestorage.com");
  } catch {
    return trimmed.includes("r2.cloudflarestorage.com");
  }
}

/** True si l’upload serveur vers R2 et une base d’URL publique sont définis. */
export function isR2PictureUploadConfigured(): boolean {
  return Boolean(
    trimEnv("R2_ACCOUNT_ID") &&
      trimEnv("R2_ACCESS_KEY_ID") &&
      trimEnv("R2_SECRET_ACCESS_KEY") &&
      trimEnv("R2_BUCKET_NAME") &&
      trimEnv("R2_PUBLIC_BASE_URL")
  );
}

export function assertR2PictureUploadConfigured(): void {
  if (!isR2PictureUploadConfigured()) {
    throw new Error(
      "R2 non configuré : définissez R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME et R2_PUBLIC_BASE_URL."
    );
  }
}

export function getR2AccountId(): string {
  const id = trimEnv("R2_ACCOUNT_ID");
  if (!id) throw new Error("R2_ACCOUNT_ID manquant");
  return id;
}

export function getR2BucketName(): string {
  const name = trimEnv("R2_BUCKET_NAME");
  if (!name) throw new Error("R2_BUCKET_NAME manquant");
  return name;
}

export function getR2PublicBaseUrl(): string {
  const base = trimEnv("R2_PUBLIC_BASE_URL");
  if (!base) throw new Error("R2_PUBLIC_BASE_URL manquant");
  const normalized = base.replace(/\/$/, "");
  if (isR2S3ApiEndpointUrl(normalized)) {
    throw new Error(
      "R2_PUBLIC_BASE_URL ne doit pas être l’endpoint API (...r2.cloudflarestorage.com). Utilisez l’URL publique du bucket (ex. https://pub-xxxxx.r2.dev) ou votre domaine custom, depuis Cloudflare R2 → bucket → Settings → Public access."
    );
  }
  return normalized;
}

/**
 * Base d’URL pour les images affichées. Retourne null si absente ou si elle
 * pointe par erreur vers l’endpoint API (pour retomber sur la photo Clerk).
 */
export function getSafeR2PublicBaseUrlForDisplay(): string | null {
  const base = trimEnv("R2_PUBLIC_BASE_URL");
  if (!base) return null;
  const normalized = base.replace(/\/$/, "");
  if (isR2S3ApiEndpointUrl(normalized)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[R2] R2_PUBLIC_BASE_URL ressemble à l’endpoint API S3 (...r2.cloudflarestorage.com). " +
          "Définissez plutôt l’URL publique du bucket (.r2.dev ou domaine custom) pour afficher les images dans le navigateur."
      );
    }
    return null;
  }
  return normalized;
}
