import { getAllUsers } from "@/lib/api/clerk";
import { getFamilyMembers } from "@/lib/api/family";
import OnboardingForm from "./components/onboarding-form";

export default async function OnboardingPage() {
  const familyMembers = await getFamilyMembers();
  const users = await getAllUsers();

  const familyMemberIdsAlreadyRegistered = users
    .map((user) => user.publicMetadata?.familyMemberId as number)
    .filter((id) => !!id);

  const familyMembersNotAlreadyRegistered = familyMembers.filter(
    (member) => !familyMemberIdsAlreadyRegistered.includes(member.id)
  );

  return <OnboardingForm familyMembers={familyMembersNotAlreadyRegistered} />;
}
