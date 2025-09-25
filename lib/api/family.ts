"use server";

import { revalidatePath } from "next/cache";
import { eq, and, or, ilike, desc, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { familyMember, familyRelation, partnership } from "@/db/schema";
import type {
  FamilyMember,
  FamilyMemberWithRelations,
  FamilyTree,
  NewFamilyMember,
  FamilyMemberFilter,
} from "@/lib/types";

// Helper function to calculate generation
function calculateGeneration(
  memberId: number,
  relations: Array<{ parentId: number; childId: number }>,
  visited = new Set<number>()
): number {
  if (visited.has(memberId)) return 0; // Avoid infinite loops
  visited.add(memberId);

  const parentRelations = relations.filter((r) => r.childId === memberId);
  if (parentRelations.length === 0) return 1; // Root generation

  const parentGenerations = parentRelations.map((r) =>
    calculateGeneration(r.parentId, relations, new Set(visited))
  );

  return Math.max(...parentGenerations) + 1;
}

// Helper function to enrich family member with relations
function enrichFamilyMember(
  member: FamilyMember,
  allMembers: FamilyMember[],
  relations: Array<{ parentId: number; childId: number }>,
  partnerships: Array<{ partner1Id: number; partner2Id: number }>
): FamilyMemberWithRelations {
  // Find parents
  const parentIds = relations
    .filter((r) => r.childId === member.id)
    .map((r) => r.parentId);
  const parents = allMembers.filter((m) => parentIds.includes(m.id));

  // Find children
  const childIds = relations
    .filter((r) => r.parentId === member.id)
    .map((r) => r.childId);
  const children = allMembers.filter((m) => childIds.includes(m.id));

  // Find partner
  const partnerRelation = partnerships.find(
    (p) => p.partner1Id === member.id || p.partner2Id === member.id
  );
  const partnerId = partnerRelation
    ? partnerRelation.partner1Id === member.id
      ? partnerRelation.partner2Id
      : partnerRelation.partner1Id
    : null;
  const partner = partnerId
    ? allMembers.find((m) => m.id === partnerId) || null
    : null;

  // Calculate derived fields
  const fullName = `${member.firstName} ${member.lastName || ""}`.trim();
  const displayName = member.maidenName
    ? `${member.firstName} ${member.lastName} (née ${member.maidenName})`
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

  const generation = calculateGeneration(member.id, relations);

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

// Get all family members with their relations
export async function getFamilyTree(): Promise<FamilyTree> {
  try {
    // Fetch all data in parallel
    const [members, relations, partnerships] = await Promise.all([
      db.select().from(familyMember).orderBy(asc(familyMember.firstName)),
      db.select().from(familyRelation),
      db.select().from(partnership),
    ]);

    // Enrich members with relations
    const enrichedMembers = members.map((member) =>
      enrichFamilyMember(member, members, relations, partnerships)
    );

    // Calculate stats
    const stats = {
      totalMembers: members.length,
      totalRelations: relations.length,
      totalPartnerships: partnerships.length,
      livingMembers: members.filter((m) => !m.deathDate).length,
      deceasedMembers: members.filter((m) => m.deathDate).length,
      generations: Math.max(...enrichedMembers.map((m) => m.generation)),
    };

    return {
      members: enrichedMembers,
      relations,
      partnerships,
      stats,
    };
  } catch (error) {
    console.error("Error fetching family tree:", error);
    throw new Error("Failed to fetch family tree data");
  }
}

// Get filtered family members
export async function getFamilyMembers(
  filters: FamilyMemberFilter = {}
): Promise<FamilyMemberWithRelations[]> {
  const familyTree = await getFamilyTree();
  let filteredMembers = familyTree.members;

  // Apply filters
  if (filters.searchTerm) {
    const searchTerm = filters.searchTerm.toLowerCase();
    filteredMembers = filteredMembers.filter(
      (member) =>
        member.firstName.toLowerCase().includes(searchTerm) ||
        member.lastName?.toLowerCase().includes(searchTerm) ||
        member.maidenName?.toLowerCase().includes(searchTerm) ||
        member.fullName.toLowerCase().includes(searchTerm) ||
        member.code?.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.generation !== undefined) {
    filteredMembers = filteredMembers.filter(
      (member) => member.generation === filters.generation
    );
  }

  if (filters.isAlive !== undefined) {
    filteredMembers = filteredMembers.filter(
      (member) => member.isAlive === filters.isAlive
    );
  }

  if (filters.hasChildren !== undefined) {
    filteredMembers = filteredMembers.filter((member) =>
      filters.hasChildren
        ? member.children.length > 0
        : member.children.length === 0
    );
  }

  if (filters.hasPartner !== undefined) {
    filteredMembers = filteredMembers.filter((member) =>
      filters.hasPartner ? member.partner !== null : member.partner === null
    );
  }

  return filteredMembers;
}

// Get a single family member by ID
export async function getFamilyMember(
  id: number
): Promise<FamilyMemberWithRelations | null> {
  try {
    const familyTree = await getFamilyTree();
    return familyTree.members.find((member) => member.id === id) || null;
  } catch (error) {
    console.error("Error fetching family member:", error);
    return null;
  }
}

// Create a new family member
export async function createFamilyMember(
  data: NewFamilyMember
): Promise<FamilyMember> {
  try {
    const [newMember] = await db
      .insert(familyMember)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/admin");
    revalidatePath("/family");

    return newMember;
  } catch (error) {
    console.error("Error creating family member:", error);
    throw new Error("Failed to create family member");
  }
}

// Update a family member
export async function updateFamilyMember(
  id: number,
  data: Partial<NewFamilyMember>
): Promise<FamilyMember> {
  try {
    const [updatedMember] = await db
      .update(familyMember)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(familyMember.id, id))
      .returning();

    revalidatePath("/admin");
    revalidatePath("/family");

    return updatedMember;
  } catch (error) {
    console.error("Error updating family member:", error);
    throw new Error("Failed to update family member");
  }
}

// Delete a family member
export async function deleteFamilyMember(id: number): Promise<void> {
  try {
    // First, delete related records
    await db
      .delete(familyRelation)
      .where(
        or(eq(familyRelation.parentId, id), eq(familyRelation.childId, id))
      );

    await db
      .delete(partnership)
      .where(
        or(eq(partnership.partner1Id, id), eq(partnership.partner2Id, id))
      );

    // Then delete the member
    await db.delete(familyMember).where(eq(familyMember.id, id));

    revalidatePath("/admin");
    revalidatePath("/family");
  } catch (error) {
    console.error("Error deleting family member:", error);
    throw new Error("Failed to delete family member");
  }
}

// Add a family relation (parent-child)
export async function addFamilyRelation(
  parentId: number,
  childId: number,
  relationType = "bio"
): Promise<void> {
  try {
    await db.insert(familyRelation).values({
      parentId,
      childId,
      relationType,
    });

    revalidatePath("/admin");
    revalidatePath("/family");
  } catch (error) {
    console.error("Error adding family relation:", error);
    throw new Error("Failed to add family relation");
  }
}

// Add a partnership
export async function addPartnership(
  partner1Id: number,
  partner2Id: number,
  startDate?: string
): Promise<void> {
  try {
    await db.insert(partnership).values({
      partner1Id,
      partner2Id,
      startDate: startDate || null,
    });

    revalidatePath("/admin");
    revalidatePath("/family");
  } catch (error) {
    console.error("Error adding partnership:", error);
    throw new Error("Failed to add partnership");
  }
}
