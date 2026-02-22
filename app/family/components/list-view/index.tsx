"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import type { FamilyTree } from "@/lib/types";
import { DataTable } from "./table/data-table";
import { columns, type FamilyMemberTableData } from "./table/columns";

interface ListViewProps {
  familyTree: FamilyTree;
}

export function ListView({ familyTree }: ListViewProps) {
  const { user } = useUser();
  const [data, setData] = useState<FamilyMemberTableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentFamilyMemberId = user?.publicMetadata?.familyMemberId as
    | number
    | undefined;

  useEffect(() => {
    async function fetchFamilyMembers() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/family-members");
        if (!response.ok) {
          throw new Error("Failed to fetch family members");
        }
        const members = await response.json();
        // Transform the API response to match the table data type
        const tableData: FamilyMemberTableData[] = members.map((member: any) => {
          return {
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName || null,
            maidenName: member.maidenName || null,
            fullName: `${member.firstName} ${member.lastName}`,
            mail: member.mail || null,
            phone: member.phone || null,
            birthDate: member.birthDate || null,
            address: member.address || null,
          };
        });
        setData(tableData);
      } catch (error) {
        console.error("Error fetching family members:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFamilyMembers();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">Chargement des membres...</p>
      </div>
    );
  }

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
