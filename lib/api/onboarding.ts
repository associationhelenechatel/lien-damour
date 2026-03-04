"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { familyMember } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const completeOnboardingSchema = z.object({
  familyMemberId: z.number().int().positive(),
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  mapboxPlaceId: z.string().optional(),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;

export type CompleteOnboardingResult =
  | { success: true; message: string; familyMember: { id: number; firstName: string; lastName: string } }
  | { success: false; error: string };

/**
 * Complète l'onboarding : associe l'utilisateur Clerk au membre choisi et met à jour la DB.
 *
 * 1. Vérifie que l'utilisateur est authentifié
 * 2. Vérifie qu'il n'a pas déjà un familyMemberId
 * 3. Valide les données et vérifie que le membre existe
 * 4. Vérifie qu'aucun autre utilisateur n'a ce familyMemberId
 * 5. Met à jour les metadata Clerk (familyMemberId) et la DB (infos du membre)
 */
export async function completeOnboarding(
  data: CompleteOnboardingInput
): Promise<CompleteOnboardingResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Non authentifié" };
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const existingFamilyMemberId = user.publicMetadata?.familyMemberId as
      | number
      | undefined;

    if (existingFamilyMemberId) {
      return {
        success: false,
        error: "Vous avez déjà complété l'onboarding",
      };
    }

    const parsed = completeOnboardingSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: "Données invalides",
      };
    }

    const payload = parsed.data;

    const member = await db.query.familyMember.findFirst({
      where: eq(familyMember.id, payload.familyMemberId),
    });

    if (!member) {
      return {
        success: false,
        error: "Membre de la famille non trouvé",
      };
    }

    const allUsers = await client.users.getUserList();
    for (const existingUser of allUsers.data) {
      const existingId = existingUser.publicMetadata?.familyMemberId as
        | number
        | undefined;
      if (existingId === payload.familyMemberId && existingUser.id !== userId) {
        return {
          success: false,
          error: `Ce membre est déjà associé à un autre utilisateur (${existingUser.emailAddresses[0]?.emailAddress ?? "inconnu"})`,
        };
      }
    }

    await Promise.all([
      client.users.updateUserMetadata(userId, {
        publicMetadata: {
          familyMemberId: payload.familyMemberId,
        },
      }),
      db
        .update(familyMember)
        .set({
          firstName: payload.firstName,
          lastName: payload.lastName,
          birthDate: payload.birthDate ?? member.birthDate,
          address: payload.address ?? member.address,
          phone: payload.phone ?? member.phone,
          latitude:
            payload.latitude !== undefined
              ? payload.latitude.toString()
              : member.latitude,
          longitude:
            payload.longitude !== undefined
              ? payload.longitude.toString()
              : member.longitude,
          mapboxPlaceId: payload.mapboxPlaceId ?? member.mapboxPlaceId,
          updatedAt: new Date(),
        })
        .where(eq(familyMember.id, payload.familyMemberId)),
    ]);

    revalidatePath("/family");
    revalidatePath("/onboarding");

    return {
      success: true,
      message: "Onboarding complété avec succès",
      familyMember: {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName ?? "",
      },
    };
  } catch (error) {
    console.error("Erreur lors de l'onboarding:", error);
    return {
      success: false,
      error: "Erreur lors de l'onboarding",
    };
  }
}
