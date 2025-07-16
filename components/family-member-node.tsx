"use client";

import type React from "react";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { FamilyMember } from "@/lib/family-data";

interface FamilyMemberNodeData {
  member: FamilyMember;
  isHighlighted: boolean;
  isFocused: boolean;
  onFocus: (nodeId: string) => void;
  familyRole: string; // Family role (grandparent, parent, child, family)
  spouseName?: string; // Resolved spouse name
  allMembers: FamilyMember[]; // For resolving relationships
}

function FamilyMemberNode({ data }: NodeProps) {
  const {
    member,
    isHighlighted,
    isFocused,
    onFocus,
    familyRole,
    spouseName,
    allMembers,
  } = data as unknown as FamilyMemberNodeData;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    const colors = {
      grandparent: "bg-purple-100 text-purple-800 border-purple-200",
      parent: "bg-blue-100 text-blue-800 border-blue-200",
      child: "bg-yellow-100 text-yellow-800 border-yellow-200",
      family: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
    return (
      colors[role as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      grandparent: "Grandparent",
      parent: "Parent",
      child: "Child",
      family: "Family",
    };
    return labels[role as keyof typeof labels] || "Family";
  };

  const getChildrenNames = () => {
    if (!member.children) return null;

    const childNames = member.children
      .map((childId: string) => {
        const child = allMembers.find((m: FamilyMember) => m.id === childId);
        return child?.name;
      })
      .filter(Boolean);

    return childNames.length > 0 ? childNames.join(", ") : null;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(
      "Node clicked:",
      member.name,
      "ID:",
      member.id,
      "isFocused:",
      isFocused
    );
    onFocus(member.id);
  };

  return (
    <>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-emerald-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-emerald-500 border-2 border-white"
      />
      <Handle
        id="spouse-left"
        type="source"
        position={Position.Left}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />
      <Handle
        id="spouse-right"
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />

      <Card
        className={`w-64 shadow-lg transition-all duration-200 hover:shadow-xl cursor-pointer ${
          isFocused
            ? "ring-4 ring-blue-500 ring-offset-2 bg-blue-50 scale-105"
            : isHighlighted
              ? "ring-2 ring-emerald-500 ring-offset-2 bg-emerald-50"
              : "hover:scale-105"
        }`}
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback
                  className={`font-semibold ${
                    isFocused
                      ? "bg-blue-100 text-blue-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate text-sm">
                  {member.name}
                </h3>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`text-xs ${getRoleColor(familyRole)}`}
            >
              {getRoleLabel(familyRole)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-1">
          {member.birthYear && (
            <p className="text-xs text-slate-600">
              <span className="font-medium">Born:</span> {member.birthYear}
            </p>
          )}
          {member.location && (
            <p className="text-xs text-slate-600 truncate">
              <span className="font-medium">Location:</span> {member.location}
            </p>
          )}
          {member.occupation && (
            <p className="text-xs text-slate-600 truncate">
              <span className="font-medium">Occupation:</span>{" "}
              {member.occupation}
            </p>
          )}
          {spouseName && (
            <p className="text-xs text-slate-600 truncate">
              <span className="font-medium">Spouse:</span> {spouseName}
            </p>
          )}
          {getChildrenNames() && (
            <p className="text-xs text-slate-600 truncate">
              <span className="font-medium">Children:</span>{" "}
              {getChildrenNames()}
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default memo(FamilyMemberNode);
