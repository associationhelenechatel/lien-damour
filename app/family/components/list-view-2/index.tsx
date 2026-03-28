"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { FamilyMemberWithRelations, FamilyTree } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ListViewProps {
  familyTree: FamilyTree;
}

function normalizeForSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function getInitials(member: FamilyMemberWithRelations) {
  const a = member.firstName?.charAt(0)?.toUpperCase() ?? "?";
  const b = member.lastName?.charAt(0)?.toUpperCase() ?? "";
  return (a + b).slice(0, 2);
}

function DirectoryCard({ member }: { member: FamilyMemberWithRelations }) {
  const [imgFailed, setImgFailed] = useState(false);
  const pictureSrc = member.clerkProfileImageUrl?.trim() ?? "";
  const canLoadImage =
    Boolean(pictureSrc) &&
    !imgFailed &&
    (pictureSrc.startsWith("/") ||
      pictureSrc.startsWith("http://") ||
      pictureSrc.startsWith("https://"));

  const nameLine = [member.firstName, member.lastName].filter(Boolean).join(" ");

  return (
    <article
      className={cn(
        "group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm",
        "transition-shadow duration-200 hover:border-slate-300 hover:shadow-md hover:cursor-pointer"
      )}
    >
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100",
          "ring-1 ring-inset ring-slate-200/60"
        )}
      >
        {canLoadImage && pictureSrc.startsWith("/") ? (
          <Image
            src={pictureSrc}
            alt=""
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onError={() => setImgFailed(true)}
          />
        ) : canLoadImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- URLs externes sans domaine configuré dans next.config
          <img
            src={pictureSrc}
            alt=""
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-lg font-semibold tracking-wide text-slate-600"
            aria-hidden
          >
            {getInitials(member)}
          </div>
        )}
      </div>

      <div className="mt-3 min-h-0 text-center">
        <p className="truncate text-sm font-medium text-slate-900" title={nameLine}>
          {member.firstName}
        </p>
        {member.lastName ? (
          <p
            className="truncate text-xs text-slate-500"
            title={member.lastName}
          >
            {member.lastName}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function ListView2({ familyTree }: ListViewProps) {
  const [query, setQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const q = normalizeForSearch(query.trim());
    const sorted = [...familyTree.members].sort((a, b) =>
      a.fullName.localeCompare(b.fullName, "fr", { sensitivity: "base" })
    );
    if (!q) return sorted;
    return sorted.filter((m) => {
      const haystack = normalizeForSearch(
        [m.firstName, m.lastName, m.fullName].filter(Boolean).join(" ")
      );
      return haystack.includes(q);
    });
  }, [familyTree.members, query]);

  return (
    <div className="w-full pb-10">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-4 mt-16">
        <div className="relative w-full max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par prénom ou nom…"
            className="h-10 rounded-full border-slate-200 bg-white pl-9 shadow-sm pr-4"
            aria-label="Rechercher dans l’annuaire"
          />
        </div>

        {filteredMembers.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {query.trim()
              ? "Aucun membre ne correspond à votre recherche."
              : "Aucun membre dans l’annuaire."}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredMembers.map((member) => (
              <li key={member.id}>
                <DirectoryCard member={member} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
