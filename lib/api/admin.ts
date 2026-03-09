"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { admin } from "@/db/schema";
import { getAllUsers } from "@/lib/api/clerk";

/** Données sérialisables d’un user pour l’UI (évite de passer les objets Clerk au client). */
export type UserForAdminList = {
  id: string;
  email: string;
  displayName: string;
};

/** Liste des utilisateurs Clerk en plain objects pour la page Administrateurs. */
export async function getUsersForAdministrators(): Promise<UserForAdminList[]> {
  const users = await getAllUsers();
  return users.map((u) => {
    const primary = u.emailAddresses?.find((e) => e.id === u.primaryEmailAddressId);
    const email = primary?.emailAddress ?? u.emailAddresses?.[0]?.emailAddress ?? "—";
    const displayName =
      u.firstName || u.lastName
        ? [u.firstName, u.lastName].filter(Boolean).join(" ")
        : email;
    return { id: u.id, email, displayName };
  });
}

/** Vérifie si l'utilisateur connecté est dans la table admin. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const [row] = await db
    .select({ id: admin.id })
    .from(admin)
    .where(eq(admin.userId, userId))
    .limit(1);
  return !!row;
}

/** Liste des userId présents dans la table admin. */
export async function getAdminUserIds(): Promise<string[]> {
  const rows = await db.select({ userId: admin.userId }).from(admin);
  return rows.map((r) => r.userId);
}

/** Liste complète des admins avec email / nom (pour l’affichage). */
export async function getAdminsForList(): Promise<UserForAdminList[]> {
  const [adminIds, allUsers] = await Promise.all([
    getAdminUserIds(),
    getUsersForAdministrators(),
  ]);
  const idSet = new Set(adminIds);
  return allUsers.filter((u) => idSet.has(u.id));
}

/** Recherche d’utilisateurs non-admin par email ou nom (max 10, min 2 caractères). */
export async function searchNonAdminUsers(
  query: string
): Promise<UserForAdminList[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const [adminIds, allUsers] = await Promise.all([
    getAdminUserIds(),
    getUsersForAdministrators(),
  ]);
  const idSet = new Set(adminIds);
  const matches = allUsers
    .filter((u) => !idSet.has(u.id))
    .filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q)
    )
    .slice(0, 10);
  return matches;
}

/** Promouvoir un utilisateur en admin. Réservé aux admins. */
export async function addAdmin(
  targetUserId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Non connecté" };
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { ok: false, error: "Droits admin requis" };
  try {
    await db
      .insert(admin)
      .values({ userId: targetUserId })
      .onConflictDoNothing({ target: admin.userId });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur lors de l'ajout";
    return { ok: false, error: msg };
  }
}

/** Retirer les droits admin d'un utilisateur. Réservé aux admins. */
export async function removeAdmin(
  targetUserId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Non connecté" };
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { ok: false, error: "Droits admin requis" };
  try {
    await db.delete(admin).where(eq(admin.userId, targetUserId));
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur lors de la révocation";
    return { ok: false, error: msg };
  }
}
