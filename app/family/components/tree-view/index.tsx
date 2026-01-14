"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreePine } from "lucide-react";
import { D3FamilyTree } from "./d3-family-tree";
import type { FamilyTree } from "@/lib/types";

interface TreeViewProps {
  familyTree: FamilyTree;
}

export function TreeView({ familyTree }: TreeViewProps) {
  return <D3FamilyTree familyTree={familyTree} />;
}
