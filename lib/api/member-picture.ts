"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/drizzle/client";
import { familyMember } from "@/drizzle/schema";
import { isCurrentUserAdmin } from "@/lib/api/admin";
import { updateFamilyMember } from "@/lib/api/family";
import {
  assertR2PictureUploadConfigured,
  getR2PublicBaseUrl,
} from "@/lib/r2/config";
import {
  assertAllowedImageType,
  deleteMemberPictureObjectIfPresent,
  isMemberPictureObjectKeyForMember,
  memberPictureObjectKey,
  putMemberPictureObject,
} from "@/lib/r2/member-picture-storage";
import { publicUrlForMemberPictureKey } from "@/lib/member-profile-image";

export type UploadMemberProfilePictureResult =
  | { ok: true; pictureId: string; publicUrl: string }
  | { ok: false; error: string };

async function canEditMemberPicture(memberId: number): Promise<boolean> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  if (await isCurrentUserAdmin()) return true;
  const linked =
    sessionClaims?.metadata?.familyMemberId as number | undefined;
  return linked != null && Number(linked) === memberId;
}

/**
 * Upload une image vers R2 et enregistre la clé dans `family_member.picture_id`.
 * Réservé au membre concerné (compte Clerk lié) ou à un administrateur.
 */
export async function uploadMemberProfilePictureAction(
  memberId: number,
  formData: FormData
): Promise<UploadMemberProfilePictureResult> {
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

  if (!(await canEditMemberPicture(memberId))) {
    return { ok: false, error: "Non autorisé à modifier cette photo." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Aucun fichier valide." };
  }

  let extension: string;
  try {
    extension = assertAllowedImageType(file.type || "application/octet-stream");
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Type de fichier refusé.",
    };
  }

  const objectKey = memberPictureObjectKey(memberId, extension);

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return { ok: false, error: "Lecture du fichier impossible." };
  }

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
    await putMemberPictureObject(
      objectKey,
      buffer,
      file.type || `image/${extension === "jpg" ? "jpeg" : extension}`
    );
  } catch (e) {
    console.error("R2 PutObject error:", e);
    return {
      ok: false,
      error: "Échec de l’envoi vers le stockage. Vérifiez les clés R2.",
    };
  }

  try {
    await updateFamilyMember(memberId, { pictureId: objectKey });
  } catch (e) {
    console.error("updateFamilyMember after R2 upload:", e);
    try {
      await deleteMemberPictureObjectIfPresent(objectKey);
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
      await deleteMemberPictureObjectIfPresent(previousKey);
    } catch {
      /* ancien fichier orphelin acceptable */
    }
  }

  const publicUrl = publicUrlForMemberPictureKey(objectKey) ?? "";
  return { ok: true, pictureId: objectKey, publicUrl };
}
