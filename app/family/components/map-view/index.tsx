"use client";

import { useMemo } from "react";
import type { FamilyTree, FamilyMemberWithRelations } from "@/lib/types";
import { Mapbox } from "./mapbox";

interface MapViewProps {
  familyTree: FamilyTree;
}

function filterMembersWithoutCoordinates(members: FamilyMemberWithRelations[]) {
  return members.filter((member) => member.latitude && member.longitude);
}

export function MapView({ familyTree }: MapViewProps) {

  const mapData = useMemo(
    () => filterMembersWithoutCoordinates(familyTree.members),
    [familyTree.members]
  );

  return <Mapbox mapData={mapData}/>
}
