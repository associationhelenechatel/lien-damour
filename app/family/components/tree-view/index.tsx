"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreePine } from "lucide-react";
import { D3FamilyTree } from "./d3-family-tree";
import type { FamilyTree } from "@/lib/types";

interface TreeViewProps {
  familyTree: FamilyTree;
}

export function TreeView({ familyTree }: TreeViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TreePine className="h-5 w-5" />
          Arbre Généalogique Interactif
        </CardTitle>
        <div className="text-sm text-gray-600">
          {familyTree.stats.totalMembers} membres •{" "}
          {familyTree.stats.generations} générations
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <D3FamilyTree familyTree={familyTree} />
      </CardContent>
    </Card>
  );
}
