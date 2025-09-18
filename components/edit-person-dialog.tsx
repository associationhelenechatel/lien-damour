"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface Person {
  id: string
  name: string
  birthYear: number
  deathYear?: number
  generation: number
  parents: string[]
  children: string[]
  spouse?: string
  occupation?: string
  location?: string
}

interface EditPersonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  person: Person
  onEditPerson: (person: Person) => void
  existingFamily: Person[]
}

export function EditPersonDialog({ open, onOpenChange, person, onEditPerson, existingFamily }: EditPersonDialogProps) {
  const [formData, setFormData] = useState<Person>(person)
  const [isDeceased, setIsDeceased] = useState(!!person.deathYear)

  useEffect(() => {
    setFormData(person)
    setIsDeceased(!!person.deathYear)
  }, [person])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updatedPerson = {
      ...formData,
      deathYear: isDeceased ? formData.deathYear : undefined,
    }

    onEditPerson(updatedPerson)
    onOpenChange(false)
  }

  const availableParents = existingFamily.filter(
    (p) => p.id !== person.id && p.generation < person.generation && !person.children.includes(p.id),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier {person.name}</DialogTitle>
          <DialogDescription>Modifiez les informations de ce membre de la famille.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="generation">Génération</Label>
              <Select
                value={formData.generation.toString()}
                onValueChange={(value) => setFormData({ ...formData, generation: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((gen) => (
                    <SelectItem key={gen} value={gen.toString()}>
                      Génération {gen}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthYear">Année de naissance</Label>
              <Input
                id="birthYear"
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.birthYear}
                onChange={(e) => setFormData({ ...formData, birthYear: Number.parseInt(e.target.value) })}
                required
              />
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox id="deceased" checked={isDeceased} onCheckedChange={setIsDeceased} />
                <Label htmlFor="deceased">Décédé(e)</Label>
              </div>
              {isDeceased && (
                <Input
                  type="number"
                  min={formData.birthYear}
                  max={new Date().getFullYear()}
                  value={formData.deathYear || ""}
                  onChange={(e) => setFormData({ ...formData, deathYear: Number.parseInt(e.target.value) })}
                  placeholder="Année de décès"
                />
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="spouse">Conjoint(e)</Label>
            <Input
              id="spouse"
              value={formData.spouse || ""}
              onChange={(e) => setFormData({ ...formData, spouse: e.target.value })}
              placeholder="Nom du conjoint"
            />
          </div>

          <div>
            <Label htmlFor="occupation">Profession</Label>
            <Input
              id="occupation"
              value={formData.occupation || ""}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="Profession"
            />
          </div>

          <div>
            <Label htmlFor="location">Lieu de résidence</Label>
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ville, Pays"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Sauvegarder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
