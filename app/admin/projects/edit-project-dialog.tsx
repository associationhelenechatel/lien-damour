"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import type { Project } from "@/lib/types";

const PROJECT_TYPES = ["Association", "Projet", "Partenariat"] as const;

const PROJECT_TAGS = [
  "Social",
  "Santé",
  "Patrimoine",
  "Éducation",
  "Logement",
  "Environnement",
  "Infrastructure",
  "Culture",
  "Humanitaire",
  "Formation",
  "Agriculture",
  "Partenariat",
] as const;

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSubmit: (data: Partial<Project>) => Promise<void>;
  title: string;
}

const emptyForm = {
  name: "",
  description: "",
  shortDescription: "",
  location: "",
  type: "",
  tag: "",
  logo: "",
};

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
  onSubmit,
  title,
}: EditProjectDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name ?? "",
        description: project.description ?? "",
        shortDescription: project.shortDescription ?? "",
        location: project.location ?? "",
        type: project.type ?? "",
        tag: project.tag ?? "",
        logo: project.logo ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [project, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim() || null,
        shortDescription: form.shortDescription.trim() || null,
        location: form.location.trim() || null,
        type: form.type.trim() || null,
        tag: form.tag.trim() || null,
        logo: form.logo.trim() || null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nom *</Label>
            <Input
              id="project-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nom du projet"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-short">Résumé</Label>
            <Input
              id="project-short"
              value={form.shortDescription}
              onChange={(e) =>
                setForm((f) => ({ ...f, shortDescription: e.target.value }))
              }
              placeholder="Courte description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-desc">Description</Label>
            <textarea
              id="project-desc"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Description détaillée"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-location">Lieu</Label>
            <Input
              id="project-location"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              placeholder="Ville, pays"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type || undefined}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={form.tag || undefined}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, tag: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TAGS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-logo">Logo (URL)</Label>
            <Input
              id="project-logo"
              value={form.logo}
              onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim()}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
