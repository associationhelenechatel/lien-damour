import { NextResponse } from "next/server";
import { db } from "@/db/client";

/**
 * API pour récupérer la liste des membres de la famille
 * Utilisé pour le select de l'onboarding
 */
export async function GET() {
  try {
    const members = await db.query.familyMember.findMany({
      orderBy: (members, { asc }) => [asc(members.firstName)],
    });

    // Formater pour l'onboarding (seulement les champs nécessaires)
    const formattedMembers = members.map((member) => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      maidenName: member.maidenName,
      birthDate: member.birthDate,
      address: member.address,
      phone: member.phone,
      mail: member.mail,
      code: member.code,
    }));

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error("Erreur API family-members:", error);
    return NextResponse.json(
      {
        error: "Impossible de récupérer les membres de la famille",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
