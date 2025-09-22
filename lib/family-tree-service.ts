/**
 * Service pour récupérer l'arbre généalogique complet avec jointures
 */

import { db } from "@/db/client";
import { familyMember, familyRelation, partnership } from "@/db/schema";
import { eq, or, sql, desc, asc } from "drizzle-orm";
import type {
  FamilyMember,
  FamilyMemberWithRelations,
  FamilyTree,
  FamilyMemberFilter,
  SearchResult,
} from "@/lib/types";

/**
 * Récupère l'arbre généalogique complet avec toutes les relations
 */
export async function getCompleteFamilyTree(): Promise<FamilyTree> {
  try {
    console.log("🌳 Récupération de l'arbre généalogique complet...");

    // Récupérer toutes les données en parallèle
    const [members, relations, partnerships] = await Promise.all([
      // Tous les membres triés par code pour un ordre logique
      db.select().from(familyMember).orderBy(asc(familyMember.code)),

      // Toutes les relations parent-enfant
      db.select().from(familyRelation),

      // Tous les partenariats
      db.select().from(partnership),
    ]);

    console.log(`   ✅ ${members.length} membres récupérés`);
    console.log(`   ✅ ${relations.length} relations récupérées`);
    console.log(`   ✅ ${partnerships.length} partenariats récupérés`);

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

    console.log("📊 Statistiques de l'arbre:", stats);

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

/**
 * Récupère un membre spécifique avec ses relations
 */
export async function getFamilyMemberWithRelations(
  memberId: number
): Promise<FamilyMemberWithRelations | null> {
  try {
    // Récupérer le membre principal
    const memberResult = await db
      .select()
      .from(familyMember)
      .where(eq(familyMember.id, memberId));

    if (memberResult.length === 0) {
      return null;
    }

    const member = memberResult[0];

    // Récupérer les parents
    const parentRelations = await db
      .select({
        parent: familyMember,
      })
      .from(familyRelation)
      .innerJoin(familyMember, eq(familyRelation.parentId, familyMember.id))
      .where(eq(familyRelation.childId, memberId));

    // Récupérer les enfants
    const childRelations = await db
      .select({
        child: familyMember,
      })
      .from(familyRelation)
      .innerJoin(familyMember, eq(familyRelation.childId, familyMember.id))
      .where(eq(familyRelation.parentId, memberId));

    // Récupérer le partenaire
    const partnershipResult = await db
      .select({
        partner: familyMember,
      })
      .from(partnership)
      .innerJoin(
        familyMember,
        or(
          eq(partnership.partner1Id, familyMember.id),
          eq(partnership.partner2Id, familyMember.id)
        )
      )
      .where(
        or(
          eq(partnership.partner1Id, memberId),
          eq(partnership.partner2Id, memberId)
        )
      );

    // Filtrer pour exclure la personne elle-même du résultat partenaire
    const partner =
      partnershipResult.map((r) => r.partner).find((p) => p.id !== memberId) ||
      null;

    // Construire l'objet enrichi (même logique que dans getCompleteFamilyTree)
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

    let generation = 0;
    if (member.code) {
      if (member.code === ".0" || member.code === "0") {
        generation = 0;
      } else if (member.code.endsWith(".0")) {
        const baseCode = member.code.slice(0, -2);
        generation = baseCode ? baseCode.split(".").length : 1;
      } else {
        generation = member.code.split(".").length;
      }
    }

    return {
      ...member,
      parents: parentRelations.map((r) => r.parent),
      children: childRelations.map((r) => r.child),
      partner,
      fullName,
      displayName,
      birthYear,
      deathYear,
      isAlive,
      age,
      generation,
    };
  } catch (error) {
    console.error(
      `❌ Erreur lors de la récupération du membre ${memberId}:`,
      error
    );
    return null;
  }
}

/**
 * Recherche des membres par nom avec scoring de pertinence
 */
export async function searchFamilyMembers(
  searchTerm: string,
  limit: number = 20
): Promise<SearchResult[]> {
  try {
    if (!searchTerm.trim()) {
      return [];
    }

    const searchPattern = `%${searchTerm.toLowerCase()}%`;

    const results = await db
      .select()
      .from(familyMember)
      .where(
        or(
          sql`LOWER(${familyMember.firstName}) LIKE ${searchPattern}`,
          sql`LOWER(${familyMember.lastName}) LIKE ${searchPattern}`,
          sql`LOWER(${familyMember.maidenName}) LIKE ${searchPattern}`,
          sql`LOWER(CONCAT(${familyMember.firstName}, ' ', ${familyMember.lastName})) LIKE ${searchPattern}`
        )
      )
      .limit(limit);

    // Enrichir les résultats avec le scoring
    const searchResults: SearchResult[] = [];

    for (const member of results) {
      const enrichedMember = await getFamilyMemberWithRelations(member.id);
      if (!enrichedMember) continue;

      // Calculer le score de pertinence
      let matchType: SearchResult["matchType"] = "fullName";
      let relevanceScore = 0;

      const searchLower = searchTerm.toLowerCase();
      const firstName = (member.firstName || "").toLowerCase();
      const lastName = (member.lastName || "").toLowerCase();
      const maidenName = (member.maidenName || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();

      if (firstName === searchLower) {
        matchType = "firstName";
        relevanceScore = 100;
      } else if (lastName === searchLower) {
        matchType = "lastName";
        relevanceScore = 95;
      } else if (maidenName === searchLower) {
        matchType = "maidenName";
        relevanceScore = 90;
      } else if (fullName === searchLower) {
        matchType = "fullName";
        relevanceScore = 85;
      } else if (firstName.startsWith(searchLower)) {
        matchType = "firstName";
        relevanceScore = 80;
      } else if (lastName.startsWith(searchLower)) {
        matchType = "lastName";
        relevanceScore = 75;
      } else if (maidenName.startsWith(searchLower)) {
        matchType = "maidenName";
        relevanceScore = 70;
      } else {
        relevanceScore = 50; // Match partiel
      }

      searchResults.push({
        member: enrichedMember,
        matchType,
        relevanceScore,
      });
    }

    // Trier par score de pertinence décroissant
    return searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error(`❌ Erreur lors de la recherche "${searchTerm}":`, error);
    return [];
  }
}

/**
 * Filtre les membres selon des critères
 */
export async function getFilteredFamilyMembers(
  filter: FamilyMemberFilter
): Promise<FamilyMemberWithRelations[]> {
  try {
    const tree = await getCompleteFamilyTree();

    let filteredMembers = tree.members;

    // Appliquer les filtres
    if (filter.searchTerm) {
      const searchResults = await searchFamilyMembers(filter.searchTerm);
      const searchMemberIds = new Set(searchResults.map((r) => r.member.id));
      filteredMembers = filteredMembers.filter((m) =>
        searchMemberIds.has(m.id)
      );
    }

    if (filter.generation !== undefined) {
      filteredMembers = filteredMembers.filter(
        (m) => m.generation === filter.generation
      );
    }

    if (filter.isAlive !== undefined) {
      filteredMembers = filteredMembers.filter(
        (m) => m.isAlive === filter.isAlive
      );
    }

    if (filter.hasChildren !== undefined) {
      filteredMembers = filteredMembers.filter((m) =>
        filter.hasChildren ? m.children.length > 0 : m.children.length === 0
      );
    }

    if (filter.hasPartner !== undefined) {
      filteredMembers = filteredMembers.filter((m) =>
        filter.hasPartner ? m.partner !== null : m.partner === null
      );
    }

    return filteredMembers;
  } catch (error) {
    console.error("❌ Erreur lors du filtrage des membres:", error);
    return [];
  }
}
