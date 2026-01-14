"use client";

import { useState, useMemo, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Loader2,
  User,
} from "lucide-react";
import { AddPersonDialog } from "@/components/add-person-dialog";
import { EditPersonDialog } from "@/components/edit-person-dialog";
import { DeletePersonDialog } from "@/components/delete-person-dialog";
import { getFamilyMembers, deleteFamilyMember } from "@/lib/api/family";
import type { FamilyMemberWithRelations } from "@/lib/types";

export default function AdminPage() {
  const { user } = useUser();
  console.log("USER", user);
  const currentFamilyMemberId = user?.publicMetadata?.familyMemberId as
    | number
    | undefined;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [family, setFamily] = useState<FamilyMemberWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load family data on component mount
  useEffect(() => {
    const loadFamilyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const members = await getFamilyMembers();
        setFamily(members);
      } catch (err) {
        setError("Failed to load family data");
        console.error("Error loading family data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFamilyData();
  }, []);

  const filteredFamily = useMemo(() => {
    if (!searchTerm) return family;
    return family.filter(
      (person) =>
        person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.maidenName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, family]);

  const selectedPersonData = selectedPerson
    ? family.find((p) => p.id === selectedPerson)
    : null;

  const handleAddPerson = async (newPerson: any) => {
    try {
      // The createFamilyMember function will be called from the dialog
      // We just need to refresh the data
      const members = await getFamilyMembers();
      setFamily(members);
      setShowAddDialog(false);
    } catch (err) {
      console.error("Error adding person:", err);
      setError("Failed to add person");
    }
  };

  const handleEditPerson = async (updatedPerson: any) => {
    try {
      // The updateFamilyMember function will be called from the dialog
      // We just need to refresh the data
      const members = await getFamilyMembers();
      setFamily(members);
      setShowEditDialog(false);
      setSelectedPerson(null);
    } catch (err) {
      console.error("Error updating person:", err);
      setError("Failed to update person");
    }
  };

  const handleDeletePerson = async () => {
    if (selectedPerson) {
      try {
        await deleteFamilyMember(selectedPerson);
        const members = await getFamilyMembers();
        setFamily(members);
        setShowDeleteDialog(false);
        setSelectedPerson(null);
      } catch (err) {
        console.error("Error deleting person:", err);
        setError("Failed to delete person");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, profession ou lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-emerald-200 focus:border-emerald-500"
            />
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un membre
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-emerald-600">
              Chargement des données...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-4"
              >
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Family List */}
        {!loading && !error && (
          <div className="grid gap-4">
            {filteredFamily.map((person) => {
              const isCurrentUser = currentFamilyMemberId === person.id;
              return (
                <Card
                  key={person.id}
                  className={`${
                    isCurrentUser
                      ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-300"
                      : "border-emerald-200 hover:shadow-md"
                  } transition-shadow`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className={`text-lg font-semibold ${
                              isCurrentUser
                                ? "text-blue-900"
                                : "text-emerald-900"
                            }`}
                          >
                            {person.displayName}
                          </h3>
                          {isCurrentUser && (
                            <Badge className="bg-blue-600 text-white">
                              <User className="h-3 w-3 mr-1" />
                              Vous
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={
                              isCurrentUser
                                ? "border-blue-300 text-blue-700"
                                : "border-emerald-300 text-emerald-700"
                            }
                          >
                            Génération {person.generation}
                          </Badge>
                          {person.code && (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-800 font-mono"
                            >
                              {person.code}
                            </Badge>
                          )}
                          {!person.isAlive && (
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-gray-600"
                            >
                              Décédé(e)
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-emerald-700">
                          {(person.birthYear || person.deathYear) && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {person.birthYear}
                                {person.deathYear && ` - ${person.deathYear}`}
                                {person.age && ` (${person.age} ans)`}
                              </span>
                            </div>
                          )}

                          {person.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{person.address}</span>
                            </div>
                          )}

                          {(person.children.length > 0 || person.partner) && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>
                                {person.children.length > 0 &&
                                  `${person.children.length} enfant${
                                    person.children.length > 1 ? "s" : ""
                                  }`}
                                {person.children.length > 0 &&
                                  person.partner &&
                                  ", "}
                                {person.partner && `marié(e)`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPerson(person.id);
                          setShowEditDialog(true);
                        }}
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPerson(person.id);
                          setShowDeleteDialog(true);
                        }}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredFamily.length === 0 && (
          <Card className="border-emerald-200">
            <CardContent className="p-8 text-center">
              <p className="text-emerald-700">
                Aucun membre trouvé pour cette recherche.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <AddPersonDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

        {selectedPersonData && (
          <EditPersonDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            person={selectedPersonData}
            onEditPerson={handleEditPerson}
            existingFamily={family}
          />
        )}

        {selectedPersonData && (
          <DeletePersonDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            person={selectedPersonData}
            onDeletePerson={handleDeletePerson}
          />
        )}
      </div>
    </div>
  );
}
