import { getSafeR2PublicBaseUrlForDisplay } from "@/lib/r2/config";

export { isR2PictureUploadConfigured } from "@/lib/r2/config";

export function publicUrlR2(
  objectKey: string | null | undefined
): string | null {
  const key = objectKey?.trim();
  if (!key) return null;
  const base = getSafeR2PublicBaseUrlForDisplay();
  if (!base) return null;
  return `${base}/${key}`;
}

/**
 * URL à afficher pour la photo du membre : R2 si une image est stockée et que la base publique est définie, sinon Clerk.
 */
export function resolveMemberProfileImageUrl(
  pictureObjectKey: string | null | undefined,
  clerkProfileImageUrl: string | null | undefined
): string | null {
  const r2 = publicUrlR2(pictureObjectKey);
  if (r2) return r2;
  const clerk = clerkProfileImageUrl?.trim();
  return clerk || null;
}
