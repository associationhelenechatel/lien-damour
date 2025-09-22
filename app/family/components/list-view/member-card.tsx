"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { FamilyMemberWithRelations } from "@/lib/types";

interface MemberCardProps {
  member: FamilyMemberWithRelations;
  compact?: boolean;
}

export function MemberCard({ member, compact = false }: MemberCardProps) {
  return (
    <Card
      className={`${compact ? "p-2" : "p-4"} hover:shadow-md transition-shadow`}
    >
      <CardContent className={compact ? "p-2" : "p-4"}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3
              className={`font-semibold ${compact ? "text-sm" : "text-base"}`}
            >
              {member.displayName}
            </h3>
          </div>

          {member.birthDate && (
            <p className={`text-gray-600 ${compact ? "text-xs" : "text-sm"}`}>
              Né(e) : {member.birthDate}
            </p>
          )}

          {member.deathDate && (
            <p className={`text-gray-600 ${compact ? "text-xs" : "text-sm"}`}>
              Décédé(e) : {member.deathDate}
            </p>
          )}

          {member.code && (
            <p className={`text-gray-500 ${compact ? "text-xs" : "text-sm"}`}>
              Code : {member.code}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Génération {member.generation}</span>
            {member.children.length > 0 && (
              <span>• {member.children.length} enfant(s)</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
