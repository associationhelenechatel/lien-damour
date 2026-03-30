"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { EditPersonDialog } from "@/app/admin/family/edit-person-dialog";
import { NewEventDialog, type NewEventChoice } from "@/app/admin/family/new-event-dialog";
import { NewMarriageDialog } from "@/app/admin/family/new-marriage-dialog";
import { NewBirthDialog } from "@/app/admin/family/new-birth-dialog";
import { NewDeathDialog } from "@/app/admin/family/new-death-dialog";
import type {
  FamilyMemberWithRelations,
  FamilyTree,
  NewFamilyMember,
} from "@/lib/types";
import { updateFamilyMember } from "@/lib/api/family";
import { DataTable } from "@/app/admin/family/table/data-table";
import { getAdminColumns } from "@/app/admin/family/admin-table-columns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function memberUpdatePayload(
  person: FamilyMemberWithRelations
): Partial<NewFamilyMember> {
  return {
    firstName: person.firstName?.trim() || "",
    lastName: person.lastName?.trim() || null,
    maidenName: person.maidenName?.trim() || null,
    gender: person.gender ?? null,
    birthDate: person.birthDate ?? null,
    deathDate: person.deathDate ?? null,
    address: person.address?.trim() || null,
    latitude: person.latitude ?? null,
    longitude: person.longitude ?? null,
    mapboxPlaceId: person.mapboxPlaceId ?? null,
    phone: person.phone?.trim() || null,
    mail: person.mail?.trim() || null,
  };
}

interface AdminFamilyContentProps {
  familyTree: FamilyTree;
}

export function AdminFamilyContent({
  familyTree,
}: AdminFamilyContentProps) {
  const router = useRouter();
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

  const handleEditPerson = async (person: FamilyMemberWithRelations) => {
    const first = person.firstName?.trim();
    if (!first) {
      toast.error("Le prénom est obligatoire.");
      throw new Error("Validation");
    }

    try {
      await updateFamilyMember(person.id, memberUpdatePayload(person));
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement."
      );
      throw err;
    }

    toast.success("Membre mis à jour.");
    setShowEditDialog(false);
    setSelectedPerson(null);
    router.refresh();
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
