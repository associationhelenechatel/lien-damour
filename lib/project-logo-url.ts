import { publicUrlR2 } from "@/lib/member-profile-image";

const PROJECT_LOGO_KEY = /^projects\/([0-9]+)\/[^/]+$/;

/**
 * Valeur à persister en base : uniquement une clé R2 `projects/{id}/...`,
 * ou `null`. Tout le reste (URL, chemin, clé invalide) → `null`.
 */
export function sanitizeProjectLogoForDb(
  value: string | null | undefined,
  projectId: number | null | undefined
): string | null {
  const v = value?.trim();
  if (!v) return null;
  const m = v.match(PROJECT_LOGO_KEY);
  if (!m) return null;
  const keyProjectId = parseInt(m[1]!, 10);
  if (projectId != null && keyProjectId !== projectId) return null;
  return v;
}

/**
 * URL d’affichage : uniquement à partir d’une clé R2 valide ; sinon image par défaut.
 */
export function resolveProjectLogoSrc(
  logo: string | null | undefined,
  fallback: string
): string {
  const v = logo?.trim();
  if (!v || !PROJECT_LOGO_KEY.test(v)) return fallback;
  return publicUrlR2(v) ?? fallback;
}

/**
 * URL publique R2 pour une clé valide (à résoudre côté serveur : `R2_PUBLIC_BASE_URL` y est disponible).
 * Dans un composant client, préférer `logoDisplayUrl` renvoyé par `getProjects()`.
 */
export function resolveProjectLogoPublicUrl(
  logo: string | null | undefined
): string | null {
  const v = logo?.trim();
  if (!v || !PROJECT_LOGO_KEY.test(v)) return null;
  return publicUrlR2(v) ?? null;
}

/** Vérifie qu’une URL publique pointe bien vers la clé objet attendue (suffixe de chemin). */
export function publicR2UrlMatchesObjectKey(
  publicUrl: string,
  objectKey: string
): boolean {
  const key = objectKey.trim();
  if (!key || !publicUrl.trim()) return false;
  try {
    const path = decodeURIComponent(
      new URL(publicUrl.trim()).pathname.replace(/^\/+/, "")
    );
    return path === key || path.endsWith(`/${key}`);
  } catch {
    return false;
  }
}

/** Chemins applicatifs ou statiques (Next/Image). */
export function isProjectLogoSrcLocalPath(src: string): boolean {
  return src.startsWith("/");
}

/** URL R2 ou autre hôte distant (balise img, hors configuration next/image). */
export function isProjectLogoSrcRemoteHttp(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}
