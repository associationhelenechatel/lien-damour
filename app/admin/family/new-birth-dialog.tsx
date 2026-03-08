"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { DatePicker } from "@/components/ui/date-picker";
import type { FamilyTree, FamilyMemberWithRelations } from "@/lib/types";
import {
  getCodeForNewChild,
  createFamilyMember,
  addFamilyRelation,
} from "@/lib/api/family";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NewBirthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyTree: FamilyTree;
}

function membersSortedByCode(members: FamilyMemberWithRelations[]) {
  return [...members].sort((a, b) => {
    const ca = a.code ?? "";
    const cb = b.code ?? "";
    return ca.localeCompare(cb, undefined, { numeric: true });
  });
}

/** Âge en années révolues à la date de référence (aujourd'hui ou date de décès). */
function ageInYears(birthDate: string | null | undefined, refDate: Date = new Date()): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  let age = refDate.getFullYear() - birth.getFullYear();
  if (refDate.getMonth() < birth.getMonth() || (refDate.getMonth() === birth.getMonth() && refDate.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** Éligible comme Parent 1 : vivant et au moins 16 ans. */
function isEligibleAsParent1(member: FamilyMemberWithRelations): boolean {
  if (member.deathDate) return false;
  const ref = new Date();
  const age = ageInYears(member.birthDate, ref);
  return age !== null && age >= 16;
}

/** Affiche le nom complet + matricule (pour membres ou partenaires qui n'ont pas toujours fullName/displayName). */
function memberLabel(member: { firstName?: string | null; lastName?: string | null; fullName?: string; displayName?: string; code?: string | null }) {
  const full =
    member.fullName ??
    ([member.firstName, member.lastName].filter(Boolean).join(" ").trim() || member.displayName || "Nom inconnu");
  return member.code ? `${full} (${member.code})` : full;
}

export function NewBirthDialog({
  open,
  onOpenChange,
  familyTree,
}: NewBirthDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [parent1Id, setParent1Id] = useState<string>("");
  const [parent2Id, setParent2Id] = useState<string>("_none");
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState<string>("");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);

  /** Parent 1 : vivant, au moins 16 ans, trié par code. */
  const parent1Options = useMemo(
    () =>
      membersSortedByCode(
        familyTree.members.filter(isEligibleAsParent1)
      ),
    [familyTree.members]
  );

  const parent1 = useMemo(
    () => (parent1Id ? familyTree.members.find((m) => m.id === parseInt(parent1Id, 10)) : null),
    [familyTree.members, parent1Id]
  );

  const parent2 = useMemo(
    () =>
      parent2Id && parent2Id !== "_none"
        ? familyTree.members.find((m) => m.id === parseInt(parent2Id, 10))
        : null,
    [familyTree.members, parent2Id]
  );

  const derivedLastName =
    parent2?.gender === "M" ? (parent2.lastName ?? null) : (parent1?.lastName ?? null);

  /** Parent 2 ne peut être que le conjoint de Parent 1 (s'il en a un). */
  const parent2Options = useMemo(() => {
    if (!parent1?.partner) return [];
    return [parent1.partner];
  }, [parent1]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parent1Id || !firstName.trim()) {
      toast.error("Veuillez sélectionner au moins un parent et saisir le prénom de l'enfant.");
      return;
    }
    if (!gender) {
      toast.error("Veuillez sélectionner le sexe de l'enfant.");
      return;
    }

    const p1 = parseInt(parent1Id, 10);
    if (Number.isNaN(p1)) {
      toast.error("Parent invalide.");
      return;
    }

    const p1Member = familyTree.members.find((m) => m.id === p1)!;
    const p2Member =
      parent2Id && parent2Id !== "_none"
        ? familyTree.members.find((m) => m.id === parseInt(parent2Id, 10))
        : null;
    const childLastName =
      p2Member?.gender === "M"
        ? (p2Member.lastName ?? null)
        : (p1Member.lastName ?? null);

    setSubmitting(true);
    try {
      const code = await getCodeForNewChild(p1);
      const newMember = await createFamilyMember({
        firstName: firstName.trim(),
        lastName: childLastName,
        gender: gender as "M" | "F",
        birthDate: birthDate ? birthDate.toLocaleDateString("fr-CA") : null,
        address: p1Member.address ?? null,
        latitude: p1Member.latitude ?? null,
        longitude: p1Member.longitude ?? null,
        mapboxPlaceId: p1Member.mapboxPlaceId ?? null,
        code,
      });
      await addFamilyRelation(p1, newMember.id);
      if (parent2Id && parent2Id !== "_none") {
        const p2 = parseInt(parent2Id, 10);
        if (!Number.isNaN(p2)) await addFamilyRelation(p2, newMember.id);
      }
      toast.success("Naissance enregistrée avec succès.");
      onOpenChange(false);
      resetForm();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l'ajout de l'enfant."
      );
    } finally {
      setSubmitting(false);
    }
  };

  function resetForm() {
    setParent1Id("");
    setParent2Id("_none");
    setFirstName("");
    setGender("");
    setBirthDate(undefined);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForm();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Annoncer une naissance</DialogTitle>
          <DialogDescription>
            Choisissez un ou deux parents et renseignez les informations de l'enfant. Le matricule sera généré automatiquement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Parent 1 *</Label>
            <Select
              value={parent1Id}
              onValueChange={(v) => {
                setParent1Id(v);
                const member = v ? familyTree.members.find((m) => m.id === parseInt(v, 10)) : null;
                const partnerId = member?.partner ? String(member.partner.id) : "_none";
                setParent2Id(partnerId);
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un parent" />
              </SelectTrigger>
              <SelectContent>
                {parent1Options.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    Aucun membre éligible (vivant, 16 ans ou plus)
                  </SelectItem>
                ) : (
                  parent1Options.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {memberLabel(member)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {parent1Options.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Seuls les membres vivants de 16 ans ou plus sont proposés.
              </p>
            )}
          </div>

          {parent1Id && (
            <div>
              <Label>Parent 2 (optionnel)</Label>
              <Select
                value={parent2Id}
                onValueChange={setParent2Id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucun ou sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Aucun</SelectItem>
                  {parent2Options.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {memberLabel(member)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="birth-firstName">Prénom de l'enfant *</Label>
            <Input
              id="birth-firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Prénom"
              required
            />
          </div>

          {parent1 && (
            <p className="text-xs text-muted-foreground">
              Nom de famille : {derivedLastName ?? "—"}
            </p>
          )}

          <div>
            <Label>Sexe *</Label>
            <Select value={gender} onValueChange={setGender} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Homme</SelectItem>
                <SelectItem value="F">Femme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Date de naissance</Label>
            <DatePicker
              value={birthDate}
              onChange={setBirthDate}
              contentClassName="z-[10000]"
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
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer la naissance"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
