"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, MapPin } from "lucide-react";
import { LeafletMap } from "@/app/map/components/leaflet-map";
import { PersonCard } from "@/components/person-card";

import { ProtectedRoute } from "@/components/protected-route";
import familyData from "@/data/family-data.json";

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [generationFilter, setGenerationFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const filteredFamily = useMemo(() => {
    let filtered = familyData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (person) =>
          person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Generation filter
    if (generationFilter !== "all") {
      filtered = filtered.filter(
        (person) => person.generation === Number.parseInt(generationFilter)
      );
    }

    // Location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter(
        (person) => person.location === locationFilter
      );
    }

    return filtered;
  }, [searchTerm, generationFilter, locationFilter]);

  const selectedPersonData = selectedPerson
    ? familyData.find((p) => p.id === selectedPerson)
    : null;

  // Get unique locations for filter
  const uniqueLocations = Array.from(
    new Set(familyData.map((p) => p.location).filter(Boolean))
  ).sort();

  // Get location statistics
  const locationStats = useMemo(() => {
    const stats: { [key: string]: number } = {};
    familyData.forEach((person) => {
      if (person.location) {
        stats[person.location] = (stats[person.location] || 0) + 1;
      }
    });
    return Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Top 5 locations
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="container mx-auto px-4 py-8">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map */}
            <div className="lg:col-span-3">
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    Les Chatel dans le monde
                  </CardTitle>
                  <CardDescription></CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px]">
                    <LeafletMap
                      familyData={filteredFamily}
                      selectedPerson={selectedPerson}
                      onPersonSelect={setSelectedPerson}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected Person Details */}
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-lg">Détails</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPersonData ? (
                    <PersonCard
                      person={selectedPersonData}
                      familyData={familyData}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-sm">
                        Sélectionnez un membre depuis la carte ou cliquez sur un
                        marqueur
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
