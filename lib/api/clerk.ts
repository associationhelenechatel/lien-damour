"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { User } from "@clerk/nextjs/server";

const PAGE_SIZE = 20;

/** Récupère tous les utilisateurs : pagination par 5, enchaîne les pages tant que la réponse est pleine. */
export async function getAllUsers(): Promise<User[]> {
  const client = await clerkClient();
  const all: User[] = [];
  let offset = 0;
  let totalCount = 0;
  let lastPageSize = PAGE_SIZE;

  while (lastPageSize === PAGE_SIZE) {
    const res = await client.users.getUserList({
      limit: PAGE_SIZE,
      offset,
    });
    totalCount = res.totalCount;
    lastPageSize = res.data.length;
    all.push(...res.data);
    offset += PAGE_SIZE;
    if (offset >= totalCount || lastPageSize < PAGE_SIZE) break;
  }

  return all;
}

function parseFamilyMemberIdFromMetadata(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isInteger(raw) && raw > 0) return raw;
  if (typeof raw === "string") {
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/**
 * Associe chaque membre de famille (id) à l’URL de photo profil Clerk,
 * via `publicMetadata.familyMemberId`. Utilise la même pagination que {@link getAllUsers}.
 */
export async function getClerkProfileImageUrlByFamilyMemberId(): Promise<
  Map<number, string>
> {
  const users = await getAllUsers();
  const map = new Map<number, string>();
  for (const user of users) {
    const memberId = parseFamilyMemberIdFromMetadata(
      user.publicMetadata?.familyMemberId
    );
    if (memberId == null) continue;
    const url = user.imageUrl?.trim();
    if (url) map.set(memberId, url);
  }
  return map;
}

/**
 * URL de photo Clerk pour un seul membre (pagination avec arrêt dès que le compte est trouvé).
 */
export async function getClerkProfileImageUrlForFamilyMemberId(
  memberId: number
): Promise<string | null> {
  const client = await clerkClient();
  let offset = 0;
  let lastPageSize = PAGE_SIZE;

  while (lastPageSize === PAGE_SIZE) {
    const res = await client.users.getUserList({
      limit: PAGE_SIZE,
      offset,
    });
    for (const user of res.data) {
      const mid = parseFamilyMemberIdFromMetadata(
        user.publicMetadata?.familyMemberId
      );
      if (mid === memberId) {
        const url = user.imageUrl?.trim();
        return url || null;
      }
    }
    lastPageSize = res.data.length;
    offset += PAGE_SIZE;
    if (offset >= res.totalCount || lastPageSize < PAGE_SIZE) break;
  }

  return null;
}

/** Crée une invitation et envoie l’email (Clerk). */
export async function createInvitation(params: {
  emailAddress: string;
  redirectUrl?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const client = await clerkClient();
    const invitation = await client.invitations.createInvitation({
      emailAddress: params.emailAddress.trim(),
      redirectUrl: params.redirectUrl ?? undefined,
      notify: true,
    });
    return { ok: true, id: invitation.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de l'invitation";
    return { ok: false, error: message };
  }
}

export type Invitation = {
  id: string;
  emailAddress: string;
  createdAt: number;
  status: string;
};

type InvitationStatus = "pending" | "accepted" | "revoked";

function normalizeInvitation(
  inv: { id: string; emailAddress?: string; email_address?: string; createdAt?: number; created_at?: number; status?: string }
): Invitation {
  return {
    id: inv.id,
    emailAddress: inv.emailAddress ?? inv.email_address ?? "",
    createdAt: typeof inv.createdAt === "number" ? inv.createdAt : (inv.created_at ?? 0),
    status: inv.status ?? "pending",
  };
}

/** Récupère toutes les invitations pour un statut donné (pagination automatique). */
export async function getInvitationsByStatus(status: InvitationStatus): Promise<{
  data: Invitation[];
  totalCount: number;
}> {
  const client = await clerkClient();
  const all: Invitation[] = [];
  let offset = 0;
  let totalCount = 0;
  let lastPageSize = PAGE_SIZE;

  while (lastPageSize === PAGE_SIZE) {
    const res = await client.invitations.getInvitationList({
      status,
      limit: PAGE_SIZE,
      offset,
    });
    totalCount = res.totalCount;
    const data = res.data as Array<{ id: string; emailAddress?: string; email_address?: string; createdAt?: number; created_at?: number; status?: string }>;
    lastPageSize = data.length;
    for (const inv of data) {
      all.push(normalizeInvitation(inv));
    }
    offset += PAGE_SIZE;
    if (offset >= totalCount || lastPageSize < PAGE_SIZE) break;
  }

  return { data: all, totalCount };
}

/** Récupère toutes les invitations en attente. */
export async function getPendingInvitations() {
  return getInvitationsByStatus("pending");
}

/** Récupère toutes les invitations acceptées. */
export async function getAcceptedInvitations() {
  return getInvitationsByStatus("accepted");
}

/** Récupère toutes les invitations révoquées/expirées (Clerk utilise "revoked" pour expirées). */
export async function getRevokedInvitations() {
  return getInvitationsByStatus("revoked");
}
