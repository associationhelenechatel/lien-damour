"use client";

import { useEffect, useRef } from "react";
import type { FamilyMemberWithRelations } from "@/lib/types";

interface SimpleGeocodedMapProps {
  familyData: FamilyMemberWithRelations[];
  selectedPerson?: number | null;
  onPersonSelect?: (personId: number) => void;
}

export default function SimpleGeocodedMap({
  familyData,
  selectedPerson,
  onPersonSelect,
}: SimpleGeocodedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || typeof window === "undefined") return;

      try {
        // Import Leaflet dynamically
        const L = await import("leaflet");

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        // Create map if it doesn't exist
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapRef.current).setView(
            [46.603354, 1.888334], // Centre de la France
            6
          );

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(mapInstanceRef.current);
        }

        // Clear existing markers
        mapInstanceRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        // Filter only members with geocoded coordinates
        const geocodedMembers = familyData.filter(
          (person) => person.latitude && person.longitude
        );

        // Add markers for geocoded family members only
        geocodedMembers.forEach((person) => {
          const lat = parseFloat(person.latitude!);
          const lng = parseFloat(person.longitude!);

          const marker = L.marker([lat, lng])
            .addTo(mapInstanceRef.current)
            .bindPopup(
              `
              <div class="p-2">
                <h3 class="font-semibold text-emerald-800">${
                  person.displayName
                }</h3>
                <p class="text-sm text-gray-600">
                  ${person.birthYear || "Naissance inconnue"}${
                person.deathYear
                  ? ` - ${person.deathYear}`
                  : person.age
                  ? ` (${person.age} ans)`
                  : ""
              }
                </p>
                ${
                  person.code
                    ? `<p class="text-sm text-gray-600">Code: ${person.code}</p>`
                    : ""
                }
                ${
                  person.address
                    ? `<p class="text-sm text-emerald-600">${person.address}</p>`
                    : ""
                }
                ${
                  person.children.length > 0
                    ? `<p class="text-xs text-gray-500">${
                        person.children.length
                      } enfant${person.children.length > 1 ? "s" : ""}</p>`
                    : ""
                }
                <p class="text-xs text-blue-500 mt-1">
                  📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}
                </p>
              </div>
            `
            )
            .on("click", () => {
              if (onPersonSelect) {
                onPersonSelect(person.id);
              }
            });

          // Open popup if this person is selected
          if (selectedPerson === person.id) {
            marker.openPopup();
          }
        });

        // Auto-fit map to show all markers if we have any
        if (geocodedMembers.length > 0) {
          const markers = geocodedMembers.map((person) =>
            L.marker([
              parseFloat(person.latitude!),
              parseFloat(person.longitude!),
            ])
          );
          const group = new (L as any).featureGroup(markers);
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();
  }, [familyData, selectedPerson, onPersonSelect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full overflow-hidden relative">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
