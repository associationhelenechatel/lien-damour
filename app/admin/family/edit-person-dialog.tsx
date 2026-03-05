"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { DatePicker } from "@/components/ui/date-picker";
import type { FamilyMemberWithRelations } from "@/lib/types";
import { AddressSearchBox } from "@/components/address-search-box";

function toDateOrUndefined(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

interface EditPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: FamilyMemberWithRelations;
  onEditPerson: (person: FamilyMemberWithRelations) => void;
}

export function EditPersonDialog({
  open,
  onOpenChange,
  person,
  onEditPerson,
}: EditPersonDialogProps) {
  const [formData, setFormData] = useState<FamilyMemberWithRelations>(person);
  const [isDeceased, setIsDeceased] = useState(!!person.deathDate);

  useEffect(() => {
    setFormData(person);
    setIsDeceased(!!person.deathDate);
  }, [person]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const birthDateValue = toDateOrUndefined(formData.birthDate);
  const deathDateValue = toDateOrUndefined(formData.deathDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedPerson: FamilyMemberWithRelations = {
      ...formData,
      deathDate: isDeceased ? formData.deathDate : null,
    };

    onEditPerson(updatedPerson);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier {person.displayName}</DialogTitle>
          <DialogDescription>
            Modifiez les informations de ce membre de la famille.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Prénom"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Nom"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maidenName">Nom de naissance</Label>
              <Input
                id="maidenName"
                value={formData.maidenName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, maidenName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date de naissance</Label>
              <DatePicker
                value={birthDateValue}
                onChange={(date) =>
                  setFormData({
                    ...formData,
                    birthDate: date
                      ? date.toLocaleDateString("fr-CA")
                      : null,
                  })
                }
                contentClassName="z-[10000]"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="deceased"
                  checked={isDeceased}
                  onCheckedChange={(checked) => setIsDeceased(checked === true)}
                />
                <Label htmlFor="deceased">Décédé(e)</Label>
              </div>
              {isDeceased && (
                <DatePicker
                  value={deathDateValue}
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      deathDate: date
                        ? date.toLocaleDateString("fr-CA")
                        : null,
                    })
                  }
                  contentClassName="z-[10000]"
                />
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Adresse</Label>
            {mapboxToken ? (
              <>
                <AddressSearchBox
                  accessToken={mapboxToken}
                  options={{ language: "fr", country: "FR" }}
                  value={formData.address || ""}
                  onRetrieve={(result) => {
                    if (
                      result?.features &&
                      result.features.length > 0
                    ) {
                      const feature = result.features[0];
                      if (feature) {
                        const props = feature.properties as unknown as Record<
                          string,
                          unknown
                        >;
                        const fullAddress =
                          (props?.full_address as string) ||
                          (props?.name as string) ||
                          "";
                        const [lng, lat] = feature.geometry
                          .coordinates as [number, number];
                        const placeId =
                          (props?.mapbox_id as string) ??
                          feature.id?.toString() ??
                          undefined;
                        setFormData({
                          ...formData,
                          address: fullAddress,
                          latitude: String(lat),
                          longitude: String(lng),
                          mapboxPlaceId: placeId ?? null,
                        });
                      }
                    }
                  }}
                />
              </>
            ) : (
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Adresse complète"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Numéro de téléphone"
              />
            </div>

            <div>
              <Label htmlFor="mail">Email</Label>
              <Input
                id="mail"
                type="email"
                value={formData.mail || ""}
                onChange={(e) =>
                  setFormData({ ...formData, mail: e.target.value })
                }
                placeholder="Adresse email"
              />
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
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Sauvegarder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
