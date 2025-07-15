"use client"

import type React from "react"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { FamilyMember } from "@/lib/family-data"

interface FamilyMemberNodeData {
  member: FamilyMember
  isHighlighted: boolean
  isFocused: boolean
  onFocus: (nodeId: string) => void
}

function FamilyMemberNode({ data }: NodeProps<FamilyMemberNodeData>) {
  const { member, isHighlighted, isFocused, onFocus } = data

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getGenerationColor = (generation: number) => {
    const colors = {
      "-2": "bg-purple-100 text-purple-800 border-purple-200",
      "-1": "bg-blue-100 text-blue-800 border-blue-200",
      "0": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "1": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "2": "bg-red-100 text-red-800 border-red-200",
    }
    return colors[generation.toString() as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getGenerationLabel = (generation: number) => {
    const labels = {
      "-2": "Great GP",
      "-1": "Grandparent",
      "0": "Current",
      "1": "Child",
      "2": "Grandchild",
    }
    return labels[generation.toString() as keyof typeof labels] || "Family"
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Node clicked:", member.name, "ID:", member.id, "isFocused:", isFocused)
    onFocus(member.id)
  }

  console.log(`Rendering node ${member.name} - isFocused: ${isFocused}`)

  return (
    <>
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-500 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-white" />
      <Handle type="source" position={Position.Left} className="w-3 h-3 bg-red-500 border-2 border-white" />
      <Handle type="target" position={Position.Right} className="w-3 h-3 bg-red-500 border-2 border-white" />

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
                    isFocused ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate text-sm">{member.name}</h3>
                <p className="text-xs text-slate-600 truncate">{member.relationship}</p>
              </div>
            </div>
            <Badge variant="secondary" className={`text-xs ${getGenerationColor(member.generation)}`}>
              {getGenerationLabel(member.generation)}
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
              <span className="font-medium">Occupation:</span> {member.occupation}
            </p>
          )}
          {member.spouse && (
            <p className="text-xs text-slate-600 truncate">
              <span className="font-medium">Spouse:</span> {member.spouse}
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default memo(FamilyMemberNode)
