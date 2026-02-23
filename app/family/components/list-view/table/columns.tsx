"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CopyIcon, MapPin, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FamilyMemberWithRelations } from "@/lib/types";
import { useListViewContext } from "../list-view-context";

export const columns: ColumnDef<FamilyMemberWithRelations>[] = [
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
      const { onViewOnMap } = useListViewContext() ?? {};
      const hasCoordinates =
        member.latitude != null &&
        member.longitude != null &&
        String(member.latitude).trim() !== "" &&
        String(member.longitude).trim() !== "";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={!member.mail}
              onClick={() => navigator.clipboard.writeText(String(member.mail))}
            >
              <CopyIcon className="h-4 w-4 mr-2" />
              Copier le mail
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!hasCoordinates}
              onClick={() => onViewOnMap?.(member.id)}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Voir sur la carte
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
