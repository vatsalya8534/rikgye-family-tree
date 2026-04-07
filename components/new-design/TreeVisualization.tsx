"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import { createRoot } from "react-dom/client";

// ------------------- Types ------------------- //

export interface FamilyNode {
  id: string;
  name: string;
  gender: "male" | "female" | "other";
  birthYear?: number;
  isAlive?: boolean;
  spouses: FamilyNodeSpouse[];
  children: FamilyNode[];
}

export interface FamilyNodeSpouse {
  id: string;
  name: string;
  gender: "male" | "female" | "other";
  birthYear?: number;
  type: "current" | "ex";
}

export interface LayoutNode {
  id: string;
  name: string;
  gender: "male" | "female" | "other";
  birthYear?: number;
  x: number;
  y: number;
  type: "person" | "spouse";
  spouseType?: "current" | "ex";
  parentId?: string;
  level: number;
  isAlive?: boolean;
}

export interface LayoutLink {
  source: { x: number; y: number };
  target: { x: number; y: number };
  sourceId: string;
  targetId: string;
  type: "current" | "ex" | "child";
}

interface TreeVisualizationProps {
  data: FamilyNode;
  onNodeClick: (id: string, type: "person" | "spouse") => void;
  onEdit?: (id: string, type: "person" | "spouse") => void;
  onDelete?: (id: string) => void;
  onAdd?: (id: string) => void; // Added onAdd prop
  selectedId?: string | null;
}

// ------------------- Constants ------------------- //

export const CARD_W = 150;
export const CARD_H = 180;
export const SPOUSE_GAP = 25;
const H_GAP = 40;
const V_GAP = 100;

const OVERFLOW_TOP = 60;   
const OVERFLOW_SIDES = 20; 
const FO_WIDTH = CARD_W + (OVERFLOW_SIDES * 2);
const FO_HEIGHT = CARD_H + OVERFLOW_TOP + 20;

// ------------------- Node Card ------------------- //

interface TreeNodeCardProps {
  node: LayoutNode;
  onClick: (id: string, type: "person" | "spouse") => void;
  onEdit?: (id: string, type: "person" | "spouse") => void;
  onDelete?: (id: string) => void;
  onAdd?: (id: string) => void; // Added onAdd prop
  isSelected?: boolean;
  isOnPath?: boolean; 
}

