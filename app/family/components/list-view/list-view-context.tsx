"use client";

import { createContext, useContext } from "react";

export type ListViewContextValue = {
  onViewOnMap: (memberId: number) => void;
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
