import { create } from "zustand";
import type { Roadmap, RoadmapNode, Progress } from "./types";
import { storage } from "./storage";

type RoadmapStore = {
  roadmaps: Record<string, Roadmap>;
  progress: Record<string, Progress>;
  currentRoadmapId: string | null;

  loadFromStorage: () => void;

  createRoadmap: (name: string) => string;
  updateRoadmap: (roadmap: Roadmap) => void;
  deleteRoadmap: (id: string) => void;
  importRoadmap: (roadmap: Roadmap) => void;

  updateNode: (
    roadmapId: string,
    nodeId: string,
    updates: Partial<Pick<RoadmapNode, "title" | "notes">>,
  ) => void;

  getProgress: (roadmapId: string) => Progress;
  toggleNodeCompletion: (roadmapId: string, nodeId: string) => void;
  importProgress: (progress: Progress) => void;

  setCurrentRoadmap: (id: string | null) => void;
};

export const useRoadmapStore = create<RoadmapStore>((set, get) => ({
  roadmaps: {},
  progress: {},
  currentRoadmapId: null,

  loadFromStorage: () => {
    const roadmaps = storage.getRoadmaps();
    const progress = storage.getProgress();
    set({ roadmaps, progress });
  },

  createRoadmap: (name: string) => {
    const id = crypto.randomUUID();
    const roadmap: Roadmap = {
      id,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: {},
      edges: [],
    };
    const roadmaps = { ...get().roadmaps, [id]: roadmap };
    const progress = {
      ...get().progress,
      [id]: { roadmapId: id, completed: {} },
    };
    set({ roadmaps, progress });
    storage.saveRoadmaps(roadmaps);
    storage.saveProgress(progress);
    return id;
  },

  updateRoadmap: (roadmap: Roadmap) => {
    const roadmaps = { ...get().roadmaps, [roadmap.id]: roadmap };
    set({ roadmaps });
    storage.saveRoadmaps(roadmaps);
  },

  updateNode: (
    roadmapId: string,
    nodeId: string,
    updates: Partial<Pick<RoadmapNode, "title" | "notes">>,
  ) => {
    const roadmap = get().roadmaps[roadmapId];
    if (!roadmap) return;
    const node = roadmap.nodes[nodeId];
    if (!node) return;
    const updatedNode = { ...node, ...updates };
    const updatedRoadmap = {
      ...roadmap,
      nodes: { ...roadmap.nodes, [nodeId]: updatedNode },
      updatedAt: new Date().toISOString(),
    };
    const roadmaps = { ...get().roadmaps, [roadmapId]: updatedRoadmap };
    set({ roadmaps });
    storage.saveRoadmaps(roadmaps);
  },

  deleteRoadmap: (id: string) => {
    const roadmaps = { ...get().roadmaps };
    const progress = { ...get().progress };
    delete roadmaps[id];
    delete progress[id];
    set({ roadmaps, progress });
    storage.saveRoadmaps(roadmaps);
    storage.saveProgress(progress);
  },

  importRoadmap: (roadmap: Roadmap) => {
    const roadmaps = { ...get().roadmaps, [roadmap.id]: roadmap };
    const existingProgress = get().progress[roadmap.id];
    const progress = {
      ...get().progress,
      [roadmap.id]: existingProgress ?? {
        roadmapId: roadmap.id,
        completed: {},
      },
    };
    set({ roadmaps, progress });
    storage.saveRoadmaps(roadmaps);
    storage.saveProgress(progress);
  },

  getProgress: (roadmapId: string) => {
    return get().progress[roadmapId] ?? { roadmapId, completed: {} };
  },

  toggleNodeCompletion: (roadmapId: string, nodeId: string) => {
    const current = get().progress[roadmapId] ?? {
      roadmapId,
      completed: {},
    };
    const completed = {
      ...current.completed,
      [nodeId]: !current.completed[nodeId],
    };
    const progress = { ...get().progress, [roadmapId]: { roadmapId, completed } };
    set({ progress });
    storage.saveProgress(progress);
  },

  importProgress: (progress: Progress) => {
    const existing = get().progress[progress.roadmapId];
    const completed = {
      ...(existing?.completed ?? {}),
      ...progress.completed,
    };
    const allProgress = {
      ...get().progress,
      [progress.roadmapId]: { roadmapId: progress.roadmapId, completed },
    };
    set({ progress: allProgress });
    storage.saveProgress(allProgress);
  },

  setCurrentRoadmap: (id: string | null) => {
    set({ currentRoadmapId: id });
  },
}));
