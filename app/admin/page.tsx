import { getCompleteFamilyTree } from "@/lib/family-tree-service";
import { AdminFamilyContent } from "@/app/admin/family/admin-family-content";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const familyTree = await getCompleteFamilyTree();

  return (
    <AdminFamilyContent familyTree={familyTree} />
  );
}
