"use client";

import { D3FamilyTree } from "./d3-family-tree";
import type { FamilyTree } from "@/lib/types";

interface TreeViewProps {
  familyTree: FamilyTree;
}

export function TreeView({ familyTree }: TreeViewProps) {
  return <D3FamilyTree familyTree={familyTree} />;
}
