"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Briefcase,
} from "lucide-react";
import { AddPersonDialog } from "@/components/add-person-dialog";
import { EditPersonDialog } from "@/components/edit-person-dialog";
import { DeletePersonDialog } from "@/components/delete-person-dialog";
import { ProtectedRoute } from "@/components/protected-route";
import familyDataImport from "@/data/family-data.json";

// Import the family data (in a real app, this would come from a database)
const familyData = familyDataImport;

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [family, setFamily] = useState(familyData);

  const filteredFamily = useMemo(() => {
    if (!searchTerm) return family;
    return family.filter(
      (person) =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, family]);

  const selectedPersonData = selectedPerson
    ? family.find((p) => p.id === selectedPerson)
    : null;

  const handleAddPerson = (newPerson: any) => {
    const id = (
      Math.max(...family.map((p) => Number.parseInt(p.id))) + 1
    ).toString();
    setFamily([...family, { ...newPerson, id }]);
  };

  const handleEditPerson = (updatedPerson: any) => {
    setFamily(
      family.map((p) => (p.id === updatedPerson.id ? updatedPerson : p))
    );
  };

  const handleDeletePerson = (personId: string) => {
    setFamily(family.filter((p) => p.id !== personId));
    // Also remove from children arrays
    setFamily((prev) =>
      prev.map((p) => ({
        ...p,
        children: p.children.filter((childId) => childId !== personId),
      }))
    );
  };

  return (
    <ProtectedRoute>
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

          {/* Family List */}
          <div className="grid gap-4">
            {filteredFamily.map((person) => (
              <Card
                key={person.id}
                className="border-emerald-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-emerald-900">
                          {person.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="border-emerald-300 text-emerald-700"
                        >
                          Génération {person.generation}
                        </Badge>
                        {person.deathYear && (
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-600"
                          >
                            Décédé(e)
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-emerald-700">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {person.birthYear}
                            {person.deathYear && ` - ${person.deathYear}`}
                            {!person.deathYear &&
                              ` (${
                                new Date().getFullYear() - person.birthYear
                              } ans)`}
                          </span>
                        </div>

                        {person.occupation && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span>{person.occupation}</span>
                          </div>
                        )}

                        {person.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{person.location}</span>
                          </div>
                        )}
                      </div>

                      {person.spouse && (
                        <div className="mt-2 text-sm text-emerald-600">
                          <span className="font-medium">Conjoint(e):</span>{" "}
                          {person.spouse}
                        </div>
                      )}

                      <div className="mt-2 text-sm text-emerald-600">
                        <span className="font-medium">Enfants:</span>{" "}
                        {person.children.length}
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
          <AddPersonDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            onAddPerson={handleAddPerson}
            existingFamily={family}
          />

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
    </ProtectedRoute>
  );
}
