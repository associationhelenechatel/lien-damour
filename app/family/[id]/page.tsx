import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";

import { isCurrentUserAdmin } from "@/lib/api/admin";
import { getFamilyMember } from "@/lib/api/family";
import { getMemberDocuments } from "@/lib/api/member-documents";
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

  const { sessionClaims } = await auth();
  const linkedMemberId = sessionClaims?.metadata?.familyMemberId as
    | number
    | undefined;
  const isOwnProfile =
    linkedMemberId != null && Number(linkedMemberId) === num;

  const [isAdmin, documents] = await Promise.all([
    isCurrentUserAdmin(),
    getMemberDocuments(num),
  ]);
  const canManageDocuments = isOwnProfile || isAdmin;

  return (
    <MemberProfile
      member={member}
      isOwnProfile={isOwnProfile}
      documents={documents}
      canManageDocuments={canManageDocuments}
    />
  );
}
