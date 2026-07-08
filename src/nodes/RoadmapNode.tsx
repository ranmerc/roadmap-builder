import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { RoadmapNodeData } from "../mapper";

export function RoadmapNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as RoadmapNodeData;

  const handleClick = () => {
    if (nodeData.onNodeClick && nodeData.roadmapNodeId) {
      nodeData.onNodeClick(nodeData.roadmapNodeId);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeData.onToggleComplete && nodeData.roadmapNodeId) {
      nodeData.onToggleComplete(nodeData.roadmapNodeId);
    }
  };

  return (
    <div
      className={`rounded-lg border-2 px-4 py-3 shadow-sm cursor-pointer transition-all ${
        nodeData.isSelected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
          : nodeData.isCompleted
            ? "border-green-500 bg-green-50"
            : "border-slate-200 bg-white hover:border-slate-300"
      }`}
      onClick={handleClick}
    >
      <Handle type="target" position={Position.Top} id="top" className="!bg-slate-400" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-slate-400" />
      <Handle type="target" position={Position.Right} id="right" className="!bg-slate-400" />

      <div className="flex items-center gap-2">
        {!nodeData.isEditorMode && (
          <button
            onClick={handleToggle}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
              nodeData.isCompleted ? "border-green-500 bg-green-500" : "border-slate-300 bg-white"
            }`}
          >
            {nodeData.isCompleted && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
        <span
          className={`text-sm font-medium ${
            nodeData.isCompleted ? "text-green-700 line-through" : "text-slate-700"
          }`}
        >
          {nodeData.label}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-slate-400" />
      <Handle type="source" position={Position.Left} id="left" className="!bg-slate-400" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-slate-400" />
    </div>
  );
}
