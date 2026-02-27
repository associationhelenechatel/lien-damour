"use client";

import type { FamilyTree, FamilyMemberWithRelations } from "@/lib/types";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";
import { ListViewProvider } from "./list-view-context";

interface ListViewProps {
  familyTree: FamilyTree;
  variant?: "family" | "admin";
  onViewOnMap?: (memberId: number) => void;
  onEdit?: (member: FamilyMemberWithRelations) => void;
}

export function ListView({
  familyTree,
  variant = "family",
  onViewOnMap,
  onEdit,
}: ListViewProps) {
  return (
    <ListViewProvider
      value={{
        variant,
        onViewOnMap: onViewOnMap ?? (() => {}),
        onEdit,
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="container mx-auto py-4 flex-1 min-h-0 flex flex-col">
            <DataTable columns={columns} data={familyTree.members} />
          </div>
        </div>
      </div>
    </ListViewProvider>
  );
}
