"use client";

import { FamilyMemberWithRelations } from "@/lib/types";
import * as React from "react";
import { useRef, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import MapGL, { Marker } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CircleUser } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [-5.4649, 51.813],
  [10.0246, 41.2458],
];

type LocationGroup = {
  key: string;
  latitude: number;
  longitude: number;
  members: FamilyMemberWithRelations[];
};

function locationGroupKey(m: FamilyMemberWithRelations): string {
  const placeId = m.mapboxPlaceId?.trim();
  if (placeId) return `place:${placeId}`;
  const lat = parseFloat(String(m.latitude));
  const lng = parseFloat(String(m.longitude));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return `id:${m.id}`;
  return `ll:${lat.toFixed(5)},${lng.toFixed(5)}`;
}

function groupMembersByLocation(
  members: FamilyMemberWithRelations[]
): LocationGroup[] {
  const map = new Map<string, FamilyMemberWithRelations[]>();
  for (const m of members) {
    const k = locationGroupKey(m);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(m);
  }
  return [...map.entries()].map(([key, list]) => {
    const sorted = [...list].sort((a, b) =>
      a.displayName.localeCompare(b.displayName, "fr")
    );
    const lat = parseFloat(String(sorted[0]!.latitude));
    const lng = parseFloat(String(sorted[0]!.longitude));
    return {
      key,
      latitude: lat,
      longitude: lng,
      members: sorted,
    };
  });
}

function memberSummaryLine(member: FamilyMemberWithRelations) {
  const birth = member.birthYear ?? "Naissance inconnue";
  const end = member.deathYear
    ? ` – ${member.deathYear}`
    : member.age
      ? ` (${member.age} ans)`
      : "";
  return `${birth}${end}`;
}

export function Mapbox({
  mapData,
  centerOn = null,
  onMapCentered,
  openPopoverForMemberId = null,
  onPopoverOpen,
  onPopoverClose,
}: {
  mapData: FamilyMemberWithRelations[];
  centerOn?: { latitude: number; longitude: number } | null;
  onMapCentered?: () => void;
  /** Quand fourni, le popover du groupe contenant ce membre est ouvert. */
  openPopoverForMemberId?: number | null;
  onPopoverOpen?: (memberId: number) => void;
  onPopoverClose?: () => void;
}) {
  const mapRef = useRef<MapRef>(null);
  const [mapReady, setMapReady] = useState(false);

  const locationGroups = useMemo(
    () => groupMembersByLocation(mapData),
    [mapData]
  );

  useEffect(() => {
    if (!centerOn || !mapRef.current || !mapReady) return;
    const map = mapRef.current.getMap();
    map.flyTo({
      center: [centerOn.longitude, centerOn.latitude],
      zoom: 14,
      duration: 1500,
    });
    onMapCentered?.();
  }, [centerOn, onMapCentered, mapReady]);

  return (
    <MapGL
      ref={mapRef}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        bounds: DEFAULT_BOUNDS,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      onLoad={() => setMapReady(true)}
    >
      {locationGroups.map((group) => {
        const count = group.members.length;
        const isMulti = count > 1;
        const popoverOpen =
          openPopoverForMemberId != null &&
          group.members.some((m) => m.id === openPopoverForMemberId);

        const primaryId =
          openPopoverForMemberId != null &&
          group.members.some((m) => m.id === openPopoverForMemberId)
            ? openPopoverForMemberId
            : group.members[0]!.id;

        const ariaLabel = isMulti
          ? `${count} personnes à cette adresse`
          : `Voir ${group.members[0]!.displayName}`;

        return (
          <Marker
            key={group.key}
            longitude={group.longitude}
            latitude={group.latitude}
            anchor="bottom"
          >
            <Popover
              open={popoverOpen}
              onOpenChange={(open) => {
                if (open) onPopoverOpen?.(primaryId);
                else onPopoverClose?.();
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "relative flex items-center justify-center rounded-full bg-red-500 shadow-md transition hover:scale-110 hover:bg-red-600",
                    "focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                  )}
                  aria-label={ariaLabel}
                >
                  <CircleUser className="h-7 w-7 text-white" />
                  {isMulti && (
                    <span
                      className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[10px] font-bold leading-none text-white"
                      aria-hidden
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                side="right"
                sideOffset={8}
                className={cn("w-72", isMulti && "max-h-80 overflow-y-auto")}
              >
                {isMulti ? (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-emerald-800">
                        {count} personnes à cette adresse
                      </h3>
                      {group.members[0]?.address && (
                        <p className="mt-1 text-sm text-emerald-600">
                          {group.members[0].address}
                        </p>
                      )}
                    </div>
                    <ul className="space-y-2 border-t border-slate-100 pt-2">
                      {group.members.map((member) => (
                        <li key={member.id}>
                          <Link
                            href={`/family/${member.id}`}
                            className="block rounded-md px-1 py-1.5 transition hover:bg-emerald-50"
                          >
                            <span className="font-medium text-emerald-900">
                              {member.displayName}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {memberSummaryLine(member)}
                              {member.code ? ` · ${member.code}` : ""}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  (() => {
                    const member = group.members[0]!;
                    return (
                      <div className="space-y-2">
                        <h3 className="font-semibold text-emerald-800">
                          {member.displayName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {member.birthYear ?? "Naissance inconnue"}
                          {member.deathYear
                            ? ` – ${member.deathYear}`
                            : member.age
                              ? ` (${member.age} ans)`
                              : ""}
                        </p>
                        {member.code && (
                          <p className="text-sm text-muted-foreground">
                            Code : {member.code}
                          </p>
                        )}
                        {member.address && (
                          <p className="text-sm text-emerald-600">
                            {member.address}
                          </p>
                        )}
                        {member.children.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {member.children.length} enfant
                            {member.children.length > 1 ? "s" : ""}
                          </p>
                        )}
                        <Link
                          href={`/family/${member.id}`}
                          className="inline-block text-sm font-medium text-emerald-700 underline-offset-2 hover:underline"
                        >
                          Voir la fiche
                        </Link>
                      </div>
                    );
                  })()
                )}
              </PopoverContent>
            </Popover>
          </Marker>
        );
      })}
    </MapGL>
  );
}
