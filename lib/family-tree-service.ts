/**
 * Service pour récupérer l'arbre généalogique complet avec jointures
 */

import { db } from "@/db/client";
import { familyMember, familyRelation, partnership } from "@/db/schema";
import { asc } from "drizzle-orm";
import type {
  FamilyMember,
  FamilyMemberWithRelations,
  FamilyTree,
} from "@/lib/types";

/**
 * Récupère l'arbre généalogique complet avec toutes les relations
 */
export async function getCompleteFamilyTree(): Promise<FamilyTree> {
  try {
    // Récupérer toutes les données en parallèle
    const [members, relations, partnerships] = await Promise.all([
      // Tous les membres triés par code pour un ordre logique
      db.select().from(familyMember).orderBy(asc(familyMember.code)),

      // Toutes les relations parent-enfant
      db.select().from(familyRelation),

      // Tous les partenariats
      db.select().from(partnership),
    ]);

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

        // Calculer la génération basée sur le code
        let generation = 0;
        if (member.code) {
          if (member.code === ".0" || member.code === "0") {
            generation = 0; // Génération racine
          } else if (member.code.endsWith(".0")) {
            // Conjoint : même génération que son partenaire
            const baseCode = member.code.slice(0, -2);
            generation = baseCode ? baseCode.split(".").length : 1;
          } else {
            // Enfant : génération = nombre de points
            generation = member.code.split(".").length;
          }
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
          generation,
        };
      }
    );

    // Calculer les statistiques
    const livingMembers = enrichedMembers.filter((m) => m.isAlive).length;
    const deceasedMembers = enrichedMembers.length - livingMembers;
    const maxGeneration = Math.max(
      ...enrichedMembers.map((m) => m.generation),
      0
    );

    const stats = {
      totalMembers: members.length,
      totalRelations: relations.length,
      totalPartnerships: partnerships.length,
      livingMembers,
      deceasedMembers,
      generations: maxGeneration + 1,
    };

    return {
      members: enrichedMembers,
      relations,
      partnerships,
      stats,
    };
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération de l'arbre généalogique:",
      error
    );
    throw new Error("Impossible de récupérer l'arbre généalogique");
  }
}
