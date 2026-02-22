"use client";

import { useEffect, useState } from "react";
import { FamilyDashboard } from "./family-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import type { FamilyTree } from "@/lib/types";

export function FamilyTreeWithAuth() {
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données côté client
  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement des données...</p>
        </div>
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
    <div className="w-full h-[calc(100vh-69px)]">
      <FamilyDashboard initialFamilyTree={familyTree} />
    </div>
  );
}
