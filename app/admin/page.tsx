import { auth } from "@clerk/nextjs/server";
import { getCompleteFamilyTree } from "@/lib/family-tree-service";
import { AdminFamilyContent } from "@/app/admin/family/admin-family-content";

export default async function AdminPage() {
  const familyTree = await getCompleteFamilyTree();

  return (
    <AdminFamilyContent familyTree={familyTree} />
  );
}
