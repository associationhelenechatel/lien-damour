"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FamilyMemberWithRelations } from "@/lib/types";

export function getAdminColumns(
  onEdit: (member: FamilyMemberWithRelations) => void
): ColumnDef<FamilyMemberWithRelations>[] {
  return [
  {
    accessorKey: "fullName",
    header: "Nom",
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="font-medium whitespace-nowrap">{member.fullName}</div>
      );
    },
  },
  {
    accessorKey: "mail",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
    cell: ({ row }) => {
      const value = row.getValue("phone") as string | null;
      return <div className="whitespace-nowrap">{value ?? "-"}</div>;
    },
  },
  {
    accessorKey: "birthDate",
    header: "Né(e) le",
    cell: ({ row }) => {
      const date = row.getValue("birthDate") as string | null;
      if (!date) return <div className="text-muted-foreground whitespace-nowrap">-</div>;
      return (
        <div className="whitespace-nowrap">
          {new Date(date).toLocaleDateString("fr-FR")}
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Adresse",
    cell: ({ row }) => {
      const address = row.getValue("address") as string | null;
      return <div>{address || "-"}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original;
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => onEdit(member)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      );
    },
  },
  ];
}
