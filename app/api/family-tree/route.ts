/**
 * API Route pour récupérer l'arbre généalogique
 */

import { NextResponse } from "next/server";
import { getCompleteFamilyTree } from "@/lib/family-tree-service";

export async function GET() {
  try {
    const familyTree = await getCompleteFamilyTree();
    return NextResponse.json(familyTree);
  } catch (error) {
    console.error("Erreur API family-tree:", error);

    return NextResponse.json(
      {
        error: "Impossible de récupérer l'arbre généalogique",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
