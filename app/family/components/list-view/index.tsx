"use client";

import type { FamilyTree } from "@/lib/types";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";
import { ListViewProvider } from "./list-view-context";

interface ListViewProps {
  familyTree: FamilyTree;
  onViewOnMap?: (memberId: number) => void;
}

export function ListView({ familyTree, onViewOnMap }: ListViewProps) {
  return (
    <ListViewProvider
      value={{
        onViewOnMap: onViewOnMap ?? (() => {}),
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-4 space-y-6">
            <DataTable columns={columns} data={familyTree.members} />
          </div>
        </div>
      </div>
    </ListViewProvider>
  );
}
