import { randomUUID } from "node:crypto";

export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

/** Garde le nom de fichier lisible dans la clé objet tout en restant sûr pour S3/URLs. */
function sanitizeFileNameForKey(name: string): string {
  const flattened = name.trim().replace(/[/\\]/g, "_");
  const safe = flattened.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-150);
  return safe || "fichier";
}

/** Aucune restriction de format : tout type de fichier (PDF, Word, etc.) est accepté. */
export function memberDocumentObjectKey(
  memberId: number,
  originalFileName: string
): string {
  return `family-members/${memberId}/documents/${randomUUID()}-${sanitizeFileNameForKey(originalFileName)}`;
}

export function isMemberDocumentObjectKeyForMember(
  key: string,
  memberId: number
): boolean {
  return key.startsWith(`family-members/${memberId}/documents/`);
}

/** `Content-Disposition` forçant le téléchargement sous le nom d’origine (accents gérés, RFC 6266). */
export function buildDocumentContentDisposition(fileName: string): string {
  const asciiFallback =
    fileName.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "'") || "fichier";
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
