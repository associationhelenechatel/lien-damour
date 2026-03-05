"use client";

import { useMemo } from "react";
import type { FamilyTree, FamilyMemberWithRelations } from "@/lib/types";
import { Mapbox } from "./mapbox";

interface MapViewProps {
  familyTree: FamilyTree;
  centerOnMemberId?: number | null;
  onMapCentered?: () => void;
  onPopoverOpen?: (memberId: number) => void;
  onPopoverClose?: () => void;
}

function filterMembersWithoutCoordinates(members: FamilyMemberWithRelations[]) {
  return members.filter((member) => member.latitude && member.longitude);
}

function parseCoord(value: string | null | undefined): number | null {
  if (value == null || String(value).trim() === "") return null;
  const n = parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

export function MapView({
  familyTree,
  centerOnMemberId = null,
  onMapCentered,
  onPopoverOpen,
  onPopoverClose,
}: MapViewProps) {
  const mapData = useMemo(
    () => filterMembersWithoutCoordinates(familyTree.members),
    [familyTree.members]
  );

  const centerOn = useMemo(() => {
    if (centerOnMemberId == null) return null;
    const member = familyTree.members.find((m) => m.id === centerOnMemberId);
    if (!member) return null;
    const lat = parseCoord(member.latitude);
    const lng = parseCoord(member.longitude);
    if (lat == null || lng == null) return null;
    return { latitude: lat, longitude: lng };
  }, [familyTree.members, centerOnMemberId]);

  return (
    <Mapbox
      mapData={mapData}
      centerOn={centerOn}
      onMapCentered={onMapCentered}
      openPopoverForMemberId={centerOnMemberId}
      onPopoverOpen={onPopoverOpen}
      onPopoverClose={onPopoverClose}
    />
  );
}
