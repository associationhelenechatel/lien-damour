"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";
import type { FamilyTree } from "@/lib/types";
import { MemberCard } from "./member-card";
import { Pagination } from "./pagination";

interface ListViewProps {
  familyTree: FamilyTree;
}

export function ListView({ familyTree }: ListViewProps) {
  const { user } = useUser();

  const currentFamilyMemberId = user?.publicMetadata?.familyMemberId as
    | number
    | undefined;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const MEMBERS_PER_PAGE = 20;

  // Filtrer les membres selon les critères
  const filteredMembers = familyTree.members
    .filter((member) => {
      // Filtre par terme de recherche
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          member.fullName.toLowerCase().includes(search) ||
          member.displayName.toLowerCase().includes(search) ||
          (member.code && member.code.toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }

      return true;
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  // Pagination
  const paginatedMembers = {
    members: filteredMembers.slice(
      currentPage * MEMBERS_PER_PAGE,
      (currentPage + 1) * MEMBERS_PER_PAGE
    ),
    totalPages: Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE),
    currentPage,
    totalMembers: filteredMembers.length,
  };

  const resetPage = () => setCurrentPage(0);

  return (
    <div className="space-y-6">
      {/* Liste des membres */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Barre de recherche */}
          <Input
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetPage();
            }}
            className="w-full bg-white"
          />

          {/* Grille des membres */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedMembers.members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isCurrentUser={currentFamilyMemberId === member.id}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={paginatedMembers.totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Message si aucun résultat */}
      {paginatedMembers.totalMembers === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
