/**
 * Composant client pour l'arbre généalogique utilisant la base de données
 */

"use client";

import { useState } from "react";
import { Search, MapPin, TreePine, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FamilyTree } from "@/lib/types";
import { ListView } from "./list-view";
import { TreeView } from "./tree-view";
import { MapView } from "./map-view";

interface FamilyDashboardProps {
  initialFamilyTree: FamilyTree;
}

export function FamilyDashboard({ initialFamilyTree }: FamilyDashboardProps) {
  const [viewMode, setViewMode] = useState<"list" | "tree" | "map">("list");

  return (
    <div className="space-y-6">
      {/* Filtres et Mode de vue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche et Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode de vue */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className="flex-1 flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Liste
            </Button>
            <Button
              variant={viewMode === "tree" ? "default" : "ghost"}
              onClick={() => setViewMode("tree")}
              className="flex-1 flex items-center gap-2"
            >
              <TreePine className="h-4 w-4" />
              Arbre
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              onClick={() => setViewMode("map")}
              className="flex-1 flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Carte
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            {viewMode === "list"
              ? "Vue liste avec recherche et pagination"
              : viewMode === "tree"
              ? `${initialFamilyTree.stats.totalMembers} membres dans l'arbre`
              : `${initialFamilyTree.stats.totalMembers} membres • Vue géographique`}
          </div>
        </CardContent>
      </Card>

      {/* Affichage principal */}
      {viewMode === "list" ? (
        <ListView familyTree={initialFamilyTree} />
      ) : viewMode === "tree" ? (
        <TreeView familyTree={initialFamilyTree} />
      ) : (
        <MapView familyTree={initialFamilyTree} />
      )}
    </div>
  );
}
