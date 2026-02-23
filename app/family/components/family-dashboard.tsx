"use client";

import { useState, useCallback } from "react";
import { MapPin, TreePine, User } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { FamilyTree } from "@/lib/types";
import { ListView } from "./list-view";
import { TreeView } from "./tree-view";
import { MapView } from "./map-view";

interface FamilyDashboardProps {
  familyTree: FamilyTree;
}

export function FamilyDashboard({ familyTree }: FamilyDashboardProps) {
  const [viewMode, setViewMode] = useState<"list" | "tree" | "map">("list");
  const [mapCenterOnMemberId, setMapCenterOnMemberId] = useState<number | null>(
    null
  );

  const handleViewOnMap = useCallback((memberId: number) => {
    setMapCenterOnMemberId(memberId);
    setViewMode("map");
  }, []);

  const handleMapCentered = useCallback(() => {
    setMapCenterOnMemberId(null);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Navigation entre vues - superposée au-dessus du contenu */}
      <div
        id="nav"
        className="fixed top-22 left-1/2 -translate-x-1/2 z-[9999] flex justify-center pointer-events-auto"
      >
        <ToggleGroup
          variant="outline"
          type="single"
          value={viewMode}
          onValueChange={(value) =>
            value && setViewMode(value as "list" | "tree" | "map")
          }
          className="bg-white/95 backdrop-blur-sm shadow-lg rounded-md"
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

      <div className="w-full h-full">
        {viewMode === "list" ? (
          <ListView
            familyTree={familyTree}
            onViewOnMap={handleViewOnMap}
          />
        ) : viewMode === "tree" ? (
          <TreeView familyTree={familyTree} />
        ) : (
          <MapView
            familyTree={familyTree}
            centerOnMemberId={mapCenterOnMemberId}
            onMapCentered={handleMapCentered}
          />
        )}
      </div>
    </div>
  );
}
