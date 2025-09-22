"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Heart, TreePine } from "lucide-react";
import type { FamilyTree } from "@/lib/types";

interface StatsCardsProps {
  familyTree: FamilyTree;
}

export function StatsCards({ familyTree }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="p-3 flex items-center justify-center gap-2">
          <Users className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="text-lg font-bold">
            {familyTree.stats.totalMembers}
          </div>
          <div className="text-md text-gray-600">Membres</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 flex items-center justify-center gap-2">
          <Heart className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="text-lg font-bold">
            {familyTree.stats.totalPartnerships}
          </div>
          <div className="text-md text-gray-600">Couples</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 flex items-center justify-center gap-2">
          <TreePine className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="text-lg font-bold">
            {familyTree.stats.generations}
          </div>
          <div className="text-md text-gray-600">Générations</div>
        </CardContent>
      </Card>
    </div>
  );
}
