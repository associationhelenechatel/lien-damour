"use client";

import { FamilyMapView } from "./family-map-view";
import type { FamilyTree } from "@/lib/types";

interface MapViewProps {
  familyTree: FamilyTree;
}

export function MapView({ familyTree }: MapViewProps) {
  return <FamilyMapView familyTree={familyTree} />;
}
