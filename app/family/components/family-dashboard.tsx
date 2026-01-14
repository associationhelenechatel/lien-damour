/**
 * Tableau de bord principal de la famille avec navigation entre vues
 */

"use client";

import { useState } from "react";
import { MapPin, TreePine, User } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
    <div className="container mx-auto p-6">
      <div className="space-y-8">
        {/* Navigation entre vues */}
        <div className="flex justify-center">
          <ToggleGroup
            variant="outline"
            type="single"
            value={viewMode}
            onValueChange={(value) =>
              value && setViewMode(value as "list" | "tree" | "map")
            }
          >
            <ToggleGroupItem value="list">
              <User className="h-4 w-4" />
              Liste
            </ToggleGroupItem>
            <ToggleGroupItem value="tree">
              <TreePine className="h-4 w-4" />
              Arbre
            </ToggleGroupItem>
            <ToggleGroupItem value="map">
              <MapPin className="h-4 w-4" />
              Carte
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Affichage principal */}
        {viewMode === "list" ? (
          <ListView familyTree={initialFamilyTree} />
        ) : viewMode === "tree" ? (
          <TreeView familyTree={initialFamilyTree} />
        ) : (
          <MapView familyTree={initialFamilyTree} />
        )}
      </div>
    </div>
  );
}
