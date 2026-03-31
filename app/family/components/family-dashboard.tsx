"use client";

import { useState, useCallback, useMemo } from "react";
import { MapPin, TreePine, User } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { FamilyTree } from "@/lib/types";
import { ListView2 } from "./list-view";
import { TreeView } from "./tree-view";
import { MapView } from "./map-view";

interface FamilyDashboardProps {
  familyTree: FamilyTree;
  /** Ouvre la vue carte centrée sur ce membre (ex. query `?map=42` depuis la fiche profil). */
  initialMapMemberId?: number | null;
}

export function FamilyDashboard({
  familyTree,
  initialMapMemberId = null,
}: FamilyDashboardProps) {
  const openMapOnMember = useMemo(
    () =>
      initialMapMemberId != null && initialMapMemberId > 0
        ? initialMapMemberId
        : null,
    [initialMapMemberId]
  );

  const [viewMode, setViewMode] = useState<"list" | "tree" | "map">(
    () => (openMapOnMember != null ? "map" : "list")
  );
  const [mapCenterOnMemberId, setMapCenterOnMemberId] = useState<number | null>(
    () => openMapOnMember
  );

  const handleViewOnMap = useCallback((memberId: number) => {
    setMapCenterOnMemberId(memberId);
    setViewMode("map");
  }, []);

  const handleMapCentered = useCallback(() => {
    // Ne pas effacer mapCenterOnMemberId ici : on le garde pour laisser le popover ouvert.
  }, []);

  const handlePopoverOpen = useCallback((memberId: number) => {
    setMapCenterOnMemberId(memberId);
  }, []);

  const handlePopoverClose = useCallback(() => {
    setMapCenterOnMemberId(null);
  }, []);

  return (
    <div className="relative w-full min-h-[calc(100vh-3.5rem-1px)]">
      {/* Navigation entre vues - superposée au-dessus du contenu */}
      <div
        id="nav"
        className="fixed top-18 left-1/2 -translate-x-1/2 z-40 flex justify-center pointer-events-auto"
      >
        <ToggleGroup
          variant="outline"
          type="single"
          value={viewMode}
          onValueChange={(value) =>
            value &&
            setViewMode(value as "list" | "map" | "tree")
          }
          className="bg-white/95 backdrop-blur-sm shadow-sm rounded-md"
        >
         
          <ToggleGroupItem value="list">
            <User className="h-4 w-4" />
            Liste
          </ToggleGroupItem>
          <ToggleGroupItem value="map">
            <MapPin className="h-4 w-4" />
            Carte
          </ToggleGroupItem>
          <ToggleGroupItem value="tree">
            <TreePine className="h-4 w-4" />
            Arbre
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div
        className={
          viewMode === "list"
            ? "w-full"
            : "h-[calc(100vh-3.5rem-1px)] w-full"
        }
      >
       {viewMode === "list" ? (
          <ListView2
            familyTree={familyTree}
          />
        ) : viewMode === "map" ? (
          <MapView
            familyTree={familyTree}
            centerOnMemberId={mapCenterOnMemberId}
            onMapCentered={handleMapCentered}
            onPopoverOpen={handlePopoverOpen}
            onPopoverClose={handlePopoverClose}
          />
          
        ) : (
          <TreeView familyTree={familyTree} />
        )}
      </div>
    </div>
  );
}
