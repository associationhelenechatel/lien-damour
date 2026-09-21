"use server";

import {
  createPresignedUploadUrl,
  deleteR2ObjectIfPresent,
  headR2Object,
  type R2ObjectMetadata,
} from "@/lib/r2/presigned-upload";

function formatMaxSize(maxBytes: number): string {
  return `${Math.round(maxBytes / (1024 * 1024))} Mo`;
}

export type PrepareR2UploadResult =
  | {
      ok: true;
      uploadUrl: string;
      objectKey: string;
      contentType: string;
      contentDisposition?: string;
      cacheControl?: string;
    }
  | { ok: false; error: string };

/**
 * 1ʳᵉ étape commune à tout upload direct navigateur → R2 : valide la taille
 * déclarée puis génère l’URL présignée. Les contrôles d’identité/permission
 * et le nom d’objet sont du ressort de l’appelant (spécifiques au domaine).
 */
export async function prepareR2Upload(params: {
  objectKey: string;
  contentType: string;
  size: number;
  maxBytes: number;
  contentDisposition?: string;
  cacheControl?: string;
}): Promise<PrepareR2UploadResult> {
  if (!Number.isFinite(params.size) || params.size <= 0) {
    return { ok: false, error: "Aucun fichier valide." };
  }
  if (params.size > params.maxBytes) {
    return {
      ok: false,
      error: `Fichier trop volumineux (maximum ${formatMaxSize(params.maxBytes)}).`,
    };
  }

  try {
    const presigned = await createPresignedUploadUrl({
      objectKey: params.objectKey,
      contentType: params.contentType,
      contentDisposition: params.contentDisposition,
      cacheControl: params.cacheControl,
    });
    return { ok: true, objectKey: params.objectKey, ...presigned };
  } catch (e) {
    console.error("R2 createPresignedUrl error:", e);
    return {
      ok: false,
      error: "Échec de la préparation de l’envoi vers le stockage.",
    };
  }
}

export type ConfirmR2UploadResult =
  | { ok: true; meta: R2ObjectMetadata }
  | { ok: false; error: string };

/**
 * 2ᵉ étape commune : après un envoi direct réussi, relit l’objet réel dans R2
 * (source de vérité, jamais les valeurs déclarées par le client) et rejette
 * (en supprimant l’objet) s’il dépasse la limite. L’écriture en base reste du
 * ressort de l’appelant (spécifique au domaine : colonne unique vs table de
 * documents multiples).
 */
export async function confirmR2Upload(params: {
  objectKey: string;
  maxBytes: number;
  isOwnedKey: boolean;
}): Promise<ConfirmR2UploadResult> {
  if (!params.isOwnedKey) {
    return { ok: false, error: "Clé de fichier invalide." };
  }

  let meta: R2ObjectMetadata | null;
  try {
    meta = await headR2Object(params.objectKey);
  } catch (e) {
    console.error("R2 HeadObject error:", e);
    return { ok: false, error: "Impossible de vérifier le fichier envoyé." };
  }

  if (!meta) {
    return {
      ok: false,
      error: "Fichier introuvable dans le stockage. Réessayez l’envoi.",
    };
  }

  if (meta.sizeBytes > params.maxBytes) {
    try {
      await deleteR2ObjectIfPresent(params.objectKey);
    } catch {
      /* best effort */
    }
    return {
      ok: false,
      error: `Fichier trop volumineux (maximum ${formatMaxSize(params.maxBytes)}).`,
    };
  }

  return { ok: true, meta };
}
