"use server";

import { eq } from "drizzle-orm";

import { db } from "@/drizzle/client";
import { familyMember } from "@/drizzle/schema";
import { canManageMemberOwnContent } from "@/lib/api/permissions";
import { updateFamilyMember } from "@/lib/api/family";
import { confirmR2Upload, prepareR2Upload } from "@/lib/api/r2-upload-flow";
import {
  assertR2PictureUploadConfigured,
  getR2PublicBaseUrl,
  isR2PictureUploadConfigured,
} from "@/lib/r2/config";
import {
  assertAllowedImageType,
  imageContentTypeFromExtension,
  isMemberPictureObjectKeyForMember,
  MAX_PICTURE_BYTES,
  memberPictureObjectKey,
  PICTURE_CACHE_CONTROL,
} from "@/lib/r2/member-picture-storage";
import { deleteR2ObjectIfPresent } from "@/lib/r2/presigned-upload";
import { publicUrlR2 } from "@/lib/member-profile-image";

export type CreateMemberProfilePictureUploadResult =
  | {
      ok: true;
      uploadUrl: string;
      objectKey: string;
      contentType: string;
      cacheControl?: string;
    }
  | { ok: false; error: string };

/**
 * 1ʳᵉ étape : génère une URL présignée R2 pour un envoi direct navigateur → R2.
 * Réservé au membre concerné (compte Clerk lié) ou à un administrateur.
 */
export async function createMemberProfilePictureUploadAction(
  memberId: number,
  contentType: string,
  size: number
): Promise<CreateMemberProfilePictureUploadResult> {
  if (!Number.isFinite(memberId) || memberId < 1) {
    return { ok: false, error: "Identifiant membre invalide." };
  }

  try {
    assertR2PictureUploadConfigured();
    getR2PublicBaseUrl();
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : "Stockage R2 non configuré sur le serveur.",
    };
  }

  if (!(await canManageMemberOwnContent(memberId))) {
    return { ok: false, error: "Non autorisé à modifier cette photo." };
  }

  let extension: string;
  try {
    extension = assertAllowedImageType(contentType || "application/octet-stream");
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Type de fichier refusé.",
    };
  }

  const [existing] = await db
    .select({ id: familyMember.id })
    .from(familyMember)
    .where(eq(familyMember.id, memberId))
    .limit(1);
  if (!existing) {
    return { ok: false, error: "Membre introuvable." };
  }

  const objectKey = memberPictureObjectKey(memberId, extension);
  return prepareR2Upload({
    objectKey,
    contentType: contentType || imageContentTypeFromExtension(extension),
    size,
    maxBytes: MAX_PICTURE_BYTES,
    cacheControl: PICTURE_CACHE_CONTROL,
  });
}

export type ConfirmMemberProfilePictureUploadResult =
  | { ok: true; pictureId: string; publicUrl: string }
  | { ok: false; error: string };

/**
 * 2ᵉ étape : après un envoi direct réussi vers R2, vérifie l’objet réel puis
 * enregistre la clé dans `family_member.picture_id`.
 */
export async function confirmMemberProfilePictureUploadAction(
  memberId: number,
  objectKey: string
): Promise<ConfirmMemberProfilePictureUploadResult> {
  if (!Number.isFinite(memberId) || memberId < 1) {
    return { ok: false, error: "Identifiant membre invalide." };
  }

  if (!(await canManageMemberOwnContent(memberId))) {
    return { ok: false, error: "Non autorisé à modifier cette photo." };
  }

  const confirmed = await confirmR2Upload({
    objectKey,
    maxBytes: MAX_PICTURE_BYTES,
    isOwnedKey: isMemberPictureObjectKeyForMember(objectKey, memberId),
  });
  if (!confirmed.ok) return confirmed;

  const [existing] = await db
    .select({ pictureId: familyMember.pictureId })
    .from(familyMember)
    .where(eq(familyMember.id, memberId))
    .limit(1);
  if (!existing) {
    return { ok: false, error: "Membre introuvable." };
  }

  const previousKey = existing.pictureId?.trim() || null;

  try {
    await updateFamilyMember(memberId, { pictureId: objectKey });
  } catch (e) {
    console.error("updateFamilyMember after R2 upload:", e);
    try {
      await deleteR2ObjectIfPresent(objectKey);
    } catch {
      /* best effort */
    }
    return { ok: false, error: "Enregistrement en base impossible." };
  }

  if (
    previousKey &&
    previousKey !== objectKey &&
    isMemberPictureObjectKeyForMember(previousKey, memberId)
  ) {
    try {
      await deleteR2ObjectIfPresent(previousKey);
    } catch {
      /* ancien fichier orphelin acceptable */
    }
  }

  const publicUrl = publicUrlR2(objectKey) ?? "";
  return { ok: true, pictureId: objectKey, publicUrl };
}

export type RemoveMemberProfilePictureResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Supprime la photo R2 (`picture_id`) et remet la colonne à null.
 * Tente d’effacer l’objet dans le bucket si les credentials R2 sont configurés.
 */
export async function removeMemberProfilePictureAction(
  memberId: number
): Promise<RemoveMemberProfilePictureResult> {
  if (!Number.isFinite(memberId) || memberId < 1) {
    return { ok: false, error: "Identifiant membre invalide." };
  }

  if (!(await canManageMemberOwnContent(memberId))) {
    return { ok: false, error: "Non autorisé à modifier cette photo." };
  }

  const [existing] = await db
    .select({ pictureId: familyMember.pictureId })
    .from(familyMember)
    .where(eq(familyMember.id, memberId))
    .limit(1);

  if (!existing) {
    return { ok: false, error: "Membre introuvable." };
  }

  const key = existing.pictureId?.trim() || null;
  if (!key) {
    return { ok: true };
  }

  if (
    isR2PictureUploadConfigured() &&
    isMemberPictureObjectKeyForMember(key, memberId)
  ) {
    try {
      await deleteR2ObjectIfPresent(key);
    } catch (e) {
      console.error("R2 DeleteObject error:", e);
    }
  }

  try {
    await updateFamilyMember(memberId, { pictureId: null });
  } catch (e) {
    console.error("updateFamilyMember after picture remove:", e);
    return { ok: false, error: "Mise à jour en base impossible." };
  }

  return { ok: true };
}
