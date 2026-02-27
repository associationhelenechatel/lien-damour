"use client";

import { createContext, useContext } from "react";

import type { FamilyMemberWithRelations } from "@/lib/types";

export type ListViewContextValue = {
  variant: "family" | "admin";
  onViewOnMap: (memberId: number) => void;
  onEdit?: (member: FamilyMemberWithRelations) => void;
};

const ListViewContext = createContext<ListViewContextValue | null>(null);

export function ListViewProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ListViewContextValue;
}) {
  return (
    <ListViewContext.Provider value={value}>
      {children}
    </ListViewContext.Provider>
  );
}

export function useListViewContext() {
  return useContext(ListViewContext);
}
