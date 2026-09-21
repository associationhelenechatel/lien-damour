import type { FamilyMemberDocumentWithUrl, FamilyMemberWithRelations } from "@/lib/types";
import { MemberProfileClient } from "./member-profile-client";

export function MemberProfile({
  member,
  isOwnProfile = false,
  documents = [],
  canManageDocuments = false,
}: {
  member: FamilyMemberWithRelations;
  isOwnProfile?: boolean;
  documents?: FamilyMemberDocumentWithUrl[];
  canManageDocuments?: boolean;
}) {
  return (
    <MemberProfileClient
      member={member}
      isOwnProfile={isOwnProfile}
      documents={documents}
      canManageDocuments={canManageDocuments}
    />
  );
}
