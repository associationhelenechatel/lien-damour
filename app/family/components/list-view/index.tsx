"use client";

import { useUser } from "@clerk/nextjs";
import type { FamilyTree } from "@/lib/types";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";
import { payments } from "@/data/payment";

interface ListViewProps {
  familyTree: FamilyTree;
}

export function ListView({ familyTree }: ListViewProps) {
  const { user } = useUser();

  const currentFamilyMemberId = user?.publicMetadata?.familyMemberId as
    | number
    | undefined;

  const data = payments;

  return (
    <div className="space-y-6">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
