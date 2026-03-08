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
import { Checkbox } from "@/components/ui/checkbox";
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
  getCodeForNewSpouse,
  createFamilyMember,
  addPartnership,
} from "@/lib/api/family";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AddressSearchBox } from "@/components/address-search-box";

interface NewMarriageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyTree: FamilyTree;
}

/** Membres sans conjoint, triés par code (ordre logique de l'arbre). */
function membersEligibleForSpouse(members: FamilyMemberWithRelations[]) {
  return members
    .filter((m) => !m.partner)
    .sort((a, b) => {
      const ca = a.code ?? "";
      const cb = b.code ?? "";
      return ca.localeCompare(cb, undefined, { numeric: true });
    });
}

export function NewMarriageDialog({
  open,
  onOpenChange,
  familyTree,
}: NewMarriageDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<string>("");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [isDeceased, setIsDeceased] = useState(false);
  const [deathDate, setDeathDate] = useState<Date | undefined>(undefined);
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);
  const [mapboxPlaceId, setMapboxPlaceId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [mail, setMail] = useState("");
  const [marriageDate, setMarriageDate] = useState<Date | undefined>(undefined);

  const eligibleMembers = useMemo(
    () => membersEligibleForSpouse(familyTree.members),
    [familyTree.members]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !firstName.trim()) {
      toast.error("Veuillez sélectionner un membre et saisir au moins le prénom du conjoint.");
      return;
    }
    if (!gender) {
      toast.error("Veuillez sélectionner le sexe du conjoint.");
      return;
    }

    const memberId = parseInt(selectedMemberId, 10);
    if (Number.isNaN(memberId)) {
      toast.error("Membre invalide.");
      return;
    }

    setSubmitting(true);
    try {
      const code = await getCodeForNewSpouse(memberId);
      const newMember = await createFamilyMember({
        firstName: firstName.trim(),
        lastName: lastName.trim() || null,
        gender: gender as "M" | "F",
        birthDate: birthDate ? birthDate.toLocaleDateString("fr-CA") : null,
        deathDate: isDeceased && deathDate ? deathDate.toLocaleDateString("fr-CA") : null,
        address: address.trim() || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        mapboxPlaceId,
        phone: phone.trim() || null,
        mail: mail.trim() || null,
        code,
      });
      await addPartnership(
        memberId,
        newMember.id,
        marriageDate ? marriageDate.toLocaleDateString("fr-CA") : undefined
      );
      toast.success("Conjoint ajouté avec succès.");
      onOpenChange(false);
      resetForm();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l'ajout du conjoint."
      );
    } finally {
      setSubmitting(false);
    }
  };

  function resetForm() {
    setSelectedMemberId("");
    setFirstName("");
    setLastName("");
    setGender("");
    setBirthDate(undefined);
    setIsDeceased(false);
    setDeathDate(undefined);
    setAddress("");
    setLatitude(null);
    setLongitude(null);
    setMapboxPlaceId(null);
    setPhone("");
    setMail("");
    setMarriageDate(undefined);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau conjoint</DialogTitle>
          <DialogDescription>
            Choisissez un membre existant et renseignez les informations du conjoint. Le matricule sera généré automatiquement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Membre auquel rattacher le conjoint *</Label>
            <Select
              value={selectedMemberId}
              onValueChange={setSelectedMemberId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un membre" />
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    Aucun membre sans conjoint
                  </SelectItem>
                ) : (
                  eligibleMembers.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.displayName}
                      {member.code ? ` (${member.code})` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {eligibleMembers.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Seuls les membres sans conjoint sont proposés.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="spouse-firstName">Prénom *</Label>
              <Input
                id="spouse-firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
                required
              />
            </div>
            <div>
              <Label htmlFor="spouse-lastName">Nom</Label>
              <Input
                id="spouse-lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
              />
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date de naissance</Label>
              <DatePicker
                value={birthDate}
                onChange={setBirthDate}
                contentClassName="z-[10000]"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="spouse-deceased"
                  checked={isDeceased}
                  onCheckedChange={(checked) => setIsDeceased(checked === true)}
                />
                <Label htmlFor="spouse-deceased">Décédé(e)</Label>
              </div>
              {isDeceased && (
                <DatePicker
                  value={deathDate}
                  onChange={setDeathDate}
                  contentClassName="z-[10000]"
                />
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="spouse-address">Adresse</Label>
            {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
              <AddressSearchBox
                accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                options={{ language: "fr", country: "FR" }}
                value={address}
                onRetrieve={(result) => {
                  if (result?.features && result.features.length > 0) {
                    const feature = result.features[0];
                    if (feature) {
                      const props = feature.properties as unknown as Record<string, unknown>;
                      const fullAddress =
                        (props?.full_address as string) || (props?.name as string) || "";
                      const [lng, lat] = feature.geometry.coordinates as [number, number];
                      const placeId =
                        (props?.mapbox_id as string) ?? feature.id?.toString() ?? undefined;
                      setAddress(fullAddress);
                      setLatitude(String(lat));
                      setLongitude(String(lng));
                      setMapboxPlaceId(placeId ?? null);
                    }
                  }
                }}
              />
            ) : (
              <Input
                id="spouse-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Adresse complète"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="spouse-phone">Téléphone</Label>
              <Input
                id="spouse-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Numéro de téléphone"
              />
            </div>
            <div>
              <Label htmlFor="spouse-mail">Email</Label>
              <Input
                id="spouse-mail"
                type="email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder="Adresse email"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Date de l'union</Label>
            <DatePicker
              value={marriageDate}
              onChange={setMarriageDate}
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
                "Ajouter le conjoint"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
