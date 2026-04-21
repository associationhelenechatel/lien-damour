"use server";

import { eq } from "drizzle-orm";

import { db } from "@/drizzle/client";
import { project } from "@/drizzle/schema";
import { isCurrentUserAdmin } from "@/lib/api/admin";
import { updateProject } from "@/lib/api/project";
import {
  assertR2PictureUploadConfigured,
  getR2PublicBaseUrl,
  isR2PictureUploadConfigured,
} from "@/lib/r2/config";
import {
  assertAllowedImageType,
  deleteMemberPictureObjectIfPresent,
  isProjectLogoObjectKeyForProject,
  projectLogoObjectKey,
  putMemberPictureObject,
} from "@/lib/r2/member-picture-storage";
import { publicUrlR2 } from "@/lib/member-profile-image";

export type UploadProjectLogoResult =
  | { ok: true; logoKey: string; publicUrl: string }
  | { ok: false; error: string };

export type RemoveProjectLogoResult = { ok: true } | { ok: false; error: string };

async function assertAdmin(): Promise<boolean> {
  return isCurrentUserAdmin();
}

export async function uploadProjectLogoAction(
  projectId: number,
  formData: FormData
): Promise<UploadProjectLogoResult> {
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

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Aucun fichier valide." };
  }

  let extension: string;
  try {
    extension = assertAllowedImageType(file.type || "application/octet-stream");
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Type de fichier refusé.",
    };
  }

  const objectKey = projectLogoObjectKey(projectId, extension);

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return { ok: false, error: "Lecture du fichier impossible." };
  }

  const [existing] = await db
    .select({ id: project.id, logo: project.logo })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);

  if (!existing) {
    return { ok: false, error: "Projet introuvable." };
  }

  const previousKey = existing.logo?.trim() || null;

  try {
    await putMemberPictureObject(
      objectKey,
      buffer,
      file.type || `image/${extension === "jpg" ? "jpeg" : extension}`
    );
  } catch (e) {
    console.error("R2 PutObject (project logo):", e);
    return {
      ok: false,
      error: "Échec de l’envoi vers le stockage. Vérifiez les clés R2.",
    };
  }

  try {
    await updateProject(projectId, { logo: objectKey });
  } catch (e) {
    console.error("updateProject after R2 logo upload:", e);
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
    isProjectLogoObjectKeyForProject(previousKey, projectId)
  ) {
    try {
      await deleteMemberPictureObjectIfPresent(previousKey);
    } catch {
      /* orphelin acceptable */
    }
  }

  const publicUrl = publicUrlR2(objectKey) ?? "";
  return { ok: true, logoKey: objectKey, publicUrl };
}

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
      await deleteMemberPictureObjectIfPresent(key);
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
