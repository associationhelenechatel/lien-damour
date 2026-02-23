"use client";

import { useState, useMemo } from "react";
import SimpleGeocodedMap from "@/app/family/components/map-view/simple-geocoded-map";
import type { FamilyTree, FamilyMemberWithRelations } from "@/lib/types";
import { Mapbox } from "./mapbox";

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
          // <SimpleGeocodedMap
          //   familyData={mapData}
          //   selectedPerson={selectedPerson}
          //   onPersonSelect={setSelectedPerson}
          // />
          <Mapbox mapData={mapData}/>
  );
}
