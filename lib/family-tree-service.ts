/**
 * Service pour récupérer l'arbre généalogique complet avec jointures
 */

import { db } from "@/drizzle/client";
import { familyMember, familyRelation, partnership } from "@/drizzle/schema";
import { asc, eq, inArray, or } from "drizzle-orm";
import type {
  FamilyMember,
  FamilyMemberWithRelations,
  FamilyTree,
} from "@/lib/types";
import {
  getClerkProfileImageUrlByFamilyMemberId,
  getClerkProfileImageUrlForFamilyMemberId,
} from "@/lib/api/clerk";
import { resolveMemberProfileImageUrl } from "@/lib/member-profile-image";

/** Champs dérivés (nom affiché, âge, etc.) — partagé arbre complet et fiche membre. */
function enrichMemberCore(
  member: FamilyMember,
  parents: FamilyMember[],
  children: FamilyMember[],
  partner: FamilyMember | null,
  clerkProfileImageUrl: string | null
): FamilyMemberWithRelations {
  const firstName = member.firstName || "";
  const lastName = member.lastName || "";
  const maidenName = member.maidenName || "";

  const fullName = `${firstName} ${lastName}`.trim() || "Nom inconnu";
  const displayName =
    maidenName && maidenName !== lastName
      ? `${firstName} ${lastName} (née ${maidenName})`
      : fullName;

  const birthYear = member.birthDate
    ? new Date(member.birthDate).getFullYear()
    : null;
  const deathYear = member.deathDate
    ? new Date(member.deathDate).getFullYear()
    : null;
  const isAlive = !member.deathDate;

  let age: number | null = null;
  if (birthYear) {
    const endYear = deathYear || new Date().getFullYear();
    age = endYear - birthYear;
  }

  return {
    ...member,
    parents,
    children,
    partner,
    fullName,
    displayName,
    birthYear,
    deathYear,
    isAlive,
    age,
    clerkProfileImageUrl,
    profileImageUrl: resolveMemberProfileImageUrl(
      member.pictureId,
      clerkProfileImageUrl
    ),
  };
}

/**
 * Récupère l'arbre généalogique complet avec toutes les relations
 */
export async function getCompleteFamilyTree(): Promise<FamilyTree> {
  try {
    const [members, relations, partnerships, clerkAvatarsResult] =
      await Promise.all([
        db.select().from(familyMember).orderBy(asc(familyMember.code)),
        db.select().from(familyRelation),
        db.select().from(partnership),
        getClerkProfileImageUrlByFamilyMemberId().catch(() => new Map<number, string>()),
      ]);

    const clerkAvatars = clerkAvatarsResult;

    // Créer des maps pour un accès rapide
    const membersMap = new Map<number, FamilyMember>();
    const childrenMap = new Map<number, number[]>(); // parentId -> childrenIds[]
    const parentsMap = new Map<number, number[]>(); // childId -> parentIds[]
    const partnershipsMap = new Map<number, number>(); // personId -> partnerId

    // Remplir la map des membres
    members.forEach((member) => {
      membersMap.set(member.id, member);
    });

    // Remplir les maps de relations
    relations.forEach((relation) => {
      // Children map (parent -> enfants)
      if (!childrenMap.has(relation.parentId)) {
        childrenMap.set(relation.parentId, []);
      }
      childrenMap.get(relation.parentId)!.push(relation.childId);

      // Parents map (enfant -> parents)
      if (!parentsMap.has(relation.childId)) {
        parentsMap.set(relation.childId, []);
      }
      parentsMap.get(relation.childId)!.push(relation.parentId);
    });

    // Remplir la map des partenariats
    partnerships.forEach((partnership) => {
      partnershipsMap.set(partnership.partner1Id, partnership.partner2Id);
      partnershipsMap.set(partnership.partner2Id, partnership.partner1Id);
    });

    const enrichedMembers: FamilyMemberWithRelations[] = members.map(
      (member) => {
        const parentIds = parentsMap.get(member.id) || [];
        const parents = parentIds
          .map((pid) => membersMap.get(pid))
          .filter((parent): parent is FamilyMember => parent !== undefined);

        const childIds = childrenMap.get(member.id) || [];
        const children = childIds
          .map((cid) => membersMap.get(cid))
          .filter((child): child is FamilyMember => child !== undefined);

        const partnerId = partnershipsMap.get(member.id);
        const partner = partnerId ? membersMap.get(partnerId) || null : null;

        return enrichMemberCore(
          member,
          parents,
          children,
          partner,
          clerkAvatars.get(member.id) ?? null
        );
      }
    );

    return {
      members: enrichedMembers,
      relations,
      partnerships,
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération de l'arbre généalogique:",
      error
    );
    throw new Error("Impossible de récupérer l'arbre généalogique");
  }
}

/**
 * Un seul membre avec parents / enfants / partenaire (lignes DB minimales) + avatar Clerk ciblé.
 * À utiliser pour `/family/[id]` pour éviter de charger tout l’arbre.
 */
export async function getFamilyMemberWithRelationsById(
  id: number
): Promise<FamilyMemberWithRelations | null> {
  try {
    const [main] = await db
      .select()
      .from(familyMember)
      .where(eq(familyMember.id, id))
      .limit(1);

    if (!main) return null;

    const [childRelations, parentRelations, partnerRows, clerkUrlResult] =
      await Promise.all([
        db
          .select()
          .from(familyRelation)
          .where(eq(familyRelation.parentId, id)),
        db
          .select()
          .from(familyRelation)
          .where(eq(familyRelation.childId, id)),
        db
          .select()
          .from(partnership)
          .where(
            or(
              eq(partnership.partner1Id, id),
              eq(partnership.partner2Id, id)
            )
          ),
        getClerkProfileImageUrlForFamilyMemberId(id).catch(() => null),
      ]);

    const childIds = childRelations.map((r) => r.childId);
    const parentIds = parentRelations.map((r) => r.parentId);
    const pr = partnerRows[0];
    const partnerId = pr
      ? pr.partner1Id === id
        ? pr.partner2Id
        : pr.partner1Id
      : null;

    const otherIds = [
      ...new Set([
        ...childIds,
        ...parentIds,
        ...(partnerId != null ? [partnerId] : []),
      ]),
    ];

    let relatedRows: FamilyMember[] = [];
    if (otherIds.length > 0) {
      relatedRows = await db
        .select()
        .from(familyMember)
        .where(inArray(familyMember.id, otherIds));
    }

    const membersMap = new Map<number, FamilyMember>([[main.id, main]]);
    for (const row of relatedRows) {
      membersMap.set(row.id, row);
    }

    const parents = parentIds
      .map((pid) => membersMap.get(pid))
      .filter((p): p is FamilyMember => p != null);
    const children = childIds
      .map((cid) => membersMap.get(cid))
      .filter((c): c is FamilyMember => c != null);
    const partner =
      partnerId != null ? membersMap.get(partnerId) ?? null : null;

    return enrichMemberCore(
      main,
      parents,
      children,
      partner,
      clerkUrlResult
    );
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération du membre (relations):",
      error
    );
    throw new Error("Impossible de récupérer la fiche membre");
  }
}
