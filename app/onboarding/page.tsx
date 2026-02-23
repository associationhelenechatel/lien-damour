import { getAllUsers } from "@/lib/api/clerk";
import OnboardingForm from "./components/onboarding-form";
import { getCompleteFamilyTree } from "@/lib/family-tree-service";

export default async function OnboardingPage() {
  const familyTree = await getCompleteFamilyTree();
  const users = await getAllUsers();

  const familyMemberIdsAlreadyRegistered = users
    .map((user) => user.publicMetadata?.familyMemberId as number)
    .filter((id) => !!id);

  const familyMembersNotAlreadyRegistered = familyTree.members.filter(
    (member) => !familyMemberIdsAlreadyRegistered.includes(member.id)
  );

  return <OnboardingForm familyMembers={familyMembersNotAlreadyRegistered} />;
}
