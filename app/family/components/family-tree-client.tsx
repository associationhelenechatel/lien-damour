/**
 * Composant client pour l'arbre généalogique utilisant la base de données
 */

"use client";

import { useState, useMemo } from "react";
import { Search, Users, Heart, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FamilyTree, FamilyMemberWithRelations } from "@/lib/types";

interface FamilyTreeClientProps {
  initialFamilyTree: FamilyTree;
}

export function FamilyTreeClient({ initialFamilyTree }: FamilyTreeClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState<string>("all");
  const [showAliveOnly, setShowAliveOnly] = useState(false);

  // Filtrer les membres selon les critères
  const filteredMembers = useMemo(() => {
    let members = initialFamilyTree.members;

    // Filtre par terme de recherche
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      members = members.filter(
        (member) =>
          member.fullName.toLowerCase().includes(search) ||
          member.displayName.toLowerCase().includes(search) ||
          (member.code && member.code.toLowerCase().includes(search))
      );
    }

    // Filtre par génération
    if (selectedGeneration !== "all") {
      const generation = parseInt(selectedGeneration);
      members = members.filter((member) => member.generation === generation);
    }

    // Filtre par statut vivant/décédé
    if (showAliveOnly) {
      members = members.filter((member) => member.isAlive);
    }

    return members;
  }, [
    initialFamilyTree.members,
    searchTerm,
    selectedGeneration,
    showAliveOnly,
  ]);

  // Grouper par génération pour l'affichage
  const membersByGeneration = useMemo(() => {
    const grouped: Record<number, FamilyMemberWithRelations[]> = {};

    filteredMembers.forEach((member) => {
      if (!grouped[member.generation]) {
        grouped[member.generation] = [];
      }
      grouped[member.generation].push(member);
    });

    return grouped;
  }, [filteredMembers]);

  const generations = Object.keys(membersByGeneration)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">
              {initialFamilyTree.stats.totalMembers}
            </div>
            <div className="text-sm text-gray-600">Membres</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">
              {initialFamilyTree.stats.totalPartnerships}
            </div>
            <div className="text-sm text-gray-600">Couples</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">
              {initialFamilyTree.stats.livingMembers}
            </div>
            <div className="text-sm text-gray-600">Vivants</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {initialFamilyTree.stats.generations}
            </div>
            <div className="text-sm text-gray-600">Générations</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche et Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <Select
              value={selectedGeneration}
              onValueChange={setSelectedGeneration}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Génération" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les générations</SelectItem>
                {Array.from(
                  { length: initialFamilyTree.stats.generations },
                  (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      Génération {i}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Button
              variant={showAliveOnly ? "default" : "outline"}
              onClick={() => setShowAliveOnly(!showAliveOnly)}
              className="w-full md:w-auto"
            >
              {showAliveOnly ? "Tous" : "Vivants seulement"}
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            {filteredMembers.length} membre(s) affiché(s) sur{" "}
            {initialFamilyTree.stats.totalMembers}
          </div>
        </CardContent>
      </Card>

      {/* Affichage par génération */}
      <div className="space-y-6">
        {generations.map((generation) => (
          <Card key={generation}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Génération {generation}</span>
                <Badge variant="outline">
                  {membersByGeneration[generation].length} membre(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {membersByGeneration[generation].map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun membre trouvé avec ces critères.</p>
            <p className="text-sm mt-2">
              Essayez de modifier vos filtres de recherche.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MemberCard({ member }: { member: FamilyMemberWithRelations }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* En-tête */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-tight">
                {member.displayName}
              </h3>
              {member.code && (
                <p className="text-xs text-gray-500 font-mono">
                  Code: {member.code}
                </p>
              )}
            </div>
            <Badge
              variant={member.isAlive ? "default" : "secondary"}
              className="ml-2"
            >
              {member.isAlive ? "Vivant" : "Décédé"}
            </Badge>
          </div>

          {/* Dates */}
          {(member.birthYear || member.deathYear) && (
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {member.birthYear || "?"} -{" "}
                  {member.deathYear || (member.isAlive ? "Vivant" : "?")}
                  {member.age && ` (${member.age} ans)`}
                </span>
              </div>
            </div>
          )}

          {/* Partenaire */}
          {member.partner && (
            <div className="text-sm">
              <div className="flex items-center gap-2 text-pink-600">
                <Heart className="h-4 w-4" />
                <span>
                  Marié(e) à {member.partner.firstName}{" "}
                  {member.partner.lastName}
                </span>
              </div>
            </div>
          )}

          {/* Relations */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium text-gray-700">Parents:</span>
              <span className="ml-1 text-gray-600">
                {member.parents.length > 0 ? member.parents.length : "Aucun"}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Enfants:</span>
              <span className="ml-1 text-gray-600">
                {member.children.length > 0 ? member.children.length : "Aucun"}
              </span>
            </div>
          </div>

          {/* Adresse */}
          {member.address && (
            <div
              className="text-xs text-gray-500 truncate"
              title={member.address}
            >
              📍 {member.address}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
