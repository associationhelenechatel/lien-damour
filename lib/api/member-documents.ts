"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/drizzle/client";
import { familyMember, familyMemberDocument } from "@/drizzle/schema";
import { canManageMemberOwnContent } from "@/lib/api/permissions";
import { confirmR2Upload, prepareR2Upload } from "@/lib/api/r2-upload-flow";
import {
  assertR2PictureUploadConfigured,
  getR2PublicBaseUrl,
} from "@/lib/r2/config";
import {
  buildDocumentContentDisposition,
  isMemberDocumentObjectKeyForMember,
  MAX_DOCUMENT_BYTES,
  memberDocumentObjectKey,
} from "@/lib/r2/member-document-storage";
import { deleteR2ObjectIfPresent } from "@/lib/r2/presigned-upload";
import { publicUrlR2 } from "@/lib/member-profile-image";
import type { FamilyMemberDocument, FamilyMemberDocumentWithUrl } from "@/lib/types";

function withUrl(doc: FamilyMemberDocument): FamilyMemberDocumentWithUrl {
  return { ...doc, url: publicUrlR2(doc.objectKey) };
}

/** Documents (PDF, Word, etc.) rattachés à une fiche membre, triés par date d’ajout. */
export async function getMemberDocuments(
  memberId: number
): Promise<FamilyMemberDocumentWithUrl[]> {
  const rows = await db
    .select()
    .from(familyMemberDocument)
    .where(eq(familyMemberDocument.memberId, memberId))
    .orderBy(familyMemberDocument.createdAt);
  return rows.map(withUrl);
}

export type CreateMemberDocumentUploadResult =
  | {
      ok: true;
      uploadUrl: string;
      objectKey: string;
      contentType: string;
      contentDisposition?: string;
    }
  | { ok: false; error: string };

/**
 * 1ʳᵉ étape : génère une URL présignée R2 pour un envoi direct navigateur → R2.
 * Réservé au membre concerné ou à un administrateur.
 */
export async function createMemberDocumentUploadAction(
  memberId: number,
  fileName: string,
  contentType: string,
  size: number
): Promise<CreateMemberDocumentUploadResult> {
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
    return { ok: false, error: "Non autorisé à ajouter un document sur cette fiche." };
  }

  const [existing] = await db
    .select({ id: familyMember.id })
    .from(familyMember)
    .where(eq(familyMember.id, memberId))
    .limit(1);
  if (!existing) {
    return { ok: false, error: "Membre introuvable." };
  }

  const safeFileName = fileName.trim() || "fichier";
  const objectKey = memberDocumentObjectKey(memberId, safeFileName);

  return prepareR2Upload({
    objectKey,
    contentType: contentType || "application/octet-stream",
    size,
    maxBytes: MAX_DOCUMENT_BYTES,
    contentDisposition: buildDocumentContentDisposition(safeFileName),
  });
}

export type ConfirmMemberDocumentUploadResult =
  | { ok: true; document: FamilyMemberDocumentWithUrl }
  | { ok: false; error: string };

/**
 * 2ᵉ étape : après un envoi direct réussi vers R2, vérifie l’objet réel
 * (taille, type — source de vérité, jamais les valeurs déclarées par le
 * client) puis enregistre le document en base.
 */
export async function confirmMemberDocumentUploadAction(
  memberId: number,
  objectKey: string,
  fileName: string
): Promise<ConfirmMemberDocumentUploadResult> {
  if (!Number.isFinite(memberId) || memberId < 1) {
    return { ok: false, error: "Identifiant membre invalide." };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Non connecté." };
  }

  if (!(await canManageMemberOwnContent(memberId))) {
    return { ok: false, error: "Non autorisé à ajouter un document sur cette fiche." };
  }

  const confirmed = await confirmR2Upload({
    objectKey,
    maxBytes: MAX_DOCUMENT_BYTES,
    isOwnedKey: isMemberDocumentObjectKeyForMember(objectKey, memberId),
  });
  if (!confirmed.ok) return confirmed;

  const safeFileName = fileName.trim() || "fichier";

  let inserted: FamilyMemberDocument;
  try {
    const rows = await db
      .insert(familyMemberDocument)
      .values({
        memberId,
        objectKey,
        fileName: safeFileName,
        mimeType: confirmed.meta.contentType,
        sizeBytes: confirmed.meta.sizeBytes,
        uploadedByUserId: userId,
      })
      .returning();
    inserted = rows[0];
  } catch (e) {
    console.error("Insert family_member_document error:", e);
    try {
      await deleteR2ObjectIfPresent(objectKey);
    } catch {
      /* best effort */
    }
    return { ok: false, error: "Enregistrement en base impossible." };
  }

  return { ok: true, document: withUrl(inserted) };
}

export type DeleteMemberDocumentResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Supprime un document (objet R2 + ligne DB). Réservé au membre concerné
 * (compte Clerk lié) ou à un administrateur.
 */
export async function deleteMemberDocumentAction(
  documentId: number
): Promise<DeleteMemberDocumentResult> {
  if (!Number.isFinite(documentId) || documentId < 1) {
    return { ok: false, error: "Identifiant de document invalide." };
  }

  const [doc] = await db
    .select()
    .from(familyMemberDocument)
    .where(eq(familyMemberDocument.id, documentId))
    .limit(1);

  if (!doc) {
    return { ok: true };
  }

  if (!(await canManageMemberOwnContent(doc.memberId))) {
    return { ok: false, error: "Non autorisé à supprimer ce document." };
  }

  if (isMemberDocumentObjectKeyForMember(doc.objectKey, doc.memberId)) {
    try {
      await deleteR2ObjectIfPresent(doc.objectKey);
    } catch (e) {
      console.error("R2 DeleteObject error (document):", e);
    }
  }

  try {
    await db
      .delete(familyMemberDocument)
      .where(eq(familyMemberDocument.id, documentId));
  } catch (e) {
    console.error("Delete family_member_document error:", e);
    return { ok: false, error: "Suppression en base impossible." };
  }

  return { ok: true };
}
