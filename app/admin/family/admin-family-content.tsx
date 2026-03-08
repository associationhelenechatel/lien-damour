"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EditPersonDialog } from "@/app/admin/family/edit-person-dialog";
import { NewEventDialog, type NewEventChoice } from "@/app/admin/family/new-event-dialog";
import { NewMarriageDialog } from "@/app/admin/family/new-marriage-dialog";
import { NewBirthDialog } from "@/app/admin/family/new-birth-dialog";
import { NewDeathDialog } from "@/app/admin/family/new-death-dialog";
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
  const [showMarriageDialog, setShowMarriageDialog] = useState(false);
  const [showBirthDialog, setShowBirthDialog] = useState(false);
  const [showDeathDialog, setShowDeathDialog] = useState(false);
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
        setShowBirthDialog(true);
        break;
      case "marriage":
        setShowMarriageDialog(true);
        break;
      case "death":
        setShowDeathDialog(true);
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

      <NewMarriageDialog
        open={showMarriageDialog}
        onOpenChange={setShowMarriageDialog}
        familyTree={familyTree}
      />

      <NewBirthDialog
        open={showBirthDialog}
        onOpenChange={setShowBirthDialog}
        familyTree={familyTree}
      />

      <NewDeathDialog
        open={showDeathDialog}
        onOpenChange={setShowDeathDialog}
        familyTree={familyTree}
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
