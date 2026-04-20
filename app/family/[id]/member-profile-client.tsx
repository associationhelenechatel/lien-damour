"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Hash,
  Calendar,
  ChevronRight,
  Pencil,
  Loader2,
  Briefcase,
  Building2,
  AlignLeft,
} from "lucide-react";
import { toast } from "sonner";

import { updateCurrentUserFamilyMember } from "@/lib/api/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { AddressSearchBox } from "@/components/address-search-box";
import { MemberProfileAvatarHoverUpload } from "@/components/member-profile-picture-upload";
import type { FamilyMemberWithRelations } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toDateOrUndefined(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function initFormFromMember(member: FamilyMemberWithRelations) {
  return {
    firstName: member.firstName ?? "",
    lastName: member.lastName ?? "",
    birthDate: toDateOrUndefined(member.birthDate),
    address: member.address ?? "",
    phone: member.phone ?? "",
    bio: member.bio ?? "",
    profession: member.profession ?? "",
    company: member.company ?? "",
    addressCoordinates:
      member.latitude != null && member.longitude != null
        ? { lat: Number(member.latitude), lng: Number(member.longitude) }
        : undefined,
    mapboxPlaceId: member.mapboxPlaceId ?? undefined,
  };
}

type RelatedVariant = "partner" | "parent" | "child";

const relatedCardStyles: Record<
  RelatedVariant,
  { surface: string; ring: string }
> = {
  partner: {
    surface:
      "border-amber-200/90 bg-amber-50 text-amber-950 hover:bg-amber-100/95 hover:border-amber-300",
    ring: "focus-visible:ring-amber-400/80",
  },
  parent: {
    surface:
      "border-sky-200/90 bg-sky-50 text-sky-950 hover:bg-sky-100/95 hover:border-sky-300",
    ring: "focus-visible:ring-sky-400/80",
  },
  child: {
    surface:
      "border-teal-200/90 bg-teal-50 text-teal-950 hover:bg-teal-100/95 hover:border-teal-300",
    ring: "focus-visible:ring-teal-400/80",
  },
};

function RelatedLink({
  id,
  label,
  variant,
}: {
  id: number;
  label: string;
  variant: RelatedVariant;
}) {
  const { surface, ring } = relatedCardStyles[variant];
  return (
    <Link
      href={`/family/${id}`}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        ring,
        surface
      )}
    >
      <span className="min-w-0 truncate">{label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
    </Link>
  );
}

function hasMapCoordinates(member: FamilyMemberWithRelations) {
  const lat = member.latitude != null ? String(member.latitude).trim() : "";
  const lng = member.longitude != null ? String(member.longitude).trim() : "";
  return lat !== "" && lng !== "";
}

