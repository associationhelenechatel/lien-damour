"use client";

import { useState, useMemo } from "react";
import { Search, Users, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PersonCard } from "@/components/person-card";
import { AddPersonDialog } from "@/components/add-person-dialog";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { FamilyStats } from "@/components/family-stats";
import familyData from "@/data/family-data.json";

const stats = {
  generations: Math.max(...familyData.map((p) => p.generation)),
  couples: familyData.filter((p) => p.spouse).length,
  years:
    new Date().getFullYear() - Math.min(...familyData.map((p) => p.birthYear)),
  locations: Array.from(new Set(familyData.map((p) => p.location))).length,
};

export { FamilyTreeApp };
export default function FamilyTreeApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedGeneration, setSelectedGeneration] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredFamilyData = useMemo(() => {
    if (!searchTerm && !selectedGeneration) return familyData;
    return familyData.filter(
      (person) =>
        (!searchTerm ||
          person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.location?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!selectedGeneration || person.generation === selectedGeneration)
    );
  }, [searchTerm, selectedGeneration]);

  const groupedByBranch = useMemo(() => {
    const grouped = {};
    familyData.forEach((person) => {
      const branchName = `Génération ${person.generation}`;
      if (!grouped[branchName]) grouped[branchName] = [];
      grouped[branchName].push(person);
    });
    return grouped;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        {/* Family Statistics */}
        <FamilyStats familyData={familyData} />

        {/* Search and controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un membre de la famille..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-emerald-200 focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Family list */}
          <div className="lg:col-span-2 space-y-4">
            {/* Branch display */}
            <div className="space-y-6">
              {Object.entries(groupedByBranch).map(([branchName, members]) => (
                <div
                  key={branchName}
                  className="bg-white/80 backdrop-blur-sm rounded-lg border border-emerald-200 shadow-sm"
                >
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto hover:bg-emerald-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <span className="font-semibold text-lg text-emerald-900">
                            {branchName}
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-800"
                          >
                            {members.length} membre
                            {members.length > 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="h-4 w-4 text-emerald-600">↓</div>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                      <div className="grid gap-3">
                        {members.map((person) => (
                          <div
                            key={person.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedPerson?.id === person.id
                                ? "border-emerald-400 bg-emerald-50 shadow-md"
                                : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                            }`}
                            onClick={() => setSelectedPerson(person)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-slate-900">
                                  {person.name}
                                </h3>
                                <p className="text-sm text-slate-600">
                                  {person.birthYear}
                                  {person.deathYear && ` - ${person.deathYear}`}
                                  {person.location && ` • ${person.location}`}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="border-emerald-300 text-emerald-700"
                              >
                                Gen. {person.generation}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          </div>

          {/* Details panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white/90 backdrop-blur-sm rounded-lg border border-emerald-200 shadow-lg p-6">
              {selectedPerson ? (
                <PersonCard
                  person={selectedPerson}
                  familyData={familyData}
                  onPersonSelect={(personId) => {
                    const person = familyData.find((p) => p.id === personId);
                    if (person) setSelectedPerson(person);
                  }}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    Sélectionnez un membre de la famille pour voir ses détails
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AddPersonDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
