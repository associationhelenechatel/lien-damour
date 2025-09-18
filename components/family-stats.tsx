"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar } from "lucide-react";

interface Person {
  id: string;
  name: string;
  birthYear: number;
  deathYear?: number;
  generation: number;
  parents: string[];
  children: string[];
  spouse?: string;
  occupation?: string;
  location: string;
}

interface FamilyStatsProps {
  familyData: Person[];
}

export function FamilyStats({ familyData }: FamilyStatsProps) {
  const totalMembers = familyData.length;
  const generations = Math.max(...familyData.map((p) => p.generation));
  const couples = familyData.filter((p) => p.spouse).length;
  const yearsOfHistory =
    new Date().getFullYear() - Math.min(...familyData.map((p) => p.birthYear));

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="border-emerald-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700">
            Total Membres
          </CardTitle>
          <Users className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900">
            {totalMembers}
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700">
            Générations
          </CardTitle>
          <Calendar className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900">
            {generations}
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700">
            Couples
          </CardTitle>
          <Users className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900">{couples}</div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700">
            Années d'Histoire
          </CardTitle>
          <Calendar className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900">
            {yearsOfHistory}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
