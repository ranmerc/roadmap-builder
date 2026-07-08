import { ReactFlowProvider } from "@xyflow/react";
import { useRoadmapStore } from "./store";
import { Dashboard } from "./components/Dashboard";
import { RoadmapView } from "./components/RoadmapView";

export default function App() {
  const currentRoadmapId = useRoadmapStore((s) => s.currentRoadmapId);

  return (
    <ReactFlowProvider>
      <div className="h-full flex flex-col">
        {currentRoadmapId ? <RoadmapView /> : <Dashboard />}
      </div>
    </ReactFlowProvider>
  );
}
