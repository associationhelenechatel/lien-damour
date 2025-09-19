"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

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

interface DeletePersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: Person;
  onDeletePerson: (personId: string) => void;
}

export function DeletePersonDialog({
  open,
  onOpenChange,
  person,
  onDeletePerson,
}: DeletePersonDialogProps) {
  const handleDelete = () => {
    onDeletePerson(person.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Supprimer {person.name}
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce membre de la famille ? Cette
            action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">
              Informations à supprimer :
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>
                <strong>Nom :</strong> {person.name}
              </li>
              <li>
                <strong>Naissance :</strong> {person.birthYear}
              </li>
              {person.deathYear && (
                <li>
                  <strong>Décès :</strong> {person.deathYear}
                </li>
              )}
              {person.occupation && (
                <li>
                  <strong>Profession :</strong> {person.occupation}
                </li>
              )}
              {person.location && (
                <li>
                  <strong>Lieu :</strong> {person.location}
                </li>
              )}
              <li>
                <strong>Enfants :</strong> {person.children.length}
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
