import type { Node, Edge } from "@xyflow/react";
import type { Roadmap, RoadmapNode } from "./types";

export type RoadmapNodeData = {
  label: string;
  notes: string;
  roadmapNodeId: string;
  isCompleted: boolean;
  isSelected?: boolean;
  isEditorMode?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onToggleComplete?: (nodeId: string) => void;
};

export type RoadmapFlowNode = Node<RoadmapNodeData, "roadmap-node">;
export type RoadmapFlowEdge = Edge;

export function getHandlePositions(
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number },
): { sourceHandle: string; targetHandle: string } {
  const sourceCenterX = sourcePos.x + 90;
  const sourceCenterY = sourcePos.y + 25;
  const targetCenterX = targetPos.x + 90;
  const targetCenterY = targetPos.y + 25;
  const dx = targetCenterX - sourceCenterX;
  const dy = targetCenterY - sourceCenterY;

  if (Math.abs(dx) > Math.abs(dy)) {
    return {
      sourceHandle: dx > 0 ? "right" : "left",
      targetHandle: dx > 0 ? "left" : "right",
    };
  }
  return {
    sourceHandle: dy > 0 ? "bottom" : "top",
    targetHandle: dy > 0 ? "top" : "bottom",
  };
}

export function roadmapToFlow(
  roadmap: Roadmap,
  completed: Record<string, boolean> = {},
  isEditorMode = false,
  selectedNodeId: string | null = null,
  onNodeClick?: (nodeId: string) => void,
  onToggleComplete?: (nodeId: string) => void,
): { nodes: RoadmapFlowNode[]; edges: RoadmapFlowEdge[] } {
  const nodes: RoadmapFlowNode[] = Object.values(roadmap.nodes).map((node: RoadmapNode) => ({
    id: node.id,
    type: "roadmap-node",
    position: node.position,
    data: {
      label: node.title,
      notes: node.notes,
      roadmapNodeId: node.id,
      isCompleted: completed[node.id] ?? false,
      isSelected: selectedNodeId === node.id,
      isEditorMode,
      onNodeClick,
      onToggleComplete,
    },
  }));

  const edges: RoadmapFlowEdge[] = roadmap.edges.map((edge) => {
    const sourceNode = roadmap.nodes[edge.source];
    const targetNode = roadmap.nodes[edge.target];
    const handles = sourceNode && targetNode
      ? getHandlePositions(sourceNode.position, targetNode.position)
      : { sourceHandle: "bottom", targetHandle: "top" };
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "smooth",
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
    };
  });

  return { nodes, edges };
}

export function flowToRoadmap(
  nodes: RoadmapFlowNode[],
  edges: RoadmapFlowEdge[],
  roadmapId: string,
  existingRoadmap: Roadmap,
): Roadmap {
  const roadmapNodes: Record<string, RoadmapNode> = {};

  for (const node of nodes) {
    const existing = existingRoadmap.nodes[node.id];
    roadmapNodes[node.id] = {
      id: node.id,
      title: node.data.label,
      position: node.position,
      notes: existing?.notes ?? node.data.notes,
    };
  }

  const roadmapEdges = edges.map((edge: RoadmapFlowEdge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }));

  return {
    id: roadmapId,
    name: existingRoadmap.name,
    createdAt: existingRoadmap.createdAt,
    updatedAt: new Date().toISOString(),
    nodes: roadmapNodes,
    edges: roadmapEdges,
  };
}
