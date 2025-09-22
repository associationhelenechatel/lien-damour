/**
 * Composant qui combine authentification et arbre généalogique
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { FamilyTreeClient } from "./family-tree-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import type { FamilyTree } from "@/lib/types";

export function FamilyTreeWithAuth() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    // Charger les données côté client
    const loadFamilyTree = async () => {
      try {
        setLoading(true);
        setError(null);

        // Appel API pour récupérer les données
        const response = await fetch("/api/family-tree");

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setFamilyTree(data);
      } catch (err) {
        console.error(
          "Erreur lors du chargement de l'arbre généalogique:",
          err
        );
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    loadFamilyTree();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Accès restreint
          </h2>
          <p className="text-slate-600">
            Veuillez vous connecter pour accéder à l'arbre généalogique.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Chargement de l'arbre généalogique...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
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
              Impossible de charger l'arbre généalogique: {error}
            </p>
            <p className="text-sm text-red-500">
              Vérifiez que la base de données est accessible et contient des
              données.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Réessayer
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!familyTree) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Aucune donnée disponible</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Arbre Généalogique</h1>
        <p className="text-gray-600">
          {familyTree.stats.totalMembers} membres de la famille
        </p>
      </div>

      <FamilyTreeClient initialFamilyTree={familyTree} />
    </div>
  );
}
