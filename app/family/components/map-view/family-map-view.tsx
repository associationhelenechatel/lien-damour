"use client";

import { useState, useMemo } from "react";
import { MapPin } from "lucide-react";
import SimpleGeocodedMap from "@/app/family/components/map-view/simple-geocoded-map";
import type { FamilyTree, FamilyMemberWithRelations } from "@/lib/types";

interface FamilyMapViewProps {
  familyTree: FamilyTree;
}

// Adapter les données pour le composant Map - seulement ceux avec coordonnées géocodées
function adaptFamilyDataForMap(members: FamilyMemberWithRelations[]) {
  return members.filter((member) => member.latitude && member.longitude);
}

export function FamilyMapView({ familyTree }: FamilyMapViewProps) {
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);

  // Adapter les données pour la carte
  const mapData = useMemo(
    () => adaptFamilyDataForMap(familyTree.members),
    [familyTree.members]
  );

  return (
      <div className="w-full h-full">
        {mapData.length > 0 ? (
          <SimpleGeocodedMap
            familyData={mapData}
            selectedPerson={selectedPerson}
            onPersonSelect={setSelectedPerson}
          />
        ) : (
          <div className="h-full bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun membre géocodé trouvé</p>
              <p className="text-sm mt-2">
                Les adresses doivent être géocodées (latitude/longitude)
                pour apparaître sur la carte
              </p>
              <p className="text-xs mt-1 text-gray-400">
                Utilisez les scripts de géocodage pour traiter les adresses
              </p>
            </div>
          </div>
        )}
      </div>
  );
}
