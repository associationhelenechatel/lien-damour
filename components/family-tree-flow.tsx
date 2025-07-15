"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import {
  ReactFlow,
  type Node,
  type Edge,
  addEdge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import type { FamilyMember } from "@/lib/family-data"
import FamilyMemberNode from "@/components/family-member-node"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RotateCcw, Search } from "lucide-react"

interface FamilyTreeFlowProps {
  members: FamilyMember[]
  searchTerm: string
  onSearchChange: (term: string) => void
}

const nodeTypes = {
  familyMember: FamilyMemberNode,
}

export default function FamilyTreeFlow({ members, searchTerm, onSearchChange }: FamilyTreeFlowProps) {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)

  const handleNodeFocus = useCallback((nodeId: string) => {
    console.log("Focusing on node:", nodeId)
    setFocusedNodeId(nodeId)
  }, [])

  const resetFocus = useCallback(() => {
    console.log("Resetting focus")
    setFocusedNodeId(null)
  }, [])

  // Create nodes and edges from family data
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    console.log("Rebuilding tree with focusedNodeId:", focusedNodeId)

    const nodes: Node[] = []
    const edges: Edge[] = []

    // Position configuration - increased spacing
    const generationSpacing = 350
    const memberSpacing = 280
    const centerX = 800

    // Filter members based on focus
    let visibleMembers = members

    if (focusedNodeId) {
      const focusedMember = members.find((m) => m.id === focusedNodeId)
      console.log("Focused member:", focusedMember)

      if (focusedMember) {
        const relatedMembers = new Set<string>()

        // Add the focused member
        relatedMembers.add(focusedMember.id)
        console.log("Added focused member:", focusedMember.name)

        // Add parents - find members who have this person in their children array
        const parents = members.filter((m) => {
          const hasChild = m.children && m.children.includes(focusedMember.name)
          if (hasChild) {
            console.log("Found parent:", m.name, "has child:", focusedMember.name)
          }
          return hasChild
        })
        parents.forEach((p) => {
          relatedMembers.add(p.id)
          console.log("Added parent:", p.name)
        })

        // Add children - find members whose names are in the focused member's children array
        if (focusedMember.children) {
          const children = members.filter((m) => {
            const isChild = focusedMember.children!.includes(m.name)
            if (isChild) {
              console.log("Found child:", m.name, "of:", focusedMember.name)
            }
            return isChild
          })
          children.forEach((c) => {
            relatedMembers.add(c.id)
            console.log("Added child:", c.name)
          })
        }

        // Add spouse
        if (focusedMember.spouse) {
          const spouse = members.find((m) => m.name === focusedMember.spouse)
          if (spouse) {
            relatedMembers.add(spouse.id)
            console.log("Added spouse:", spouse.name)
          }
        }

        visibleMembers = members.filter((m) => relatedMembers.has(m.id))
        console.log(
          "Visible members:",
          visibleMembers.map((m) => m.name),
        )
      }
    }

    // Group members by generation
    const generationGroups: { [key: number]: FamilyMember[] } = {}
    visibleMembers.forEach((member) => {
      if (!generationGroups[member.generation]) {
        generationGroups[member.generation] = []
      }
      generationGroups[member.generation].push(member)
    })

    // Create nodes for each generation
    Object.entries(generationGroups).forEach(([generation, generationMembers]) => {
      const gen = Number.parseInt(generation)
      const y = (gen + 2) * generationSpacing + 100

      generationMembers.forEach((member, index) => {
        const totalMembers = generationMembers.length
        const startX = centerX - ((totalMembers - 1) * memberSpacing) / 2
        const x = startX + index * memberSpacing

        // Strict search highlighting - only match names
        const isHighlighted =
          searchTerm &&
          (() => {
            const nameParts = member.name.toLowerCase().split(" ")
            const searchLower = searchTerm.toLowerCase()
            return nameParts.some((namePart) => namePart.includes(searchLower))
          })()

        const isFocused = member.id === focusedNodeId
        console.log(`Node ${member.name} (${member.id}) - isFocused: ${isFocused}`)

        nodes.push({
          id: member.id,
          type: "familyMember",
          position: { x, y },
          data: {
            member,
            isHighlighted: Boolean(isHighlighted),
            isFocused,
            onFocus: handleNodeFocus,
          },
          draggable: false,
        })
      })
    })

    // Create edges based on family relationships (only for visible members)
    const visibleMemberIds = new Set(visibleMembers.map((m) => m.id))

    visibleMembers.forEach((member) => {
      // Connect spouses
      if (member.spouse) {
        const spouseMember = visibleMembers.find((m) => m.name === member.spouse)
        if (spouseMember && member.id < spouseMember.id) {
          edges.push({
            id: `spouse-${member.id}-${spouseMember.id}`,
            source: member.id,
            target: spouseMember.id,
            type: "straight",
            style: { stroke: "#ef4444", strokeWidth: 2, strokeDasharray: "5,5" },
            label: "Married",
            labelStyle: { fontSize: 12, fill: "#ef4444" },
          })
        }
      }

      // Connect parents to children
      if (member.children) {
        member.children.forEach((childName) => {
          const child = visibleMembers.find((m) => m.name === childName)
          if (child && visibleMemberIds.has(child.id)) {
            edges.push({
              id: `parent-${member.id}-${child.id}`,
              source: member.id,
              target: child.id,
              type: "smoothstep",
              style: { stroke: "#10b981", strokeWidth: 2 },
            })
          }
        })
      }
    })

    console.log("Generated nodes:", nodes.length, "edges:", edges.length)
    return { nodes, edges }
  }, [members, searchTerm, focusedNodeId, handleNodeFocus])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes when initialNodes change
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const focusedMember = focusedNodeId ? members.find((m) => m.id === focusedNodeId) : null

  return (
    <div className="w-full h-full relative">
      {/* Integrated search bar */}
      <div className="absolute top-4 right-4 z-10 w-80">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search family members by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white shadow-lg border"
          />
        </div>
      </div>

      {/* Focus panel */}
      {focusedNodeId && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg border p-4 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">Focused: {focusedMember?.name}</h3>
            <Button variant="outline" size="sm" onClick={resetFocus}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Show All
            </Button>
          </div>
          <p className="text-sm text-slate-600">Showing direct family only</p>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Controls className="bg-white shadow-lg border rounded-lg" />
        <MiniMap className="bg-white shadow-lg border rounded-lg" nodeColor="#10b981" maskColor="rgba(0, 0, 0, 0.1)" />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  )
}
