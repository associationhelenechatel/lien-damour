"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { familyMember, familyRelation, partnership } from "@/db/schema";
import { getCompleteFamilyTree } from "@/lib/family-tree-service";
import type {
  FamilyMember,
  FamilyMemberWithRelations,
  NewFamilyMember,
} from "@/lib/types";

// ----------------------------
// Génération du matricule (code) – voir docs/MATRICULE.md
// ----------------------------

/** Conjoint de la personne de code X → code = X.0 */
export async function getCodeForNewSpouse(partnerId: number): Promise<string> {
  const partner = await getFamilyMemberById(partnerId);
  if (!partner?.code || String(partner.code).trim() === "")
    throw new Error("Membre partenaire introuvable ou sans matricule");
  return `${partner.code}.0`;
}

/** Enfant d'une personne de code X : 1er enfant → X.1, 2e → X.2, etc. */
export async function getCodeForNewChild(parentId: number): Promise<string> {
  const parent = await getFamilyMemberById(parentId);
  if (!parent?.code || String(parent.code).trim() === "")
    throw new Error("Parent introuvable ou sans matricule");
  const children = await db
    .select()
    .from(familyRelation)
    .where(eq(familyRelation.parentId, parentId));
  const nextIndex = children.length + 1;
  return `${parent.code}.${nextIndex}`;
}

// Get a single family member by ID (direct DB call, no relations)
export async function getFamilyMemberById(
  id: number
): Promise<FamilyMember | null> {
  try {
    const [member] = await db
      .select()
      .from(familyMember)
      .where(eq(familyMember.id, id))
      .limit(1);
    return member ?? null;
  } catch (error) {
    console.error("Error fetching family member by id:", error);
    return null;
  }
}

// Get the family member linked to the current Clerk user (publicMetadata.familyMemberId)
export async function getCurrentUserFamilyMember(): Promise<FamilyMember | null> {
  const { sessionClaims } = await auth();
  const familyMemberId = sessionClaims?.metadata?.familyMemberId as
    | number
    | undefined;
  if (familyMemberId == null) return null;
  return getFamilyMemberById(familyMemberId);
}

// Update the family member linked to the current user (only that member)
export async function updateCurrentUserFamilyMember(
  data: Partial<NewFamilyMember>
): Promise<FamilyMember | null> {
  const { sessionClaims } = await auth();
  const familyMemberId = sessionClaims?.metadata?.familyMemberId as
    | number
    | undefined;
  if (familyMemberId == null) return null;
  return updateFamilyMember(familyMemberId, data);
}

// Get a single family member by ID with relations (uses full tree)
export async function getFamilyMember(
  id: number
): Promise<FamilyMemberWithRelations | null> {
  try {
    const familyTree = await getCompleteFamilyTree();
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
