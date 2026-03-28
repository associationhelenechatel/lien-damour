import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Hash,
  Calendar,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FamilyMemberWithRelations } from "@/lib/types";
import { cn } from "@/lib/utils";

function memberInitials(member: FamilyMemberWithRelations) {
  const a = member.firstName?.charAt(0)?.toUpperCase() ?? "?";
  const b = member.lastName?.charAt(0)?.toUpperCase() ?? "";
  return (a + b).slice(0, 2);
}

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

function ProfileAvatar({ member }: { member: FamilyMemberWithRelations }) {
  const url = member.clerkProfileImageUrl?.trim() ?? "";
  const isLocal = url.startsWith("/");
  const isRemote =
    url.startsWith("http://") || url.startsWith("https://");

  if (url && isLocal) {
    return (
      <div className="relative mx-auto aspect-square w-40 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/80 sm:mx-0 sm:w-44">
        <Image
          src={url}
          alt=""
          fill
          className="object-cover"
          sizes="192px"
          priority
        />
      </div>
    );
  }

  if (url && isRemote) {
    return (
      <div className="relative mx-auto aspect-square w-40 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/80 sm:mx-0 sm:w-44">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto flex aspect-square w-40 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200",
        "text-3xl font-semibold tracking-wide text-slate-600 ring-1 ring-slate-200/80 sm:mx-0 sm:w-44 sm:text-4xl"
      )}
      aria-hidden
    >
      {memberInitials(member)}
    </div>
  );
}

type RelatedVariant = "partner" | "parent" | "child";

const relatedCardStyles: Record<
  RelatedVariant,
  {
    surface: string;
    ring: string;
  }
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
      <ChevronRight
        className="h-4 w-4 shrink-0 opacity-60"
        aria-hidden
      />
    </Link>
  );
}

function hasMapCoordinates(member: FamilyMemberWithRelations) {
  const lat = member.latitude != null ? String(member.latitude).trim() : "";
  const lng = member.longitude != null ? String(member.longitude).trim() : "";
  return lat !== "" && lng !== "";
}

export function MemberProfile({ member }: { member: FamilyMemberWithRelations }) {
  const birthLabel = formatDate(member.birthDate);
  const deathLabel = formatDate(member.deathDate);
  const canShowOnMap = hasMapCoordinates(member);

  return (
    <div className="min-h-[calc(100vh-3.5rem-1px)] w-full bg-white">
      <div className="container mx-auto max-w-2xl px-4 pt-4 pb-20 sm:pt-14">
        <Button variant="ghost" size="sm" className="mb-8 -ml-2 gap-2 text-muted-foreground" asChild>
          <Link href="/family">
            <ArrowLeft className="h-4 w-4" />
            Annuaire
          </Link>
        </Button>

        <header className="flex flex-col items-center gap-6 border-b border-slate-200/80 pb-10 sm:flex-row sm:items-start sm:gap-10">
          <ProfileAvatar member={member} />
          <div className="min-w-0 text-center sm:pt-1 sm:text-left">
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
        </header>

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
        </dl>

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