export function MemberProfileClient({
  member,
  isOwnProfile,
}: {
  member: FamilyMemberWithRelations;
  isOwnProfile: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [addressCoordinates, setAddressCoordinates] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);
  const [mapboxPlaceId, setMapboxPlaceId] = useState<string | undefined>(
    undefined
  );
  const [bio, setBio] = useState("");
  const [profession, setProfession] = useState("");
  const [company, setCompany] = useState("");

  const applyMemberToForm = useCallback((m: FamilyMemberWithRelations) => {
    const f = initFormFromMember(m);
    setFirstName(f.firstName);
    setLastName(f.lastName);
    setBirthDate(f.birthDate);
    setAddress(f.address);
    setPhone(f.phone);
    setBio(f.bio);
    setProfession(f.profession);
    setCompany(f.company);
    setAddressCoordinates(f.addressCoordinates);
    setMapboxPlaceId(f.mapboxPlaceId);
  }, []);

  useEffect(() => {
    if (!editing) {
      applyMemberToForm(member);
    }
  }, [member, editing, applyMemberToForm]);

  const birthLabel = formatDate(member.birthDate);
  const deathLabel = formatDate(member.deathDate);
  const canShowOnMap = hasMapCoordinates(member);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const firstNameValid = firstName.trim() !== "";
  const birthDateValid = birthDate != null;
  const addressValid =
    address.trim() !== "" &&
    (addressCoordinates != null || mapboxPlaceId != null);
  const phoneValid = phone.trim() !== "";
  const formValid =
    firstNameValid && birthDateValid && addressValid && phoneValid;

  const snapshotFromServer = useMemo(
    () => ({
      firstName: (member.firstName ?? "").trim(),
      lastName: (member.lastName ?? "").trim(),
      birthDate: toDateOrUndefined(member.birthDate)?.toISOString() ?? "",
      address: (member.address ?? "").trim(),
      phone: (member.phone ?? "").trim(),
      bio: (member.bio ?? "").trim(),
      profession: (member.profession ?? "").trim(),
      company: (member.company ?? "").trim(),
    }),
    [member]
  );

  const snapshotForm = useMemo(
    () => ({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: birthDate?.toISOString() ?? "",
      address: address.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      profession: profession.trim(),
      company: company.trim(),
    }),
    [firstName, lastName, birthDate, address, phone, bio, profession, company]
  );

  const hasFormChanges =
    editing &&
    (snapshotForm.firstName !== snapshotFromServer.firstName ||
      snapshotForm.lastName !== snapshotFromServer.lastName ||
      snapshotForm.birthDate !== snapshotFromServer.birthDate ||
      snapshotForm.address !== snapshotFromServer.address ||
      snapshotForm.phone !== snapshotFromServer.phone ||
      snapshotForm.bio !== snapshotFromServer.bio ||
      snapshotForm.profession !== snapshotFromServer.profession ||
      snapshotForm.company !== snapshotFromServer.company);

  const saveEnabled = hasFormChanges && formValid && !saving;

  const startEditing = () => {
    applyMemberToForm(member);
    setEditing(true);
  };

  const cancelEditing = () => {
    applyMemberToForm(member);
    setEditing(false);
  };

  const handleSave = async () => {
    if (!saveEnabled) return;
    setSaving(true);
    try {
      await updateCurrentUserFamilyMember({
        firstName: firstName.trim(),
        lastName: lastName.trim() || null,
        birthDate: birthDate?.toLocaleDateString("fr-CA") ?? null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        profession: profession.trim() || null,
        company: company.trim() || null,
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
      setEditing(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l’enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem-1px)] w-full bg-white">
      <div className="container mx-auto max-w-2xl px-4 pb-20 sm:pt-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-8 -ml-2 gap-2 text-muted-foreground"
          asChild
        >
          <Link href="/family">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>

        <header className="flex flex-col items-center gap-6 border-b border-slate-200/80 pb-10 sm:flex-row sm:items-start sm:gap-10">
          <MemberProfileAvatarHoverUpload
            memberId={member.id}
            profileImageUrl={member.profileImageUrl}
            firstName={member.firstName}
            lastName={member.lastName}
            enableUpload={isOwnProfile}
            onUploaded={() => router.refresh()}
          />
          <div className="min-w-0 flex-1 text-center sm:pt-1 sm:text-left">
            <div className="flex flex-col items-center gap-4 sm:items-start">
              <div className="w-full sm:flex sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <h1 className="font-cera text-2xl font-semibold text-slate-900 sm:text-3xl">
                    {member.displayName}
                  </h1>
                  {member.code ? (
                    <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                      <Hash className="h-3.5 w-3.5 shrink-0" />
                      Matricule {member.code}
                    </p>
                  ) : null}
                </div>
                {isOwnProfile && !editing ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4 shrink-0 gap-2 border-emerald-200 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100 sm:mt-0"
                    onClick={startEditing}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Modifier
                  </Button>
                ) : null}
                {isOwnProfile && editing ? (
                  <div className="mt-4 flex shrink-0 flex-wrap justify-center gap-2 sm:mt-0 sm:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditing}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!saveEnabled}
                      className="gap-2 bg-emerald-700 text-white hover:bg-emerald-800"
                      onClick={handleSave}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Enregistrer
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        {isOwnProfile && editing ? (
          <div className="mt-10 space-y-6 border-b border-slate-200/80 pb-10 text-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Modifier mes informations
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-firstname">Prénom</Label>
                <Input
                  id="profile-firstname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-lastname">Nom</Label>
                <Input
                  id="profile-lastname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nom"
                />
              </div>
              <div className="space-y-2">
                <Label>Date de naissance</Label>
                <DatePicker
                  value={birthDate}
                  onChange={setBirthDate}
                  contentClassName="z-[10000]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-address">Adresse</Label>
                {mapboxToken ? (
                  <AddressSearchBox
                    accessToken={mapboxToken}
                    options={{ language: "fr", country: "FR" }}
                    value={address}
                    onRetrieve={(result) => {
                      if (result?.features && result.features.length > 0) {
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
                          setAddress(fullAddress);
                          setAddressCoordinates({ lat, lng });
                          setMapboxPlaceId(placeId);
                        }
                      }
                    }}
                  />
                ) : (
                  <Input
                    id="profile-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Adresse"
                    disabled
                  />
                )}
                {address.trim() !== "" &&
                  !addressCoordinates &&
                  !mapboxPlaceId && (
                    <p className="text-xs text-amber-600">
                      Sélectionnez une adresse dans la liste pour la valider.
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Téléphone</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                  className="max-w-[14rem]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-bio">Biographie</Label>
                <Textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Présentation, parcours…"
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-profession">Profession</Label>
                <Input
                  id="profile-profession"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="ex: Ingénieur"
                  autoComplete="organization-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-company">Entreprise</Label>
                <Input
                  id="profile-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Nom de l’entreprise"
                  autoComplete="organization"
                />
              </div>
            </div>
          </div>
        ) : (
          <dl className="mt-10 space-y-5 text-sm">
            {(birthLabel || deathLabel || member.age != null) && (
              <div className="flex gap-3">
                <dt className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Naissance
                </dt>
                <dd className="text-slate-800">
                  {birthLabel ?? "—"}
                  {member.isAlive
                    ? member.age != null
                      ? ` (${member.age} ans)`
                      : ""
                    : deathLabel
                      ? ` — Décès le ${deathLabel}`
                      : " — Décédé(e)"}
                </dd>
              </div>
            )}
            {member.mail ? (
              <div className="flex gap-3">
                <dt className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </dt>
                <dd>
                  <a
                    href={`mailto:${member.mail}`}
                    className="text-emerald-700 underline-offset-2 hover:underline"
                  >
                    {member.mail}
                  </a>
                </dd>
              </div>
            ) : null}
            {member.phone ? (
              <div className="flex gap-3">
                <dt className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </dt>
                <dd>
                  <a
                    href={`tel:${member.phone.replace(/\s/g, "")}`}
                    className="text-emerald-700 underline-offset-2 hover:underline"
                  >
                    {member.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            {member.address ? (
              <div className="flex gap-3">
                <dt className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Adresse
                </dt>
                <dd className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-4 sm:gap-y-2">
                    <span className="text-slate-800">{member.address}</span>
                    {canShowOnMap ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-fit shrink-0 gap-1.5 border-emerald-200 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/90 hover:text-emerald-950"
                        asChild
                      >
                        <Link href={`/family?map=${member.id}`}>
                          <MapPin className="h-3.5 w-3.5" />
                          Voir sur la carte
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </dd>
              </div>
            ) : null}
            {member.bio?.trim() ? (
              <div className="flex gap-3">
                <dt className="flex shrink-0 items-start gap-2 pt-0.5 text-muted-foreground">
                  <AlignLeft className="h-4 w-4" />
                  Biographie
                </dt>
                <dd className="whitespace-pre-wrap text-slate-800">
                  {member.bio.trim()}
                </dd>
              </div>
            ) : null}
            {member.profession?.trim() ? (
              <div className="flex gap-3">
                <dt className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  Profession
                </dt>
                <dd className="text-slate-800">{member.profession.trim()}</dd>
              </div>
            ) : null}
            {member.company?.trim() ? (
              <div className="flex gap-3">
                <dt className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Entreprise
                </dt>
                <dd className="text-slate-800">{member.company.trim()}</dd>
              </div>
            ) : null}
          </dl>
        )}

        {member.partner ? (
          <section className="mt-10 border-t border-slate-200/80 pt-10">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Partenaire
            </h2>
            <div className="mt-3">
              <RelatedLink
                variant="partner"
                id={member.partner.id}
                label={`${member.partner.firstName} ${member.partner.lastName ?? ""}`.trim()}
              />
            </div>
          </section>
        ) : null}

        {member.parents.length > 0 ? (
          <section className="mt-10 border-t border-slate-200/80 pt-10">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Parents
            </h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {member.parents.map((p) => (
                <li key={p.id}>
                  <RelatedLink
                    variant="parent"
                    id={p.id}
                    label={`${p.firstName} ${p.lastName ?? ""}`.trim()}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {member.children.length > 0 ? (
          <section className="mt-10 border-t border-slate-200/80 pt-10">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Enfants
            </h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {member.children.map((c) => (
                <li key={c.id}>
                  <RelatedLink
                    variant="child"
                    id={c.id}
                    label={`${c.firstName} ${c.lastName ?? ""}`.trim()}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
