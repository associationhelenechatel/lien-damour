"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FamilyMember } from "@/lib/family-data";
import FamilyMemberNode from "@/components/family-member-node";
import CoupleLinkNode from "@/components/couple-link-node";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search } from "lucide-react";
import dagre from "dagre";

interface FamilyTreeFlowProps {
  members: FamilyMember[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const nodeTypes = {
  familyMember: FamilyMemberNode,
  coupleLink: CoupleLinkNode,
};

// Helper function to get children of a person
function getChildrenOf(
  parentId: string,
  members: FamilyMember[]
): FamilyMember[] {
  return members.filter((m) => m.father === parentId || m.mother === parentId);
}

// Helper function to get parents of a person
function getParentsOf(
  childId: string,
  members: FamilyMember[]
): FamilyMember[] {
  const child = members.find((m) => m.id === childId);
  if (!child) return [];

  const parents: FamilyMember[] = [];
  if (child.father) {
    const father = members.find((m) => m.id === child.father);
    if (father) parents.push(father);
  }
  if (child.mother) {
    const mother = members.find((m) => m.id === child.mother);
    if (mother) parents.push(mother);
  }
  return parents;
}

// Helper function to find couples (two people who have children together)
function getCouples(members: FamilyMember[]): Array<[string, string]> {
  const couples = new Set<string>();
  const coupleList: Array<[string, string]> = [];

  members.forEach((child) => {
    if (child.father && child.mother) {
      const coupleKey = [child.father, child.mother].sort().join("-");
      if (!couples.has(coupleKey)) {
        couples.add(coupleKey);
        coupleList.push([child.father, child.mother]);
      }
    }
  });

  return coupleList;
}

// Helper function to determine family role for styling
function getFamilyRole(memberId: string, members: FamilyMember[]): string {
  const member = members.find((m) => m.id === memberId);
  if (!member) return "family";

  const hasChildren = getChildrenOf(memberId, members).length > 0;
  const hasParents = getParentsOf(memberId, members).length > 0;

  if (hasParents && hasChildren) return "parent"; // Has both parents and children
  if (hasParents && !hasChildren) return "child"; // Has parents but no children
  if (!hasParents && hasChildren) return "grandparent"; // No parents but has children
  return "family"; // Default
}

// Helper function to apply Dagre layout to nodes
function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure the layout
  dagreGraph.setGraph({
    rankdir: "TB", // Top to bottom layout
    nodesep: 200, // Horizontal spacing for couple link nodes
    ranksep: 120, // Vertical spacing between ranks
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    // Different sizes for different node types
    const nodeSize =
      node.type === "coupleLink"
        ? { width: 26, height: 26 } // Match actual visual size of couple link nodes
        : { width: 200, height: 100 }; // Standard size for family member nodes

    dagreGraph.setNode(node.id, nodeSize);
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // Calculate center offset based on node type
    const centerOffset =
      node.type === "coupleLink"
        ? { x: 13, y: 13 } // Center couple link nodes (26/2, 26/2)
        : { x: 100, y: 50 }; // Center family member nodes (200/2, 100/2)

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - centerOffset.x,
        y: nodeWithPosition.y - centerOffset.y,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export default function FamilyTreeFlow({
  members,
  searchTerm,
  onSearchChange,
}: FamilyTreeFlowProps) {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  const handleNodeFocus = useCallback((nodeId: string) => {
    console.log("Focusing on node:", nodeId);
    setFocusedNodeId(nodeId);
  }, []);

  const resetFocus = useCallback(() => {
    console.log("Resetting focus");
    setFocusedNodeId(null);
  }, []);

  // Create nodes and edges from family data
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    console.log("Rebuilding tree with focusedNodeId:", focusedNodeId);

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Filter members based on focus
    let visibleMembers = members;

    if (focusedNodeId) {
      const focusedMember = members.find((m) => m.id === focusedNodeId);
      console.log("Focused member:", focusedMember);

      if (focusedMember) {
        const relatedMembers = new Set<string>();

        // Add the focused member
        relatedMembers.add(focusedMember.id);
        console.log("Added focused member:", focusedMember.name);

        // Add parents - find the father and mother of the focused member
        const parents = getParentsOf(focusedMember.id, members);
        parents.forEach((p) => {
          relatedMembers.add(p.id);
          console.log("Added parent:", p.name);
        });

        // Add children - find members who have this person as father or mother
        const children = getChildrenOf(focusedMember.id, members);
        children.forEach((c) => {
          relatedMembers.add(c.id);
          console.log("Added child:", c.name, "of:", focusedMember.name);
        });

        // Add spouses (people who have children with the focused member)
        const couples = getCouples(members);
        couples.forEach(([parent1Id, parent2Id]) => {
          if (parent1Id === focusedMember.id) {
            relatedMembers.add(parent2Id);
            const spouse = members.find((m) => m.id === parent2Id);
            if (spouse) console.log("Added spouse:", spouse.name);
          } else if (parent2Id === focusedMember.id) {
            relatedMembers.add(parent1Id);
            const spouse = members.find((m) => m.id === parent1Id);
            if (spouse) console.log("Added spouse:", spouse.name);
          }
        });

        visibleMembers = members.filter((m) => relatedMembers.has(m.id));
        console.log(
          "Visible members:",
          visibleMembers.map((m) => m.name)
        );
      }
    }

    // Create individual nodes for all family members
    visibleMembers.forEach((member, index) => {
      // Strict search highlighting - only match names
      const isHighlighted =
        searchTerm &&
        (() => {
          const nameParts = member.name.toLowerCase().split(" ");
          const searchLower = searchTerm.toLowerCase();
          return nameParts.some((namePart) => namePart.includes(searchLower));
        })();

      const isFocused = member.id === focusedNodeId;
      const familyRole = getFamilyRole(member.id, members);

      console.log(
        `Node ${member.name} (${member.id}) - isFocused: ${isFocused}, role: ${familyRole}`
      );

      nodes.push({
        id: member.id,
        type: "familyMember",
        position: { x: 0, y: 0 }, // Initial position, will be overridden by Dagre layout
        data: {
          member,
          isHighlighted: Boolean(isHighlighted),
          isFocused,
          onFocus: handleNodeFocus,
          familyRole,
          allMembers: members,
        },
        draggable: true, // Allow dragging for user adjustment
      });
    });

    // Create couple link nodes for people who have children together
    const couples = getCouples(visibleMembers);
    couples.forEach(([parent1Id, parent2Id]) => {
      // Check if both parents are visible
      const parent1 = visibleMembers.find((m) => m.id === parent1Id);
      const parent2 = visibleMembers.find((m) => m.id === parent2Id);

      if (parent1 && parent2) {
        const coupleKey = [parent1Id, parent2Id].sort().join("-");
        const linkId = `link-${coupleKey}`;

        nodes.push({
          id: linkId,
          type: "coupleLink",
          position: { x: 0, y: 0 }, // Initial position, will be overridden by Dagre layout
          data: {
            coupleKey,
          },
          draggable: true,
        });
      }
    });

    // Create edges based on family relationships
    const visibleMemberIds = new Set(visibleMembers.map((m) => m.id));

    // Connect spouses to couple link nodes and couple links to children
    couples.forEach(([parent1Id, parent2Id]) => {
      const parent1 = visibleMembers.find((m) => m.id === parent1Id);
      const parent2 = visibleMembers.find((m) => m.id === parent2Id);

      if (parent1 && parent2) {
        const coupleKey = [parent1Id, parent2Id].sort().join("-");
        const linkId = `link-${coupleKey}`;

        // Determine first and second spouse based on ID order
        const firstSpouse = parent1Id < parent2Id ? parent1 : parent2;
        const secondSpouse = parent1Id < parent2Id ? parent2 : parent1;

        // First spouse connects from right handle to left side of link
        edges.push({
          id: `spouse-${firstSpouse.id}-${linkId}`,
          source: firstSpouse.id,
          sourceHandle: "spouse-right",
          target: linkId,
          targetHandle: "spouse-left",
          type: "straight",
          style: {
            stroke: "#ef4444",
            strokeWidth: 2,
            strokeDasharray: "5,5",
          },
        });

        // Second spouse connects from left handle to right side of link
        edges.push({
          id: `spouse-${secondSpouse.id}-${linkId}`,
          source: secondSpouse.id,
          sourceHandle: "spouse-left",
          target: linkId,
          targetHandle: "spouse-right",
          type: "straight",
          style: {
            stroke: "#ef4444",
            strokeWidth: 2,
            strokeDasharray: "5,5",
          },
        });

        // Connect couple link to their children
        const children = visibleMembers.filter(
          (child) =>
            (child.father === parent1Id && child.mother === parent2Id) ||
            (child.father === parent2Id && child.mother === parent1Id)
        );

        children.forEach((child) => {
          if (visibleMemberIds.has(child.id)) {
            edges.push({
              id: `family-${linkId}-${child.id}`,
              source: linkId,
              sourceHandle: undefined,
              target: child.id,
              targetHandle: undefined,
              type: "smoothstep",
              style: {
                stroke: "#10b981",
                strokeWidth: 2,
              },
            });
          }
        });
      }
    });

    // Handle single parents (people with children but no couple link)
    visibleMembers.forEach((member) => {
      const memberChildren = getChildrenOf(member.id, visibleMembers);
      memberChildren.forEach((child) => {
        // Only connect directly if this child doesn't have both parents visible
        const childParents = getParentsOf(child.id, visibleMembers);
        if (childParents.length === 1 && visibleMemberIds.has(child.id)) {
          edges.push({
            id: `parent-${member.id}-${child.id}`,
            source: member.id,
            sourceHandle: undefined,
            target: child.id,
            targetHandle: undefined,
            type: "straight",
            style: { stroke: "#10b981", strokeWidth: 2 },
          });
        }
      });
    });

    console.log("Generated nodes:", nodes.length, "edges:", edges.length);

    // Apply Dagre layout
    const layouted = getLayoutedElements(nodes, edges);

    return {
      nodes: layouted.nodes,
      edges: layouted.edges,
    };
  }, [members, searchTerm, focusedNodeId, handleNodeFocus]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when initialNodes change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const focusedMember = focusedNodeId
    ? members.find((m) => m.id === focusedNodeId)
    : null;

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
            <h3 className="font-semibold text-slate-900">
              Focused: {focusedMember?.name}
            </h3>
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
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Controls className="bg-white shadow-lg border rounded-lg" />
        <MiniMap
          className="bg-white shadow-lg border rounded-lg"
          nodeColor="#10b981"
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e2e8f0"
        />
      </ReactFlow>
    </div>
  );
}
