import { getCompleteFamilyTree } from "@/lib/family-tree-service";
import { FamilyDashboard } from "@/app/family/components/family-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function FamilyPage() {
  try {
    const familyTree = await getCompleteFamilyTree();

    return (
      <div className="w-full h-[calc(100vh-69px)]">
        <FamilyDashboard initialFamilyTree={familyTree} />
      </div>
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur inconnue";
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Erreur de chargement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-2">
              Impossible de charger l&apos;arbre généalogique : {message}
            </p>
            <p className="text-sm text-red-500">
              Vérifiez que la base de données est accessible et contient des
              données.
            </p>
            <Link
              href="/family"
              className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Réessayer
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
}
