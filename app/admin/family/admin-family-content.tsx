"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EditPersonDialog } from "@/app/admin/family/edit-person-dialog";
import { NewEventDialog, type NewEventChoice } from "@/app/admin/family/new-event-dialog";
import type { FamilyMemberWithRelations, FamilyTree } from "@/lib/types";
import { DataTable } from "@/app/family/components/list-view/table/data-table";
import { getAdminColumns } from "@/app/admin/family/admin-table-columns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AdminFamilyContentProps {
  familyTree: FamilyTree;
}

export function AdminFamilyContent({
  familyTree,
}: AdminFamilyContentProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
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

  const handleNewEventChoice = (choice: NewEventChoice) => {
    switch (choice) {
      case "birth":
        toast.info("Formulaire naissance à venir.");
        break;
      case "marriage":
        toast.info("Formulaire mariage/union à venir.");
        break;
      case "death":
        toast.info("Formulaire décès à venir.");
        break;
    }
  };

  const columns = getAdminColumns(handleEdit);

  return (
    <>
      <DataTable columns={columns} data={familyTree.members}>
        <Button
          onClick={() => setShowNewEventDialog(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel événement
        </Button>
      </DataTable>

      <NewEventDialog
        open={showNewEventDialog}
        onOpenChange={setShowNewEventDialog}
        onChoice={handleNewEventChoice}
      />

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
