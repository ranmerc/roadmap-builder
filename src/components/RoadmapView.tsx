import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type OnNodeDrag,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useRoadmapStore } from "../store";
import {
  roadmapToFlow,
  flowToRoadmap,
  getHandlePositions,
  type RoadmapFlowNode,
  type RoadmapFlowEdge,
} from "../mapper";
import { nodeTypes } from "../nodes";
import { Sidebar } from "./Sidebar";
import { calculateLayout, getNewSiblingPosition, getNewChildPosition } from "../layout";
import type { Roadmap } from "../types";

function findParent(edges: { source: string; target: string }[], nodeId: string): string | null {
  const edge = edges.find((e) => e.target === nodeId);
  return edge ? edge.source : null;
}

export function RoadmapView() {
  const {
    currentRoadmapId,
    roadmaps,
    progress,
    updateRoadmap,
    updateNode,
    toggleNodeCompletion,
    setCurrentRoadmap,
  } = useRoadmapStore();

  const roadmap = currentRoadmapId ? roadmaps[currentRoadmapId] : null;
  const roadmapProgress = currentRoadmapId ? progress[currentRoadmapId] : null;

  const [isEditorMode, setIsEditorMode] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const lastRoadmapIdRef = useRef<string | null>(null);
  const nodesRef = useRef<RoadmapFlowNode[]>([]);
  const edgesRef = useRef<RoadmapFlowEdge[]>([]);

  const undoStack = useRef<Roadmap[]>([]);
  const redoStack = useRef<Roadmap[]>([]);
  const [rebuildKey, setRebuildKey] = useState(0);

  const completed = useMemo(() => roadmapProgress?.completed ?? {}, [roadmapProgress]);

  const snapshotForUndo = useCallback(() => {
    if (!currentRoadmapId) return;
    const state = useRoadmapStore.getState();
    const current = state.roadmaps[currentRoadmapId];
    if (current) {
      undoStack.current.push(JSON.parse(JSON.stringify(current)));
      redoStack.current = [];
    }
  }, [currentRoadmapId]);

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0 || !currentRoadmapId) return;
    const state = useRoadmapStore.getState();
    const current = state.roadmaps[currentRoadmapId];
    if (current) {
      redoStack.current.push(JSON.parse(JSON.stringify(current)));
    }
    const previous = undoStack.current.pop()!;
    updateRoadmap(previous);
    setRebuildKey((k) => k + 1);
  }, [currentRoadmapId, updateRoadmap]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0 || !currentRoadmapId) return;
    const state = useRoadmapStore.getState();
    const current = state.roadmaps[currentRoadmapId];
    if (current) {
      undoStack.current.push(JSON.parse(JSON.stringify(current)));
    }
    const next = redoStack.current.pop()!;
    updateRoadmap(next);
    setRebuildKey((k) => k + 1);
  }, [currentRoadmapId, updateRoadmap]);

  useEffect(() => {
    if (!isEditorMode) {
      undoStack.current = [];
      redoStack.current = [];
    }
  }, [isEditorMode]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleToggleComplete = useCallback(
    (nodeId: string) => {
      if (currentRoadmapId) {
        toggleNodeCompletion(currentRoadmapId, nodeId);
      }
    },
    [currentRoadmapId, toggleNodeCompletion],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<RoadmapFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RoadmapFlowEdge>([]);

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      const removals = changes.filter(
        (c): c is { type: "remove"; id: string } => c.type === "remove",
      );
      if (removals.length > 0 && roadmap && currentRoadmapId) {
        snapshotForUndo();
        const removedIds = new Set(removals.map((c) => c.id));
        const updatedRoadmap = {
          ...roadmap,
          edges: roadmap.edges.filter((e) => !removedIds.has(e.id)),
          updatedAt: new Date().toISOString(),
        };
        updateRoadmap(updatedRoadmap);
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, snapshotForUndo, roadmap, currentRoadmapId, updateRoadmap],
  );

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    if (!roadmap) return;
    if (lastRoadmapIdRef.current === roadmap.id) return;
    lastRoadmapIdRef.current = roadmap.id;

    const positions = calculateLayout(roadmap.nodes, roadmap.edges);
    const positionedRoadmap = {
      ...roadmap,
      nodes: Object.fromEntries(
        Object.entries(roadmap.nodes).map(([id, node]) => [
          id,
          { ...node, position: positions[id] ?? node.position },
        ]),
      ),
    };

    const { nodes: newNodes, edges: newEdges } = roadmapToFlow(
      positionedRoadmap,
      completed,
      isEditorMode,
      selectedNodeId,
      handleNodeClick,
      handleToggleComplete,
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [roadmap?.id]);

  useEffect(() => {
    if (!roadmap) return;
    if (lastRoadmapIdRef.current !== roadmap.id) return;

    const currentFlowNodeIds = new Set(nodes.map((n) => n.id));
    const roadmapNodeIds = new Set(Object.keys(roadmap.nodes));

    const hasStructuralChange =
      currentFlowNodeIds.size !== roadmapNodeIds.size ||
      [...roadmapNodeIds].some((id) => !currentFlowNodeIds.has(id));

    if (hasStructuralChange || rebuildKey > 0) {
      setRebuildKey(0);
      const positions = calculateLayout(roadmap.nodes, roadmap.edges);
      const { nodes: newNodes, edges: newEdges } = roadmapToFlow(
        {
          ...roadmap,
          nodes: Object.fromEntries(
            Object.entries(roadmap.nodes).map(([id, node]) => [
              id,
              { ...node, position: positions[id] ?? node.position },
            ]),
          ),
        },
        completed,
        isEditorMode,
        selectedNodeId,
        handleNodeClick,
        handleToggleComplete,
      );
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [roadmap, completed, isEditorMode, selectedNodeId, handleNodeClick, handleToggleComplete, rebuildKey]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isCompleted: completed[n.id] ?? false },
      })),
    );
  }, [completed, setNodes]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isEditorMode },
      })),
    );
  }, [isEditorMode, setNodes]);

  useEffect(() => {
    if (selectedNodeId === null) return;
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isSelected: selectedNodeId === n.id },
      })),
    );
  }, [selectedNodeId, setNodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isEditorMode || !roadmap || !currentRoadmapId) return;
      snapshotForUndo();
      const sourceNode = roadmap.nodes[connection.source];
      const targetNode = roadmap.nodes[connection.target];
      const handles = sourceNode && targetNode
        ? getHandlePositions(sourceNode.position, targetNode.position)
        : null;

      const edgeId = `${connection.source}->${connection.target}`;

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: edgeId,
            type: "smooth",
            ...(handles && !connection.targetHandle ? { targetHandle: handles.targetHandle } : {}),
          },
          eds,
        ),
      );

      const updatedRoadmap = {
        ...roadmap,
        edges: [
          ...roadmap.edges,
          { id: edgeId, source: connection.source, target: connection.target },
        ],
        updatedAt: new Date().toISOString(),
      };
      updateRoadmap(updatedRoadmap);
    },
    [isEditorMode, roadmap, currentRoadmapId, setEdges, updateRoadmap, snapshotForUndo],
  );

  const handleDragStop: OnNodeDrag = useCallback(
    (_, node) => {
      if (!roadmap || !currentRoadmapId) return;
      const roadmapNode = roadmap.nodes[node.id];
      if (!roadmapNode) return;
      if (
        roadmapNode.position.x === node.position.x &&
        roadmapNode.position.y === node.position.y
      ) {
        return;
      }
      snapshotForUndo();
      const updatedRoadmap = {
        ...roadmap,
        nodes: {
          ...roadmap.nodes,
          [node.id]: {
            ...roadmapNode,
            position: { x: node.position.x, y: node.position.y },
          },
        },
        updatedAt: new Date().toISOString(),
      };
      updateRoadmap(updatedRoadmap);
    },
    [roadmap, currentRoadmapId, updateRoadmap, snapshotForUndo],
  );

  const createNewNode = useCallback(
    (position: { x: number; y: number }, parentId?: string) => {
      if (!roadmap || !currentRoadmapId) return null;
      snapshotForUndo();
      const id = crypto.randomUUID();
      const newNode = {
        id,
        type: "roadmap-node" as const,
        position,
        data: {
          label: "New Node",
          notes: "",
          roadmapNodeId: id,
          isCompleted: false,
          isSelected: false,
          isEditorMode,
          onNodeClick: handleNodeClick,
          onToggleComplete: handleToggleComplete,
        },
      };

      let newEdge: {
        id: string;
        source: string;
        target: string;
        type: "smooth";
        sourceHandle?: string;
        targetHandle?: string;
      } | null = null;

      if (parentId) {
        const parentNode = roadmap.nodes[parentId];
        const handles = parentNode
          ? getHandlePositions(parentNode.position, position)
          : { sourceHandle: "bottom", targetHandle: "top" };
        newEdge = {
          id: `${parentId}->${id}`,
          source: parentId,
          target: id,
          type: "smooth" as const,
          sourceHandle: handles.sourceHandle,
          targetHandle: handles.targetHandle,
        };
      }

      setNodes((nds) => [...nds, newNode]);
      if (newEdge) {
        setEdges((eds) => [...eds, newEdge]);
      }

      const updatedRoadmap = {
        ...roadmap,
        nodes: {
          ...roadmap.nodes,
          [id]: {
            id,
            title: "New Node",
            position,
            notes: "",
          },
        },
        edges: newEdge ? [...roadmap.edges, newEdge] : roadmap.edges,
        updatedAt: new Date().toISOString(),
      };
      updateRoadmap(updatedRoadmap);

      return id;
    },
    [
      roadmap,
      currentRoadmapId,
      setNodes,
      setEdges,
      updateRoadmap,
      isEditorMode,
      handleNodeClick,
      handleToggleComplete,
      snapshotForUndo,
    ],
  );

  const handleAddSibling = useCallback(() => {
    if (!selectedNodeId || !roadmap) return;
    const position = getNewSiblingPosition(roadmap.nodes, roadmap.edges, selectedNodeId);
    const parentId = findParent(roadmap.edges, selectedNodeId);
    const newId = createNewNode(position, parentId ?? undefined);
    if (newId) {
      setSelectedNodeId(newId);
    }
  }, [selectedNodeId, roadmap, createNewNode]);

  const handleAddChild = useCallback(() => {
    if (!selectedNodeId || !roadmap) return;
    const position = getNewChildPosition(roadmap.nodes, roadmap.edges, selectedNodeId);
    const newId = createNewNode(position, selectedNodeId);
    if (newId) {
      setSelectedNodeId(newId);
    }
  }, [selectedNodeId, roadmap, createNewNode]);

  const handleAddRootNode = useCallback(() => {
    if (!roadmap) return;
    const existingCount = Object.keys(roadmap.nodes).length;
    const position = { x: 100 + existingCount * 250, y: 100 };
    const newId = createNewNode(position);
    if (newId) {
      setSelectedNodeId(newId);
    }
  }, [roadmap, createNewNode]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if ((isMod && e.key === "z" && e.shiftKey) || (isMod && e.key === "y")) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (!isEditorMode) return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddSibling();
      } else if (e.key === "Tab") {
        e.preventDefault();
        handleAddChild();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNodeId) {
          e.preventDefault();
          if (roadmap?.nodes[selectedNodeId]) {
            handleDeleteNode(selectedNodeId);
          }
        }
      }
    },
    [isEditorMode, selectedNodeId, handleAddSibling, handleAddChild, roadmap, handleUndo, handleRedo],
  );

  useEffect(() => {
    const wrapper = reactFlowWrapper.current;
    if (!wrapper) return;
    wrapper.addEventListener("keydown", handleKeyDown);
    return () => wrapper.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSave = useCallback(() => {
    if (!roadmap || !currentRoadmapId) return;
    const updatedRoadmap = flowToRoadmap(
      nodesRef.current,
      edgesRef.current,
      currentRoadmapId,
      roadmap,
    );
    updateRoadmap(updatedRoadmap);
    setIsEditorMode(false);
  }, [roadmap, currentRoadmapId, updateRoadmap]);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (!roadmap || !currentRoadmapId) return;
      snapshotForUndo();
      const { [nodeId]: _, ...remainingNodes } = roadmap.nodes;
      const remainingEdges = roadmap.edges.filter(
        (e: { source: string; target: string }) => e.source !== nodeId && e.target !== nodeId,
      );
      const updatedRoadmap = {
        ...roadmap,
        nodes: remainingNodes,
        edges: remainingEdges,
        updatedAt: new Date().toISOString(),
      };
      updateRoadmap(updatedRoadmap);
      setSelectedNodeId(null);
    },
    [roadmap, currentRoadmapId, updateRoadmap, snapshotForUndo],
  );

  const progressPercent = useMemo(() => {
    if (!roadmap) return 0;
    const total = Object.keys(roadmap.nodes).length;
    if (total === 0) return 0;
    const completedCount = Object.values(completed).filter(Boolean).length;
    return Math.round((completedCount / total) * 100);
  }, [roadmap, completed]);

  const hasNodes = useMemo(() => roadmap && Object.keys(roadmap.nodes).length > 0, [roadmap]);

  if (!roadmap) return null;

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentRoadmap(null)}
            className="text-slate-600 hover:text-slate-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-slate-900">{roadmap.name}</h1>
          {!isEditorMode && (
            <span className="text-sm text-slate-500">{progressPercent}% complete</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEditorMode ? (
            <>
              {!hasNodes && (
                <button
                  onClick={handleAddRootNode}
                  className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Add Root Node
                </button>
              )}
              {hasNodes && (
                <span className="text-xs text-slate-400 mr-2">
                  Enter: sibling | Tab: child | Del: delete
                </span>
              )}
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditorMode(true)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Edit Roadmap
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 flex" ref={reactFlowWrapper} tabIndex={0}>
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            nodeTypes={nodeTypes}
            onNodesChange={isEditorMode ? onNodesChange : undefined}
            edges={edges}
            onEdgesChange={isEditorMode ? handleEdgesChange : undefined}
            onConnect={onConnect}
            onNodeClick={(_e, node) => handleNodeClick(node.id)}
            onNodeDragStop={isEditorMode ? handleDragStop : undefined}
            nodesDraggable={isEditorMode}
            nodesConnectable={isEditorMode}
            elementsSelectable={true}
            fitView
          >
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </div>
        {selectedNodeId && (
          <Sidebar
            nodeId={selectedNodeId}
            roadmap={roadmap}
            isEditorMode={isEditorMode}
            isCompleted={completed[selectedNodeId] ?? false}
            onClose={() => setSelectedNodeId(null)}
            onToggleComplete={() => handleToggleComplete(selectedNodeId)}
            onUpdateNotes={(notes) => {
              if (currentRoadmapId && selectedNodeId) {
                snapshotForUndo();
                updateNode(currentRoadmapId, selectedNodeId, { notes });
              }
            }}
            onUpdateTitle={(title) => {
              if (currentRoadmapId && selectedNodeId) {
                snapshotForUndo();
                updateNode(currentRoadmapId, selectedNodeId, { title });
              }
            }}
            onDeleteNode={() => {
              if (
                confirm(`Delete "${roadmap.nodes[selectedNodeId]?.title}"? This cannot be undone.`)
              ) {
                handleDeleteNode(selectedNodeId);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
