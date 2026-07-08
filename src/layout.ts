import type { RoadmapNode, RoadmapEdge } from "./types";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 50;
const LEVEL_GAP = 200;
const SIBLING_GAP = 70;

function buildTree(
  nodes: Record<string, RoadmapNode>,
  edges: RoadmapEdge[],
): { roots: string[]; childrenMap: Record<string, string[]> } {
  const childrenMap: Record<string, string[]> = {};
  const hasParent = new Set<string>();

  for (const edge of edges) {
    if (!childrenMap[edge.source]) {
      childrenMap[edge.source] = [];
    }
    childrenMap[edge.source].push(edge.target);
    hasParent.add(edge.target);
  }

  const roots = Object.keys(nodes).filter((id) => !hasParent.has(id));
  return { roots, childrenMap };
}

function getSubtreeHeight(
  nodeId: string,
  childrenMap: Record<string, string[]>,
  memo: Record<string, number>,
): number {
  if (memo[nodeId] !== undefined) return memo[nodeId];

  const children = childrenMap[nodeId] || [];
  if (children.length === 0) {
    memo[nodeId] = NODE_HEIGHT;
    return NODE_HEIGHT;
  }

  let totalHeight = 0;
  for (const childId of children) {
    totalHeight += getSubtreeHeight(childId, childrenMap, memo);
  }
  totalHeight += (children.length - 1) * SIBLING_GAP;

  memo[nodeId] = Math.max(NODE_HEIGHT, totalHeight);
  return memo[nodeId];
}

function layoutSubtree(
  nodeId: string,
  centerX: number,
  centerY: number,
  direction: 1 | -1,
  childrenMap: Record<string, string[]>,
  heightMemo: Record<string, number>,
  positions: Record<string, { x: number; y: number }>,
): void {
  const subtreeHeight = heightMemo[nodeId];
  const nodeX = centerX - NODE_WIDTH / 2;
  const nodeY = centerY - subtreeHeight / 2;
  positions[nodeId] = { x: nodeX, y: nodeY };

  const children = childrenMap[nodeId] || [];
  if (children.length === 0) return;

  const childCenterX = centerX + direction * LEVEL_GAP;

  let currentY = centerY - subtreeHeight / 2;
  for (const childId of children) {
    const childHeight = heightMemo[childId];
    const childCenterY = currentY + childHeight / 2;
    layoutSubtree(
      childId,
      childCenterX,
      childCenterY,
      direction,
      childrenMap,
      heightMemo,
      positions,
    );
    currentY += childHeight + SIBLING_GAP;
  }
}

export function calculateLayout(
  nodes: Record<string, RoadmapNode>,
  edges: RoadmapEdge[],
): Record<string, { x: number; y: number }> {
  const { roots, childrenMap } = buildTree(nodes, edges);
  const heightMemo: Record<string, number> = {};
  const positions: Record<string, { x: number; y: number }> = {};

  for (const nodeId of Object.keys(nodes)) {
    getSubtreeHeight(nodeId, childrenMap, heightMemo);
  }

  if (roots.length === 0) {
    return positions;
  }

  if (roots.length === 1) {
    const rootId = roots[0];
    const childCount = childrenMap[rootId]?.length ?? 0;
    const leftChildren = Math.ceil(childCount / 2);

    const leftHeight = calculateSideHeight(rootId, childrenMap, heightMemo, 0, leftChildren);
    const rightHeight = calculateSideHeight(
      rootId,
      childrenMap,
      heightMemo,
      leftChildren,
      childCount,
    );

    const totalHeight = Math.max(heightMemo[rootId], leftHeight, rightHeight);
    const centerY = totalHeight / 2;

    layoutSubtreeSplit(rootId, 0, centerY, childrenMap, heightMemo, positions, leftChildren);
  } else {
    let totalHeight = 0;
    for (const rootId of roots) {
      totalHeight += heightMemo[rootId];
    }
    totalHeight += (roots.length - 1) * SIBLING_GAP * 2;

    let currentY = -totalHeight / 2;
    for (let i = 0; i < roots.length; i++) {
      const rootId = roots[i];
      const subtreeHeight = heightMemo[rootId];
      const centerY = currentY + subtreeHeight / 2;

      if (i % 2 === 0) {
        layoutSubtree(rootId, -LEVEL_GAP / 2, centerY, -1, childrenMap, heightMemo, positions);
      } else {
        layoutSubtree(rootId, LEVEL_GAP / 2, centerY, 1, childrenMap, heightMemo, positions);
      }

      currentY += subtreeHeight + SIBLING_GAP * 2;
    }
  }

  return positions;
}

function calculateSideHeight(
  nodeId: string,
  childrenMap: Record<string, string[]>,
  heightMemo: Record<string, number>,
  startIndex: number,
  endIndex: number,
): number {
  const children = childrenMap[nodeId] || [];
  const sliced = children.slice(startIndex, endIndex);

  let totalHeight = 0;
  for (const childId of sliced) {
    totalHeight += heightMemo[childId];
  }
  totalHeight += Math.max(0, sliced.length - 1) * SIBLING_GAP;
  return Math.max(0, totalHeight);
}

