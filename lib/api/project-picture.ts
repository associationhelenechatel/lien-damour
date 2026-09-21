"use server";

import { eq } from "drizzle-orm";

import { db } from "@/drizzle/client";
import { project } from "@/drizzle/schema";
import { isCurrentUserAdmin } from "@/lib/api/admin";
import { updateProject } from "@/lib/api/project";
import { confirmR2Upload, prepareR2Upload } from "@/lib/api/r2-upload-flow";
import {
  assertR2PictureUploadConfigured,
  getR2PublicBaseUrl,
  isR2PictureUploadConfigured,
} from "@/lib/r2/config";
import {
  assertAllowedImageType,
  imageContentTypeFromExtension,
  isProjectLogoObjectKeyForProject,
  MAX_PICTURE_BYTES,
  PICTURE_CACHE_CONTROL,
  projectLogoObjectKey,
} from "@/lib/r2/member-picture-storage";
import { deleteR2ObjectIfPresent } from "@/lib/r2/presigned-upload";
import { publicUrlR2 } from "@/lib/member-profile-image";

async function assertAdmin(): Promise<boolean> {
  return isCurrentUserAdmin();
}

export type CreateProjectLogoUploadResult =
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
 * Réservé aux administrateurs.
 */
export async function createProjectLogoUploadAction(
  projectId: number,
  contentType: string,
  size: number
): Promise<CreateProjectLogoUploadResult> {
  if (!Number.isFinite(projectId) || projectId < 1) {
    return { ok: false, error: "Identifiant projet invalide." };
  }

  if (!(await assertAdmin())) {
    return { ok: false, error: "Droits administrateur requis." };
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

  let extension: string;
  try {
    extension = assertAllowedImageType(contentType || "application/octet-stream");
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Type de fichier refusé.",
    };
  }

  const [existing] = await db
    .select({ id: project.id })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);
  if (!existing) {
    return { ok: false, error: "Projet introuvable." };
  }

  const objectKey = projectLogoObjectKey(projectId, extension);
  return prepareR2Upload({
    objectKey,
    contentType: contentType || imageContentTypeFromExtension(extension),
    size,
    maxBytes: MAX_PICTURE_BYTES,
    cacheControl: PICTURE_CACHE_CONTROL,
  });
}

export type ConfirmProjectLogoUploadResult =
  | { ok: true; logoKey: string; publicUrl: string }
  | { ok: false; error: string };

/**
 * 2ᵉ étape : après un envoi direct réussi vers R2, vérifie l’objet réel puis
 * enregistre la clé dans `project.logo`.
 */
export async function confirmProjectLogoUploadAction(
  projectId: number,
  objectKey: string
): Promise<ConfirmProjectLogoUploadResult> {
  if (!Number.isFinite(projectId) || projectId < 1) {
    return { ok: false, error: "Identifiant projet invalide." };
  }

  if (!(await assertAdmin())) {
    return { ok: false, error: "Droits administrateur requis." };
  }

  const confirmed = await confirmR2Upload({
    objectKey,
    maxBytes: MAX_PICTURE_BYTES,
    isOwnedKey: isProjectLogoObjectKeyForProject(objectKey, projectId),
  });
  if (!confirmed.ok) return confirmed;

  const [existing] = await db
    .select({ logo: project.logo })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);
  if (!existing) {
    return { ok: false, error: "Projet introuvable." };
  }

  const previousKey = existing.logo?.trim() || null;

  try {
    await updateProject(projectId, { logo: objectKey });
  } catch (e) {
    console.error("updateProject after R2 logo upload:", e);
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
    isProjectLogoObjectKeyForProject(previousKey, projectId)
  ) {
    try {
      await deleteR2ObjectIfPresent(previousKey);
    } catch {
      /* orphelin acceptable */
    }
  }

  const publicUrl = publicUrlR2(objectKey) ?? "";
  return { ok: true, logoKey: objectKey, publicUrl };
}

export type RemoveProjectLogoResult = { ok: true } | { ok: false; error: string };

export async function removeProjectLogoAction(
  projectId: number
): Promise<RemoveProjectLogoResult> {
  if (!Number.isFinite(projectId) || projectId < 1) {
    return { ok: false, error: "Identifiant projet invalide." };
  }

  if (!(await assertAdmin())) {
    return { ok: false, error: "Droits administrateur requis." };
  }

  const [existing] = await db
    .select({ logo: project.logo })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);

  if (!existing) {
    return { ok: false, error: "Projet introuvable." };
  }

  const key = existing.logo?.trim() || null;
  if (!key) {
    return { ok: true };
  }

  if (
    isR2PictureUploadConfigured() &&
    isProjectLogoObjectKeyForProject(key, projectId)
  ) {
    try {
      await deleteR2ObjectIfPresent(key);
    } catch (e) {
      console.error("R2 DeleteObject (project logo):", e);
    }
  }

  try {
    await updateProject(projectId, { logo: null });
  } catch (e) {
    console.error("updateProject after logo remove:", e);
    return { ok: false, error: "Mise à jour en base impossible." };
  }

  return { ok: true };
}
