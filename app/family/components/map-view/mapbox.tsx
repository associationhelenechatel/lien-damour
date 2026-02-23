"use client";

import { FamilyMemberWithRelations } from "@/lib/types";
import * as React from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CircleUser } from "lucide-react";
import { cn } from "@/lib/utils";

export function Mapbox({
  mapData,
}: {
  mapData: FamilyMemberWithRelations[];
}) {
  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        bounds: [
          [-5.4649, 51.8130],
          [10.0246, 41.2458],
        ],
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
    >
      {mapData.map((member) => (
        <Marker
          key={member.id}
          longitude={parseFloat(member.longitude!)}
          latitude={parseFloat(member.latitude!)}
          anchor="bottom"
        >
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center justify-center rounded-full bg-red-500 shadow-md transition hover:scale-110 hover:bg-red-600",
                  "focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                )}
                aria-label={`Voir ${member.displayName}`}
              >
                <CircleUser className="h-7 w-7 text-white" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="center"
              side="top"
              sideOffset={8}
              className="w-72"
            >
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
                  <p className="text-sm text-emerald-600">{member.address}</p>
                )}
                {member.children.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {member.children.length} enfant
                    {member.children.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </Marker>
      ))}
    </Map>
  );
}