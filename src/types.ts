export type RoadmapNode = {
  id: string;
  title: string;
  position: {
    x: number;
    y: number;
  };
  notes: string;
};

export type RoadmapEdge = {
  id: string;
  source: string;
  target: string;
};

export type Roadmap = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodes: Record<string, RoadmapNode>;
  edges: RoadmapEdge[];
};

export type Progress = {
  roadmapId: string;
  completed: Record<string, boolean>;
};
