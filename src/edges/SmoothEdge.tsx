import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export function SmoothEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 20,
  });

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{ ...style, strokeWidth: 2, stroke: "#94a3b8" }}
    />
  );
}
