"use client";

import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import type { FamilyTree, FamilyMemberWithRelations } from "@/lib/types";

interface D3FamilyTreeProps {
  familyTree: FamilyTree;
}

interface TreeNode extends d3.HierarchyNode<FamilyMemberWithRelations> {
  x?: number;
  y?: number;
}

export function D3FamilyTree({ familyTree }: D3FamilyTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Evite de reconstruire le SVG si seul l'objet parent est recréé.
  const treeDataSignature = useMemo(
    () =>
      `${familyTree.members.length}:${familyTree.members
        .map(
          (m) =>
            `${m.id}:${m.displayName}:${m.birthDate ?? ""}:${m.deathDate ?? ""}:${m.children.length}:${m.parents.length}`
        )
        .sort((a, b) => a.localeCompare(b))
        .join(",")}`,
    [familyTree.members]
  );

  useEffect(() => {
    if (!svgRef.current || !familyTree.members.length) return;

    // Nettoyer le SVG précédent
    d3.select(svgRef.current).selectAll("*").remove();

    // Dimensions énormes pour espacement extrême
    const width = 2000;
    const height = 2000;
    const radius = Math.min(width, height) / 2 - 300;

    // Créer la hiérarchie des données
    const hierarchyData = createHierarchyData(familyTree.members);

    if (!hierarchyData) return;

    // Créer la hiérarchie D3
    const root = d3.hierarchy(hierarchyData);

    // Créer l'arbre radial avec espacement extrême
    const tree = d3
      .tree<FamilyMemberWithRelations>()
      .size([2 * Math.PI, radius])
      .separation((a, b) => {
        // Espacement extrême selon la profondeur
        const baseSpacing = a.parent === b.parent ? 15 : 25; // Triplé
        const depthMultiplier = Math.max(3, 12 - a.depth); // Très agressif
        return baseSpacing * depthMultiplier;
      });

    // Appliquer l'arbre aux données
    tree(root);

    // Créer le SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g");

    // Ajouter les liens (branches)
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkRadial<unknown, TreeNode>()
          .angle((d) => d.x!)
          .radius((d) => d.y!)
      )
      .style("fill", "none")
      .style("stroke", "#ccc")
      .style("stroke-width", 2);

    // Ajouter les nœuds
    const node = g
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr(
        "transform",
        (d) => `
        rotate(${(d.x! * 180) / Math.PI - 90}) 
        translate(${d.y!},0)
      `
      );

    // Cercles pour les nœuds avec taille adaptée à la profondeur
    node
      .append("circle")
      .attr("r", (d) => {
        // Cercle plus grand pour la racine (Hélène Chatel)
        if (d.depth === 0) return 15; // Racine plus grande
        const baseRadius = Math.max(4, 12 - d.depth * 1.5);
        return Math.min(baseRadius, 10);
      })
      .style("fill", (d) => {
        // Couleur spéciale pour la racine (Hélène Chatel)
        if (d.depth === 0) return "#dc2626"; // Rouge pour la racine
        return d.data.isAlive ? "#10b981" : "#6b7280";
      })
      .style("stroke", (d) => (d.depth === 0 ? "#fbbf24" : "#fff")) // Bordure dorée pour la racine
      .style("stroke-width", (d) => (d.depth === 0 ? 3 : 2)) // Bordure plus épaisse pour la racine
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        // Réutiliser un seul tooltip évite allocations DOM fréquentes.
        let tooltip = tooltipRef.current;
        if (!tooltip) {
          tooltip = document.createElement("div");
          tooltip.className = "d3-family-tooltip";
          tooltip.style.position = "absolute";
          tooltip.style.background = "rgba(0, 0, 0, 0.8)";
          tooltip.style.color = "white";
          tooltip.style.padding = "8px";
          tooltip.style.borderRadius = "4px";
          tooltip.style.fontSize = "12px";
          tooltip.style.pointerEvents = "none";
          tooltip.style.zIndex = "1000";
          tooltip.style.display = "none";
          document.body.appendChild(tooltip);
          tooltipRef.current = tooltip;
        }

        tooltip.innerHTML = `
          <strong>${d.data.displayName}</strong><br/>
          ${d.data.birthDate ? `Né(e): ${d.data.birthDate}` : ""}<br/>
          ${d.data.deathDate ? `Décédé(e): ${d.data.deathDate}` : ""}
          ${d.data.isAlive ? "<br/>Vivant(e)" : ""}
        `;
        tooltip.style.display = "block";
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY - 10}px`;
      })
      .on("mousemove", function (event) {
        const tooltip = tooltipRef.current;
        if (!tooltip) return;
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY - 10}px`;
      })
      .on("mouseout", function () {
        if (tooltipRef.current) tooltipRef.current.style.display = "none";
      });

    // Labels pour les nœuds avec taille adaptée et espacement
    node
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => {
        // Pas de label pour la racine
        if (d.depth === 0) return 0;
        // Espacement extrême pour les labels selon la profondeur
        const spacing = Math.max(20, 40 - d.depth * 3);
        return d.x! < Math.PI === !d.children ? spacing : -spacing;
      })
      .attr("text-anchor", (d) => {
        if (d.depth === 0) return "middle"; // Centré pour la racine (même si pas de texte)
        return d.x! < Math.PI === !d.children ? "start" : "end";
      })
      .attr("transform", (d) => (d.x! >= Math.PI ? "rotate(180)" : null))
      .text((d) => {
        // Pas de nom pour la racine (Hélène Chatel)
        if (d.depth === 0) return "";
        // Raccourcir les noms longs pour éviter l'encombrement
        const name = d.data.displayName;
        return name.length > 15 ? name.substring(0, 12) + "..." : name;
      })
      .style("font-size", () => {
        return `${10}px`;
      })
      .style("font-family", "Arial, sans-serif")
      .style("fill", "#333")
      .style("font-weight", "normal");

    // Ajouter le zoom avec limites adaptées et centré sur la souris
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 5]) // Plus de zoom pour naviguer dans un grand arbre
      .on("zoom", (event) => {
        const pending = event.transform;
        if (rafRef.current !== null) return;
        rafRef.current = requestAnimationFrame(() => {
          g.attr("transform", pending.toString());
          rafRef.current = null;
        });
      });

    // Appliquer le zoom et centrer l'arbre initialement
    svg.call(zoom);

    // Centrer l'arbre au démarrage avec un zoom initial plus grand
    const initialScale = 1.7; // Zoom initial à 200%
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(initialScale);
    svg.call(zoom.transform, initialTransform);

    // Cleanup function
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      tooltipRef.current?.remove();
      tooltipRef.current = null;
    };
  }, [treeDataSignature]);

  return (
    <div className="w-full h-full overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 2000 2000"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}

// Fonction pour créer la hiérarchie des données
function createHierarchyData(
  members: FamilyMemberWithRelations[]
): FamilyMemberWithRelations | null {
  // Trouver la racine (personne sans parents)
  const roots = members.filter((member) => member.parents.length === 0);

  if (roots.length === 0) return null;

  // Prendre la première racine ou celle avec le plus d'enfants
  const root = roots.reduce((prev, current) =>
    current.children.length > prev.children.length ? current : prev
  );

  const byId = new Map<number, FamilyMemberWithRelations>();
  for (const m of members) byId.set(m.id, m);
  const visited = new Set<number>();

  // Fonction récursive pour construire l'arbre
  function buildTree(
    person: FamilyMemberWithRelations
  ): FamilyMemberWithRelations {
    if (visited.has(person.id)) {
      return { ...person, children: [] };
    }
    visited.add(person.id);

    const children = person.children
      .map((child) => byId.get(child.id))
      .filter(Boolean)
      .map((child) => buildTree(child!));

    return {
      ...person,
      children: children,
    };
  }

  return buildTree(root);
}
