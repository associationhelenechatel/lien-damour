"use client";

import { useMemo } from "react";
import type { FamilyTree } from "@/lib/types";
import { DataTable } from "./table/data-table";
import { columns, type FamilyMemberTableData } from "./table/columns";

interface ListViewProps {
  familyTree: FamilyTree;
}

function toTableData(members: FamilyTree["members"]): FamilyMemberTableData[] {
  return members.map((member) => ({
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName ?? null,
    maidenName: member.maidenName ?? null,
    fullName: member.fullName,
    mail: member.mail ?? null,
    phone: member.phone ?? null,
    birthDate: member.birthDate ?? null,
    address: member.address ?? null,
  }));
}

export function ListView({ familyTree }: ListViewProps) {
  const data = useMemo(
    () => toTableData(familyTree.members),
    [familyTree.members]
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-4 space-y-6">
          <DataTable columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
}
