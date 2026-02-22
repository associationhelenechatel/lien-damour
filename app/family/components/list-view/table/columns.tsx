"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Type for family member data in the table
export type FamilyMemberTableData = {
  id: number;
  firstName: string;
  lastName: string | null;
  maidenName: string | null;
  fullName: string; // Calculated field for filtering and sorting
  mail: string | null;
  phone: string | null;
  birthDate: string | null;
  address: string | null;
};

export const columns: ColumnDef<FamilyMemberTableData>[] = [
  {
    accessorKey: "fullName",
    header: "Nom",
    cell: ({ row }) => {
      const member = row.original;
      return <div className="font-medium">{member.fullName}</div>;
    },
    size: 200
  },
  {
    accessorKey: "mail",
    header: "Email",
    size: 200,
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
    size: 120,
  },
  {
    accessorKey: "birthDate",
    header: "Date de naissance",
    cell: ({ row }) => {
      const date = row.getValue("birthDate") as string | null;
      if (!date) return <div className="text-muted-foreground">-</div>;
      return new Date(date).toLocaleDateString("fr-FR");
    },
    size: 120,
  },
  {
    accessorKey: "address",
    header: "Adresse",
    cell: ({ row }) => {
      const address = row.getValue("address") as string | null;
      return <div className="max-w-[400px] truncate">{address || "-"}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(String(member.id))}
            >
              Copier l'ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Voir les détails</DropdownMenuItem>
            <DropdownMenuItem>Modifier</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 20,
  },
];
