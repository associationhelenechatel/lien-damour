"use client";

import { useEffect, useState, useMemo } from "react";
import {
  getCurrentUserFamilyMember,
  updateCurrentUserFamilyMember,
} from "@/lib/api/family";
import type { FamilyMember } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AddressSearchBox } from "@/components/address-search-box";

function toDateOrUndefined(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function initFormState(m: FamilyMember | null) {
  if (!m) {
    return {
      firstName: "",
      lastName: "",
      birthDate: undefined as Date | undefined,
      address: "",
      phone: "",
      addressCoordinates: undefined as { lat: number; lng: number } | undefined,
      mapboxPlaceId: undefined as string | undefined,
    };
  }
  return {
    firstName: m.firstName ?? "",
    lastName: m.lastName ?? "",
    birthDate: toDateOrUndefined(m.birthDate),
    address: m.address ?? "",
    phone: m.phone ?? "",
    addressCoordinates:
      m.latitude != null && m.longitude != null
        ? { lat: Number(m.latitude), lng: Number(m.longitude) }
        : undefined,
    mapboxPlaceId: m.mapboxPlaceId ?? undefined,
  };
}

let cachedMember: FamilyMember | null = null;

export function PersonalInfosTab() {
  const [member, setMember] = useState<FamilyMember | null>(() => cachedMember);
  const [loading, setLoading] = useState(() => !cachedMember);
  const [saving, setSaving] = useState(false);

  const formState = initFormState(cachedMember);
  const [firstName, setFirstName] = useState(() => formState.firstName);
  const [lastName, setLastName] = useState(() => formState.lastName);
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    () => formState.birthDate
  );
  const [address, setAddress] = useState(() => formState.address);
  const [phone, setPhone] = useState(() => formState.phone);
  const [addressCoordinates, setAddressCoordinates] = useState<
    { lat: number; lng: number } | undefined
  >(() => formState.addressCoordinates);
  const [mapboxPlaceId, setMapboxPlaceId] = useState<string | undefined>(
    () => formState.mapboxPlaceId
  );

  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<{
    firstName: string;
    lastName: string;
    birthDate: string;
    address: string;
    phone: string;
  } | null>(null);

  useEffect(() => {
    getCurrentUserFamilyMember()
      .then((m) => {
        cachedMember = m;
        setMember(m);
        setLastSavedSnapshot(null);
        if (m) {
          const next = initFormState(m);
          setFirstName(next.firstName);
          setLastName(next.lastName);
          setBirthDate(next.birthDate);
          setAddress(next.address);
          setPhone(next.phone);
          setAddressCoordinates(next.addressCoordinates);
          setMapboxPlaceId(next.mapboxPlaceId);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const initialSnapshot = useMemo(() => {
    if (!member) return null;
    const bd = toDateOrUndefined(member.birthDate);
    return {
      firstName: (member.firstName ?? "").trim(),
      lastName: (member.lastName ?? "").trim(),
      birthDate: bd?.toISOString() ?? "",
      address: (member.address ?? "").trim(),
      phone: (member.phone ?? "").trim(),
    };
  }, [member]);

  const currentSnapshot = useMemo(
    () => ({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: birthDate?.toISOString() ?? "",
      address: address.trim(),
      phone: phone.trim(),
    }),
    [firstName, lastName, birthDate, address, phone]
  );

  const baseSnapshot = lastSavedSnapshot ?? initialSnapshot;
  const hasChanged =
    baseSnapshot != null &&
    (currentSnapshot.firstName !== baseSnapshot.firstName ||
      currentSnapshot.lastName !== baseSnapshot.lastName ||
      currentSnapshot.birthDate !== baseSnapshot.birthDate ||
      currentSnapshot.address !== baseSnapshot.address ||
      currentSnapshot.phone !== baseSnapshot.phone);

  const firstNameValid = firstName.trim() !== "";
  const birthDateValid = birthDate != null;
  const addressValid =
    address.trim() !== "" && (addressCoordinates != null || mapboxPlaceId != null);
  const phoneValid = phone.trim() !== "";

  const allValid = firstNameValid && birthDateValid && addressValid && phoneValid;
  const saveEnabled = hasChanged && allValid && !saving;

  const handleSave = async () => {
    if (!member || !saveEnabled) return;
    setSaving(true);
    try {
      await updateCurrentUserFamilyMember({
        firstName: firstName.trim(),
        lastName: lastName.trim() || null,
        birthDate: birthDate?.toLocaleDateString("fr-CA") ?? null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        latitude:
          addressCoordinates?.lat != null
            ? String(addressCoordinates.lat)
            : undefined,
        longitude:
          addressCoordinates?.lng != null
            ? String(addressCoordinates.lng)
            : undefined,
        mapboxPlaceId: mapboxPlaceId ?? null,
      });
      toast.success("Modifications enregistrées.");
      setLastSavedSnapshot(currentSnapshot);
      if (member) {
        cachedMember = {
          ...member,
          firstName: firstName.trim(),
          lastName: lastName.trim() || null,
          birthDate: birthDate?.toLocaleDateString("fr-CA") ?? null,
          address: address.trim() || null,
          phone: phone.trim() || null,
          latitude:
            addressCoordinates?.lat != null
              ? String(addressCoordinates.lat)
              : null,
          longitude:
            addressCoordinates?.lng != null
              ? String(addressCoordinates.lng)
              : null,
          mapboxPlaceId: mapboxPlaceId ?? null,
        };
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="text-muted-foreground">Chargement…</div>;
  if (!member)
    return <div className="text-muted-foreground">Aucun profil lié.</div>;

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div className="w-full">
      <h2 className="text-[17px] font-bold text-slate-900">
        Infos personnelles
      </h2>

      <section className="border-t border-slate-200 pt-4 mt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personal-firstname" className="flex items-center gap-2 text-xs font-medium text-black">
              Prénom
            </Label>
            <Input
              id="personal-firstname"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Prénom"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="personal-lastname" className="flex items-center gap-2 text-xs font-medium text-black">
              Nom
            </Label>
            <Input
              id="personal-lastname"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nom"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="personal-birthdate" className="flex items-center gap-2 text-xs font-medium text-black">
              Date de naissance
            </Label>
            <DatePicker
              value={birthDate}
              onChange={setBirthDate}
              contentClassName="z-[10000]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal-address" className="flex items-center gap-2 text-xs font-medium text-black">
              Adresse
            </Label>
            {mapboxToken ? (
              <AddressSearchBox
                accessToken={mapboxToken}
                options={{ language: "fr", country: "FR" }}
                value={address}
                onRetrieve={(result) => {
                  if (
                    result?.features &&
                    result.features.length > 0
                  ) {
                    const feature = result.features[0];
                    if (feature) {
                      const props = feature.properties as unknown as Record<string, unknown>;
                      const fullAddress =
                        (props?.full_address as string) ||
                        (props?.name as string) ||
                        "";
                      const [lng, lat] = feature.geometry
                        .coordinates as [number, number];
                      const placeId = (props?.mapbox_id as string) ??
                        feature.id?.toString() ??
                        undefined;
                      setAddress(fullAddress);
                      setAddressCoordinates({ lat, lng });
                      setMapboxPlaceId(placeId);
                    }
                  }
                }}
              />
            ) : (
              <Input
                id="personal-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Adresse"
                disabled
              />
            )}
            {address.trim() !== "" && !addressCoordinates && !mapboxPlaceId && (
              <p className="text-xs text-amber-600">
                Sélectionnez une adresse dans la liste pour la valider.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal-phone" className="flex items-center gap-2 text-xs font-medium text-black">
              Téléphone
            </Label>
            <Input
              id="personal-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 1 23 45 67 89"
              className="max-w-[12rem]"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-6 mt-6">
        <Button
          type="button"
          onClick={handleSave}
          disabled={!saveEnabled}
          className="bg-black text-white hover:bg-black/90 hover:text-white"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Enregistrer"
          )}
        </Button>
      </section>
    </div>
  );
}
