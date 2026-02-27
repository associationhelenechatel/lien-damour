"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPersonDialog({ open, onOpenChange }: AddPersonDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    birthYear: "",
    deathYear: "",
    occupation: "",
    location: "",
    spouse: "",
    generation: "1",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici vous pourriez ajouter la logique pour sauvegarder la nouvelle personne
    console.log("Nouvelle personne:", formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      name: "",
      birthYear: "",
      deathYear: "",
      occupation: "",
      location: "",
      spouse: "",
      generation: "1",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter un membre de la famille
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ex: Marie Dubois"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthYear">Année de naissance *</Label>
              <Input
                id="birthYear"
                type="number"
                value={formData.birthYear}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    birthYear: e.target.value,
                  }))
                }
                placeholder="1950"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deathYear">Année de décès</Label>
              <Input
                id="deathYear"
                type="number"
                value={formData.deathYear}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deathYear: e.target.value,
                  }))
                }
                placeholder="Optionnel"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="generation">Génération</Label>
            <Select
              value={formData.generation}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, generation: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1ère génération</SelectItem>
                <SelectItem value="2">2ème génération</SelectItem>
                <SelectItem value="3">3ème génération</SelectItem>
                <SelectItem value="4">4ème génération</SelectItem>
                <SelectItem value="5">5ème génération</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Profession</Label>
            <Input
              id="occupation"
              value={formData.occupation}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, occupation: e.target.value }))
              }
              placeholder="Ex: Médecin, Professeur..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu de résidence</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="Ex: Paris, France"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spouse">Époux/Épouse</Label>
            <Input
              id="spouse"
              value={formData.spouse}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, spouse: e.target.value }))
              }
              placeholder="Nom du conjoint"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Ajouter</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
