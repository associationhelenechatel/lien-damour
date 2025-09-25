"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FamilyMemberWithRelations } from "@/lib/types";

interface MemberCardProps {
  member: FamilyMemberWithRelations;
  compact?: boolean;
}

export function MemberCard({ member, compact = false }: MemberCardProps) {
  const isAlive = !member.deathDate;

  return (
    <Card
      className={`${
        compact ? "p-2" : "p-4"
      } hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-400 bg-white hover:scale-[1.02]`}
    >
      <CardContent className={compact ? "p-2" : "p-4"}>
        <div className="space-y-3">
          {/* Header avec nom */}
          <div className="flex items-center justify-between">
            <h3
              className={`font-semibold text-foreground ${
                compact ? "text-sm" : "text-base"
              }`}
            >
              {member.displayName}
            </h3>
            {isAlive && (
              <div
                className="w-2 h-2 bg-emerald-400 rounded-full"
                title="Vivant"
              />
            )}
          </div>

          {/* Badge génération */}
          <Badge variant="outline" className="text-xs w-fit">
            Génération {member.generation}
          </Badge>

          {/* Informations principales */}
          <div className="space-y-2">
            {member.birthDate && (
              <p
                className={`text-muted-foreground ${
                  compact ? "text-xs" : "text-sm"
                }`}
              >
                Né(e) : {member.birthDate}
              </p>
            )}

            {member.deathDate && (
              <p
                className={`text-muted-foreground ${
                  compact ? "text-xs" : "text-sm"
                }`}
              >
                Décédé(e) : {member.deathDate}
              </p>
            )}

            {member.code && (
              <div className="flex justify-center">
                <Badge
                  variant="secondary"
                  className="font-mono bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800"
                >
                  {member.code}
                </Badge>
              </div>
            )}
          </div>

          {/* Footer avec statistiques */}
          {member.children.length > 0 && (
            <div className="flex items-center justify-center gap-1 pt-2 border-t border-gray-100">
              <span className="text-xs text-muted-foreground">
                {member.children.length} enfant
                {member.children.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
