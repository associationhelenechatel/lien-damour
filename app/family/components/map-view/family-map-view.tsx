"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Globe, Heart } from "lucide-react";
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

  // Statistiques des localisations géocodées
  const locationStats = useMemo(() => {
    const stats: { [key: string]: number } = {};
    mapData.forEach((person) => {
      if (person.address) {
        stats[person.address] = (stats[person.address] || 0) + 1;
      }
    });
    return Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8); // Top 8 locations
  }, [mapData]);

  const selectedPersonData = selectedPerson
    ? familyTree.members.find((p) => p.id === selectedPerson)
    : null;

  return (
    <div className="space-y-6">
      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Carte */}
        <div className="lg:col-span-3">
          <div className="h-[600px]">
            {mapData.length > 0 ? (
              <SimpleGeocodedMap
                familyData={mapData}
                selectedPerson={selectedPerson}
                onPersonSelect={setSelectedPerson}
              />
            ) : (
              <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Personne sélectionnée */}
          {selectedPersonData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Détails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold">
                    {selectedPersonData.displayName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Génération {selectedPersonData.generation}
                  </p>
                </div>

                {selectedPersonData.birthDate && (
                  <div>
                    <span className="text-sm font-medium">Naissance : </span>
                    <span className="text-sm">
                      {selectedPersonData.birthDate}
                    </span>
                  </div>
                )}

                {selectedPersonData.deathDate && (
                  <div>
                    <span className="text-sm font-medium">Décès : </span>
                    <span className="text-sm">
                      {selectedPersonData.deathDate}
                    </span>
                  </div>
                )}

                {selectedPersonData.address && (
                  <div>
                    <span className="text-sm font-medium">Adresse : </span>
                    <span className="text-sm">
                      {selectedPersonData.address}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      selectedPersonData.isAlive ? "default" : "secondary"
                    }
                  >
                    {selectedPersonData.isAlive ? "Vivant" : "Décédé"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top locations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Lieux Principaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {locationStats.map(([location, count]) => (
                  <div
                    key={location}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm font-medium truncate flex-1 mr-2">
                      {location}
                    </span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
                {locationStats.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucune localisation disponible
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
