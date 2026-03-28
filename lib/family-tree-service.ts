/**
 * Service pour récupérer l'arbre généalogique complet avec jointures
 */

import { db } from "@/drizzle/client";
import { familyMember, familyRelation, partnership } from "@/drizzle/schema";
import { asc } from "drizzle-orm";
import type {
  FamilyMember,
  FamilyMemberWithRelations,
  FamilyTree,
} from "@/lib/types";
import { getClerkProfileImageUrlByFamilyMemberId } from "@/lib/api/clerk";

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

    // Créer les membres enrichis avec leurs relations
    const enrichedMembers: FamilyMemberWithRelations[] = members.map(
      (member) => {
        // Récupérer les parents
        const parentIds = parentsMap.get(member.id) || [];
        const parents = parentIds
          .map((id) => membersMap.get(id))
          .filter((parent): parent is FamilyMember => parent !== undefined);

        // Récupérer les enfants
        const childIds = childrenMap.get(member.id) || [];
        const children = childIds
          .map((id) => membersMap.get(id))
          .filter((child): child is FamilyMember => child !== undefined);

        // Récupérer le partenaire
        const partnerId = partnershipsMap.get(member.id);
        const partner = partnerId ? membersMap.get(partnerId) || null : null;

        // Calculer les métadonnées
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
          clerkProfileImageUrl: clerkAvatars.get(member.id) ?? null,
        };
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