function layoutSubtreeSplit(
  nodeId: string,
  centerX: number,
  centerY: number,
  childrenMap: Record<string, string[]>,
  heightMemo: Record<string, number>,
  positions: Record<string, { x: number; y: number }>,
  splitIndex: number,
): void {
  const subtreeHeight = heightMemo[nodeId];
  const nodeX = centerX - NODE_WIDTH / 2;
  const nodeY = centerY - subtreeHeight / 2;
  positions[nodeId] = { x: nodeX, y: nodeY };

  const children = childrenMap[nodeId] || [];
  if (children.length === 0) return;

  const leftChildren = children.slice(0, splitIndex);
  const rightChildren = children.slice(splitIndex);

  const leftHeight =
    leftChildren.reduce((sum, id) => sum + heightMemo[id], 0) +
    Math.max(0, leftChildren.length - 1) * SIBLING_GAP;
  const rightHeight =
    rightChildren.reduce((sum, id) => sum + heightMemo[id], 0) +
    Math.max(0, rightChildren.length - 1) * SIBLING_GAP;

  if (leftChildren.length > 0) {
    let currentY = centerY - leftHeight / 2;
    for (const childId of leftChildren) {
      const childHeight = heightMemo[childId];
      const childCenterY = currentY + childHeight / 2;
      layoutSubtree(
        childId,
        centerX - LEVEL_GAP,
        childCenterY,
        -1,
        childrenMap,
        heightMemo,
        positions,
      );
      currentY += childHeight + SIBLING_GAP;
    }
  }

  if (rightChildren.length > 0) {
    let currentY = centerY - rightHeight / 2;
    for (const childId of rightChildren) {
      const childHeight = heightMemo[childId];
      const childCenterY = currentY + childHeight / 2;
      layoutSubtree(
        childId,
        centerX + LEVEL_GAP,
        childCenterY,
        1,
        childrenMap,
        heightMemo,
        positions,
      );
      currentY += childHeight + SIBLING_GAP;
    }
  }
}

function findParentNode(edges: RoadmapEdge[], nodeId: string): string | null {
  const edge = edges.find((e) => e.target === nodeId);
  return edge ? edge.source : null;
}

function getChildren(edges: RoadmapEdge[], nodeId: string): string[] {
  return edges.filter((e) => e.source === nodeId).map((e) => e.target);
}

export function getNewSiblingPosition(
  nodes: Record<string, RoadmapNode>,
  edges: RoadmapEdge[],
  selectedNodeId: string,
): { x: number; y: number } {
  const selectedNode = nodes[selectedNodeId];
  if (!selectedNode) return { x: 0, y: 0 };

  const parentId = findParentNode(edges, selectedNodeId);

  if (!parentId) {
    const rootIds = Object.keys(nodes).filter((id) => !edges.some((e) => e.target === id));
    const rightmostX = rootIds.reduce((max, id) => {
      const x = nodes[id]?.position.x ?? 0;
      return x > max ? x : max;
    }, -Infinity);
    return {
      x: rightmostX === -Infinity ? 0 : rightmostX,
      y: selectedNode.position.y + NODE_HEIGHT + SIBLING_GAP,
    };
  }

  const siblings = getChildren(edges, parentId).filter((id) => id !== selectedNodeId);

  if (siblings.length === 0) {
    return {
      x: selectedNode.position.x,
      y: selectedNode.position.y + NODE_HEIGHT + SIBLING_GAP,
    };
  }

  const rightmostY = siblings.reduce((max, id) => {
    const y = nodes[id]?.position.y ?? 0;
    return y > max ? y : max;
  }, selectedNode.position.y);

  return {
    x: selectedNode.position.x,
    y: rightmostY + NODE_HEIGHT + SIBLING_GAP,
  };
}

export function getNewChildPosition(
  nodes: Record<string, RoadmapNode>,
  edges: RoadmapEdge[],
  parentId: string,
): { x: number; y: number } {
  const parentNode = nodes[parentId];
  if (!parentNode) return { x: 200, y: 0 };

  const existingChildren = getChildren(edges, parentId);

  const isLeftSide = parentNode.position.x < 0;
  const direction = isLeftSide ? -1 : 1;

  if (existingChildren.length === 0) {
    return {
      x: parentNode.position.x + direction * LEVEL_GAP,
      y: parentNode.position.y,
    };
  }

  const rightmostY = existingChildren.reduce((max, id) => {
    const y = nodes[id]?.position.y ?? 0;
    return y > max ? y : max;
  }, parentNode.position.y);

  return {
    x: parentNode.position.x + direction * LEVEL_GAP,
    y: rightmostY + NODE_HEIGHT + SIBLING_GAP,
  };
}
