import { randomUUID } from "node:crypto";

export const MAX_PICTURE_BYTES = 5 * 1024 * 1024;
export const PICTURE_CACHE_CONTROL = "public, max-age=31536000, immutable";

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

/** Type MIME normalisé à partir de l’extension (fallback quand `file.type` est vide). */
export function imageContentTypeFromExtension(extension: string): string {
  return `image/${extension === "jpg" ? "jpeg" : extension}`;
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

export function projectLogoObjectKey(projectId: number, extension: string): string {
  const safeExt = extension.replace(/^\./, "").toLowerCase();
  return `projects/${projectId}/${randomUUID()}.${safeExt}`;
}

export function isProjectLogoObjectKeyForProject(
  key: string,
  projectId: number
): boolean {
  return key.startsWith(`projects/${projectId}/`);
}
