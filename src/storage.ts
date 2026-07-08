import type { Roadmap, Progress } from "./types";

const ROADMAPS_KEY = "roadmap-tracker-roadmaps";
const PROGRESS_KEY = "roadmap-tracker-progress";

export const storage = {
  getRoadmaps(): Record<string, Roadmap> {
    try {
      const data = localStorage.getItem(ROADMAPS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveRoadmaps(roadmaps: Record<string, Roadmap>): void {
    localStorage.setItem(ROADMAPS_KEY, JSON.stringify(roadmaps));
  },

  getProgress(): Record<string, Progress> {
    try {
      const data = localStorage.getItem(PROGRESS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveProgress(progress: Record<string, Progress>): void {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  },
};
