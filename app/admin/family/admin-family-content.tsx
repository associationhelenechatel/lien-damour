"use client";

import { useState } from "react";
import { AddPersonDialog } from "@/app/admin/family/add-person-dialog";
import { EditPersonDialog } from "@/app/admin/family/edit-person-dialog";
import type { FamilyMemberWithRelations, FamilyTree } from "@/lib/types";
import { DataTable } from "@/app/family/components/list-view/table/data-table";
import { getAdminColumns } from "@/app/admin/family/admin-table-columns";

interface AdminFamilyContentProps {
  familyTree: FamilyTree;
}

export function AdminFamilyContent({
  familyTree,
}: AdminFamilyContentProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPerson, setSelectedPerson] =
    useState<FamilyMemberWithRelations | null>(null);

  const handleEdit = (member: FamilyMemberWithRelations) => {
    setSelectedPerson(member);
    setShowEditDialog(true);
  };

  const handleEditPerson = (person: FamilyMemberWithRelations) => {
    console.log("Edit person", person);
    setShowEditDialog(false);
    setSelectedPerson(null);
  };

  const columns = getAdminColumns(handleEdit);

  return (
    <>
      <DataTable columns={columns} data={familyTree.members} />

      {selectedPerson && (
        <EditPersonDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          person={selectedPerson}
          onEditPerson={handleEditPerson}
        />
      )}
    </>
  );
}
