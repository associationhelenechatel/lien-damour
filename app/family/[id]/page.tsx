import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getFamilyMember } from "@/lib/api/family";
import { MemberProfile } from "./member-profile";

export const dynamic = "force-dynamic";

const getMemberForPage = cache(async (id: number) => getFamilyMember(id));

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const num = parseInt(id, 10);
  if (!Number.isFinite(num) || num < 1) {
    return { title: "Membre introuvable" };
  }
  const member = await getMemberForPage(num);
  if (!member) {
    return { title: "Membre introuvable" };
  }
  return {
    title: `${member.displayName} — Annuaire`,
    description: `Fiche de ${member.fullName} dans l’annuaire familial.`,
  };
}

export default async function FamilyMemberPage({ params }: PageProps) {
  const { id } = await params;
  const num = parseInt(id, 10);
  if (!Number.isFinite(num) || num < 1) {
    notFound();
  }

  const member = await getMemberForPage(num);
  if (!member) {
    notFound();
  }

  return <MemberProfile member={member} />;
}
