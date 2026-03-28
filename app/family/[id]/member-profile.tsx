import type { FamilyMemberWithRelations } from "@/lib/types";
import { MemberProfileClient } from "./member-profile-client";

export function MemberProfile({
  member,
  isOwnProfile = false,
}: {
  member: FamilyMemberWithRelations;
  isOwnProfile?: boolean;
}) {
  return (
    <MemberProfileClient member={member} isOwnProfile={isOwnProfile} />
  );
}
