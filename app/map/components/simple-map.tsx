"use client";

import { useEffect, useRef } from "react";

interface Person {
  id: string;
  name: string;
  birthYear: number;
  deathYear?: number;
  generation: number;
  parents: string[];
  children: string[];
  spouse?: string;
  occupation?: string;
  location?: string;
}

interface SimpleMapProps {
  familyData: Person[];
  selectedPerson?: string | null;
  onPersonSelect?: (personId: string) => void;
}

// Coordonnées approximatives des villes françaises
const cityCoordinates: { [key: string]: [number, number] } = {
  "Lyon, France": [45.764, 4.8357],
  "Paris, France": [48.8566, 2.3522],
  "Marseille, France": [43.2965, 5.3698],
  "Bordeaux, France": [44.8378, -0.5792],
  "Nice, France": [43.7102, 7.262],
  "Toulouse, France": [43.6047, 1.4442],
  "Nantes, France": [47.2184, -1.5536],
  "Strasbourg, France": [48.5734, 7.7521],
  "Montpellier, France": [43.611, 3.8767],
  "Lille, France": [50.6292, 3.0573],
  "Cannes, France": [43.5528, 7.0174],
  Monaco: [43.7384, 7.4246],
  "Aix-en-Provence, France": [43.5297, 5.4474],
  "Orléans, France": [47.9029, 1.9093],
  "Tours, France": [47.3941, 0.6848],
  "Perpignan, France": [42.6886, 2.8946],
};

export default function SimpleMap({
  familyData,
  selectedPerson,
  onPersonSelect,
}: SimpleMapProps) {
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
            [46.603354, 1.888334],
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

        // Add markers for family members with locations
        familyData.forEach((person) => {
          if (person.location && cityCoordinates[person.location]) {
            const [lat, lng] = cityCoordinates[person.location];

            const marker = L.marker([lat, lng])
              .addTo(mapInstanceRef.current)
              .bindPopup(
                `
                <div class="p-2">
                  <h3 class="font-semibold text-emerald-800">${person.name}</h3>
                  <p class="text-sm text-gray-600">
                    ${person.birthYear}${
                  person.deathYear
                    ? ` - ${person.deathYear}`
                    : ` (${new Date().getFullYear() - person.birthYear} ans)`
                }
                  </p>
                  ${
                    person.occupation
                      ? `<p class="text-sm text-gray-600">${person.occupation}</p>`
                      : ""
                  }
                  <p class="text-sm text-emerald-600">${person.location}</p>
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
          }
        });
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
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
