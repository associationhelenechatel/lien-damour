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
import { Label } from "@/components/ui/label";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import type { FamilyTree, FamilyMemberWithRelations } from "@/lib/types";
import { updateFamilyMember } from "@/lib/api/family";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NewDeathDialogProps {
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

function memberLabel(member: {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string;
  displayName?: string;
  code?: string | null;
}) {
  const full =
    member.fullName ??
    ([member.firstName, member.lastName].filter(Boolean).join(" ").trim() ||
      member.displayName ||
      "Nom inconnu");
  return member.code ? `${full} (${member.code})` : full;
}

export function NewDeathDialog({
  open,
  onOpenChange,
  familyTree,
}: NewDeathDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [deathDate, setDeathDate] = useState<Date | undefined>(undefined);

  const livingMembers = useMemo(
    () =>
      membersSortedByCode(
        familyTree.members.filter((m) => !m.deathDate)
      ),
    [familyTree.members]
  );

  const livingMemberComboboxOptions = useMemo((): ComboboxOption[] => {
    return livingMembers.map((member) => ({
      value: String(member.id),
      label: memberLabel(member),
      keywords: [
        member.displayName,
        member.fullName,
        member.firstName ?? undefined,
        member.lastName ?? undefined,
        member.code ?? undefined,
      ].filter((s): s is string => Boolean(s && String(s).trim())),
    }));
  }, [livingMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !deathDate) {
      toast.error("Veuillez sélectionner un membre et une date de décès.");
      return;
    }
    const memberId = parseInt(selectedMemberId, 10);
    if (Number.isNaN(memberId)) {
      toast.error("Membre invalide.");
      return;
    }

    setSubmitting(true);
    try {
      await updateFamilyMember(memberId, {
        deathDate: deathDate.toLocaleDateString("fr-CA"),
      });
      toast.success("Décès enregistré.");
      onOpenChange(false);
      resetForm();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement du décès."
      );
    } finally {
      setSubmitting(false);
    }
  };

  function resetForm() {
    setSelectedMemberId("");
    setDeathDate(undefined);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForm();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Annoncer un décès</DialogTitle>
          <DialogDescription>
            Choisissez un membre et renseignez la date de décès.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="death-member">Membre *</Label>
            <Combobox
              id="death-member"
              options={livingMemberComboboxOptions}
              value={selectedMemberId || undefined}
              onValueChange={setSelectedMemberId}
              placeholder="Sélectionner un membre"
              searchPlaceholder="Rechercher par nom ou code…"
              emptyText="Aucun membre ne correspond."
              disabled={livingMembers.length === 0}
              contentClassName="z-[10001]"
            />
            {livingMembers.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Seuls les membres encore vivants sont proposés.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Date du décès *</Label>
            <DatePicker
              value={deathDate}
              onChange={setDeathDate}
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
              disabled={submitting || livingMembers.length === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer le décès"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