const TreeNodeCard: React.FC<TreeNodeCardProps> = ({
  node,
  onClick,
  onEdit,
  onDelete,
  onAdd,
  isSelected = false,
  isOnPath = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const isMale = node.gender === "male";
  const birthYear = node.birthYear || "";
  const aliveStatus = node.isAlive ? "Alive" : "Dead";
  
  const pathBorderColor = isOnPath 
    ? "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
    : (isMale ? "border-blue-400" : "border-pink-400");
    
  const pathAvatarColor = isOnPath ? "bg-amber-500" : (isMale ? "bg-blue-400" : "bg-pink-400");
  const aliveColor = node.isAlive ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800";

  return (
    <div
      className="relative w-full h-full transition-all duration-300"
      style={{ 
        paddingTop: OVERFLOW_TOP, 
        paddingLeft: OVERFLOW_SIDES,
        paddingRight: OVERFLOW_SIDES,
        transform: hovered ? "scale(1.03)" : "scale(1)"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(node.id, node.type)}
    >
      {/* Hover Buttons */}
      {hovered && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 z-50">
          {/* ADD BUTTON */}
          <button
            onClick={(e) => { e.stopPropagation(); onAdd?.(node.id); }}
            className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md"
            title="Add Member"
          >＋</button>

          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(node.id, node.type); }}
            className="w-8 h-8 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md"
            title="Edit"
          >✏</button>

          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(node.id); }}
            className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md"
            title="Delete"
          >🗑</button>
        </div>
      )}

      <div
        className={`relative flex flex-col items-center pt-14 bg-white shadow-lg rounded-2xl border-[3px] transition-all duration-500
          ${pathBorderColor}
          ${isSelected ? "ring-4 ring-yellow-400 ring-offset-2" : ""}`}
        style={{ width: CARD_W, height: CARD_H }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md transition-colors duration-500 ${pathAvatarColor}`}>
            {node.name.charAt(0)}
          </div>
        </div>

        <p className={`mt-2 text-sm font-semibold text-center truncate px-2 w-full ${isOnPath ? "text-amber-800" : "text-gray-800"}`}>
          {node.name}
        </p>
        <p className="text-[12px] text-gray-500">{birthYear}</p>
        <span className={`mt-2 text-[10px] px-2 py-[2px] rounded-full font-medium ${aliveColor}`}>
          {aliveStatus}
        </span>

        <div className="absolute top-2 right-2 flex items-center">
          <div className={`w-8 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm 
            ${isOnPath ? "bg-amber-600 text-white" : "bg-gray-800 text-yellow-400"}`}>
            L{node.level}
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------- Layout Functions ------------------- //

function placeNodes(node: FamilyNode, x: number, y: number, nodes: LayoutNode[], level: number = 0): number {
  const currentWives = node.spouses.filter((s) => s.type === "current");
  const exWives = node.spouses.filter((s) => s.type === "ex");
  const personX = x + currentWives.length * (CARD_W + SPOUSE_GAP);

  nodes.push({ id: node.id, name: node.name, gender: node.gender, birthYear: node.birthYear, x: personX, y, type: "person", level, isAlive: node.isAlive });

  currentWives.forEach((spouse, i) => {
    nodes.push({ id: spouse.id, name: spouse.name, gender: spouse.gender, birthYear: spouse.birthYear, x: personX - (i + 1) * (CARD_W + SPOUSE_GAP), y, type: "spouse", spouseType: "current", parentId: node.id, level });
  });

  exWives.forEach((spouse, i) => {
    nodes.push({ id: spouse.id, name: spouse.name, gender: spouse.gender, birthYear: spouse.birthYear, x: personX + CARD_W + SPOUSE_GAP + i * (CARD_W + SPOUSE_GAP), y, type: "spouse", spouseType: "ex", parentId: node.id, level });
  });

  const unitWidth = CARD_W + node.spouses.length * (CARD_W + SPOUSE_GAP);
  if (!node.children.length) return unitWidth;

  const childY = y + CARD_H + V_GAP;
  let childX = x;
  const childWidths: number[] = [];

  node.children.forEach((child) => {
    const w = placeNodes(child, childX, childY, nodes, level + 1);
    childWidths.push(w);
    childX += w + H_GAP;
  });

  const totalChildrenWidth = childWidths.reduce((a, b) => a + b, 0) + (node.children.length - 1) * H_GAP;
  const parentCenterX = personX + CARD_W / 2;
  const childrenCenterX = x + totalChildrenWidth / 2;
  const offset = parentCenterX - childrenCenterX;

  if (offset !== 0) {
    const collectIds = (n: FamilyNode): string[] => {
      const ids = [n.id, ...n.spouses.map((s) => s.id)];
      n.children.forEach((c) => ids.push(...collectIds(c)));
      return ids;
    };
    const idsToShift = new Set(node.children.flatMap(collectIds));
    nodes.forEach((n) => { if (idsToShift.has(n.id)) n.x += offset; });
  }

  return Math.max(unitWidth, totalChildrenWidth + (offset > 0 ? offset : 0));
}

function computeLinks(node: FamilyNode, nodes: LayoutNode[], links: LayoutLink[]) {
  const personNode = nodes.find((n) => n.id === node.id)!;
  node.spouses.forEach((spouse) => {
    const spouseNode = nodes.find((n) => n.id === spouse.id)!;
    const left = spouseNode.x < personNode.x ? spouseNode : personNode;
    const right = spouseNode.x < personNode.x ? personNode : spouseNode;
    links.push({ source: { x: left.x + CARD_W, y: left.y + CARD_H / 2 }, target: { x: right.x, y: right.y + CARD_H / 2 }, sourceId: node.id, targetId: spouse.id, type: spouse.type });
  });
  node.children.forEach((child) => {
    const childNode = nodes.find((n) => n.id === child.id)!;
    links.push({ source: { x: personNode.x + CARD_W / 2, y: personNode.y + CARD_H }, target: { x: childNode.x + CARD_W / 2, y: childNode.y }, sourceId: node.id, targetId: child.id, type: "child" });
    computeLinks(child, nodes, links);
  });
}

function findAncestorPath(node: FamilyNode, targetId: string): string[] | null {
  if (node.id === targetId) return [node.id];
  for (const spouse of node.spouses) if (spouse.id === targetId) return [node.id, spouse.id];
  for (const child of node.children) {
    const path = findAncestorPath(child, targetId);
    if (path) return [node.id, ...path];
  }
  return null;
}

// ------------------- Main Component ------------------- //

const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  data,
  onNodeClick,
  onEdit,
  onDelete,
  onAdd, // Destructure onAdd
  selectedId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nodes: LayoutNode[] = [];
  const links: LayoutLink[] = [];
  placeNodes(data, 0, 0, nodes);
  computeLinks(data, nodes, links);

  const ancestorPath = useMemo(() => {
    const pathSet = new Set<string>();
    if (selectedId) {
      const path = findAncestorPath(data, selectedId);
      if (path) path.forEach((id) => pathSet.add(id));
    }
    return pathSet;
  }, [data, selectedId]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const g = svg.append("g").attr("class", "zoom-group");

    links.forEach((link) => {
      const isOnPath = ancestorPath.has(link.sourceId) && ancestorPath.has(link.targetId);
      if (link.type === "child") {
        const midY = (link.source.y + link.target.y) / 2;
        g.append("path")
          .attr("d", `M${link.source.x},${link.source.y} L${link.source.x},${midY} L${link.target.x},${midY} L${link.target.x},${link.target.y}`)
          .attr("fill", "none")
          .attr("stroke", isOnPath ? "#f59e0b" : "#cbd5e1")
          .attr("stroke-width", isOnPath ? 4 : 2);
      } else {
        g.append("line")
          .attr("x1", link.source.x).attr("y1", link.source.y)
          .attr("x2", link.target.x).attr("y2", link.target.y)
          .attr("stroke", link.type === "current" ? "#ef4444" : "#94a3b8")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", link.type === "ex" ? "8,4" : "none");
      }
    });

    nodes.forEach((node) => {
      const isNodeOnPath = ancestorPath.has(node.id);
      const foreignObject = g.append("foreignObject")
        .attr("x", node.x - OVERFLOW_SIDES)
        .attr("y", node.y - OVERFLOW_TOP)
        .attr("width", FO_WIDTH)
        .attr("height", FO_HEIGHT)
        .style("overflow", "visible");

      const div = document.createElement("div");
      const root = createRoot(div);
      root.render(
        <TreeNodeCard
          node={node}
          onClick={onNodeClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={onAdd} // Pass onAdd to card
          isSelected={node.id === selectedId}
          isOnPath={isNodeOnPath}
        />
      );
      
      foreignObject.node()?.appendChild(div);
      foreignObject.on("mouseenter", function() { d3.select(this).raise(); });
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on("zoom", (event) => g.attr("transform", event.transform.toString()));

    svg.call(zoom);

    const svgWidth = containerRef.current.clientWidth;
    const treeWidth = Math.max(...nodes.map((n) => n.x)) + CARD_W;

    const initialScale = 0.7;
    const initialX = (svgWidth - treeWidth * initialScale) / 2;

    svg.transition().duration(750).call(
      zoom.transform as any,
      d3.zoomIdentity
        .translate(initialX, 50)
        .scale(initialScale)
    );

  }, [nodes, links, onNodeClick, onEdit, onDelete, onAdd, ancestorPath, selectedId]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-50 overflow-hidden">
      <svg ref={svgRef} width="100%" height="100%" className="absolute top-0 left-0" />
    </div>
  );
};

export default TreeVisualization;