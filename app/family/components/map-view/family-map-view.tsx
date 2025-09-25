"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Globe, Heart } from "lucide-react";
import { LeafletMap } from "@/app/family/components/map-view/leaflet-map";
import type { FamilyTree, FamilyMemberWithRelations } from "@/lib/types";

interface FamilyMapViewProps {
  familyTree: FamilyTree;
}

// Adapter les données pour le composant LeafletMap
function adaptFamilyDataForMap(members: FamilyMemberWithRelations[]) {
  return members
    .filter((member) => member.address) // Seulement ceux avec une adresse
    .map((member) => ({
      id: member.id.toString(),
      name: member.displayName,
      birthYear: member.birthDate
        ? new Date(member.birthDate).getFullYear()
        : 0,
      deathYear: member.deathDate
        ? new Date(member.deathDate).getFullYear()
        : undefined,
      generation: member.generation,
      parents: member.parents.map((p) => p.id.toString()),
      children: member.children.map((c) => c.id.toString()),
      spouse: member.partner?.id.toString(),
      occupation: undefined, // Pas d'occupation dans notre schéma actuel
      location: member.address || undefined,
    }));
}

export function FamilyMapView({ familyTree }: FamilyMapViewProps) {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  // Adapter les données pour la carte
  const mapData = useMemo(
    () => adaptFamilyDataForMap(familyTree.members),
    [familyTree.members]
  );

  // Statistiques des localisations
  const locationStats = useMemo(() => {
    const stats: { [key: string]: number } = {};
    mapData.forEach((person) => {
      if (person.location) {
        stats[person.location] = (stats[person.location] || 0) + 1;
      }
    });
    return Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8); // Top 8 locations
  }, [mapData]);

  const selectedPersonData = selectedPerson
    ? familyTree.members.find((p) => p.id.toString() === selectedPerson)
    : null;

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center justify-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="text-lg font-bold">{mapData.length}</div>
            <div className="text-md text-gray-600">Avec adresse</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center justify-center gap-2">
            <Globe className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="text-lg font-bold">{locationStats.length}</div>
            <div className="text-md text-gray-600">Lieux différents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center justify-center gap-2">
            <Users className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <div className="text-lg font-bold">
              {Math.round(
                (mapData.length / familyTree.stats.totalMembers) * 100
              )}
              %
            </div>
            <div className="text-md text-gray-600">Géolocalisés</div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Carte */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Répartition Géographique de la Famille
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                {mapData.length > 0 ? (
                  <LeafletMap
                    familyData={mapData}
                    selectedPerson={selectedPerson}
                    onPersonSelect={setSelectedPerson}
                  />
                ) : (
                  <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun membre avec adresse trouvé</p>
                      <p className="text-sm mt-2">
                        Les adresses doivent être renseignées dans la base de
                        données
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
