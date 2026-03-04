import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { familyMember } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// TODO: déplacer dans /api/family-member/update

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

/**
 * API pour compléter l'onboarding
 *
 * POST /api/onboarding/complete
 * Body: { familyMemberId, firstName, lastName, birthDate?, address?, phone? }
 *
 * 1. Vérifie que l'utilisateur est authentifié
 * 2. Vérifie que l'utilisateur n'a pas déjà un familyMemberId
 * 3. Vérifie que le membre existe
 * 4. Vérifie qu'aucun autre utilisateur n'a ce familyMemberId
 * 5. Met à jour les metadata Clerk (familyMemberId uniquement ; les noms restent en DB)
 * 6. Met à jour les infos du family_member dans la DB (source de vérité pour firstName/lastName)
 */
export async function POST(request: Request) {
  try {
    // 1. Vérifier l'authentification
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // 2. Vérifier que l'utilisateur n'a pas déjà un familyMemberId
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const existingFamilyMemberId = user.publicMetadata?.familyMemberId as
      | number
      | undefined;

    if (existingFamilyMemberId) {
      return NextResponse.json(
        { error: "Vous avez déjà complété l'onboarding" },
        { status: 400 }
      );
    }

    // 3. Valider les données
    const body = await request.json();
    const data = completeOnboardingSchema.parse(body);

    // 4. Vérifier que le membre existe
    const member = await db.query.familyMember.findFirst({
      where: eq(familyMember.id, data.familyMemberId),
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membre de la famille non trouvé" },
        { status: 404 }
      );
    }

    // 5. Vérifier qu'aucun autre utilisateur n'a ce familyMemberId
    const allUsers = await client.users.getUserList();
    for (const existingUser of allUsers.data) {
      const existingId = existingUser.publicMetadata?.familyMemberId as
        | number
        | undefined;
      if (existingId === data.familyMemberId && existingUser.id !== userId) {
        return NextResponse.json(
          {
            error: `Ce membre est déjà associé à un autre utilisateur (${existingUser.emailAddresses[0]?.emailAddress})`,
          },
          { status: 400 }
        );
      }
    }

    // 6. Mettre à jour les metadata Clerk (familyMemberId uniquement) et la DB (noms et infos)
    await Promise.all([
      client.users.updateUserMetadata(userId, {
        publicMetadata: {
          familyMemberId: data.familyMemberId,
        },
      }),
      // Infos du membre dans la DB (firstName/lastName = source de vérité, pas Clerk)
      db
        .update(familyMember)
        .set({
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate || member.birthDate,
          address: data.address || member.address,
          phone: data.phone || member.phone,
          latitude: data.latitude !== undefined ? data.latitude.toString() : member.latitude,
          longitude: data.longitude !== undefined ? data.longitude.toString() : member.longitude,
          mapboxPlaceId: data.mapboxPlaceId || member.mapboxPlaceId,
          updatedAt: new Date(),
        })
        .where(eq(familyMember.id, data.familyMemberId)),
    ]);

    return NextResponse.json({
      success: true,
      message: "Onboarding complété avec succès",
      familyMember: {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'onboarding:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de l'onboarding" },
      { status: 500 }
    );
  }
}
