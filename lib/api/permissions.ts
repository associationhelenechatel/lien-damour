"use server";

import { auth } from "@clerk/nextjs/server";

import { isCurrentUserAdmin } from "@/lib/api/admin";

/**
 * Un administrateur peut agir sur n'importe quelle fiche ; un membre standard
 * uniquement sur celle liée à son propre compte Clerk
 * (`sessionClaims.metadata.familyMemberId`).
 */
export async function canManageMemberOwnContent(
  memberId: number
): Promise<boolean> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;
  if (await isCurrentUserAdmin()) return true;
  const linked = sessionClaims?.metadata?.familyMemberId as
    | number
    | undefined;
  return linked != null && Number(linked) === memberId;
}
