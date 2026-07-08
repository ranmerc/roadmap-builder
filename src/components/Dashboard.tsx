import { useEffect, useState } from "react";
import { useRoadmapStore } from "../store";
import type { Roadmap } from "../types";

export function Dashboard() {
  const { roadmaps, progress, loadFromStorage, createRoadmap, deleteRoadmap, setCurrentRoadmap } =
    useRoadmapStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoadmapName, setNewRoadmapName] = useState("");

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleCreate = () => {
    if (newRoadmapName.trim()) {
      const id = createRoadmap(newRoadmapName.trim());
      setNewRoadmapName("");
      setShowCreateModal(false);
      setCurrentRoadmap(id);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.id && data.name && data.nodes && data.edges) {
          useRoadmapStore.getState().importRoadmap(data as Roadmap);
        }
      } catch {
        alert("Invalid roadmap file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportComplete = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.roadmap && data.progress) {
          useRoadmapStore.getState().importRoadmap(data.roadmap);
          useRoadmapStore.getState().importProgress(data.progress);
        }
      } catch {
        alert("Invalid complete roadmap file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExportRoadmap = (roadmap: Roadmap) => {
    const blob = new Blob([JSON.stringify(roadmap, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${roadmap.name.toLowerCase().replace(/\s+/g, "-")}-roadmap.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportProgress = (roadmap: Roadmap) => {
    const prog = progress[roadmap.id];
    if (!prog) return;
    const blob = new Blob([JSON.stringify(prog, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${roadmap.name.toLowerCase().replace(/\s+/g, "-")}-progress.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportComplete = (roadmap: Roadmap) => {
    const prog = progress[roadmap.id] ?? {
      roadmapId: roadmap.id,
      completed: {},
    };
    const data = { roadmap, progress: prog };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${roadmap.name.toLowerCase().replace(/\s+/g, "-")}-complete.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProgressPercent = (roadmapId: string) => {
    const roadmap = roadmaps[roadmapId];
    const prog = progress[roadmapId];
    if (!roadmap || !prog) return 0;
    const total = Object.keys(roadmap.nodes).length;
    if (total === 0) return 0;
    const completed = Object.values(prog.completed).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  const roadmapList = Object.values(roadmaps);

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Roadmaps</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Create Roadmap
            </button>
            <label className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              Import Roadmap
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <label className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              Import Complete
              <input
                type="file"
                accept=".json"
                onChange={handleImportComplete}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {roadmapList.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-slate-500 mb-4">No roadmaps yet</p>
            <p className="text-sm text-slate-400">
              Create a roadmap or import an existing one to get started
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    Progress
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    Last Modified
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {roadmapList.map((roadmap) => (
                  <tr key={roadmap.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setCurrentRoadmap(roadmap.id)}
                        className="text-left font-medium text-slate-900 hover:text-blue-600"
                      >
                        {roadmap.name}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${getProgressPercent(roadmap.id)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-slate-600">
                          {getProgressPercent(roadmap.id)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(roadmap.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setCurrentRoadmap(roadmap.id)}
                          className="px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => setCurrentRoadmap(roadmap.id)}
                          className="px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleExportRoadmap(roadmap)}
                          className="px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded"
                        >
                          Export
                        </button>
                        <button
                          onClick={() => handleExportProgress(roadmap)}
                          className="px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded"
                        >
                          Export Progress
                        </button>
                        <button
                          onClick={() => handleExportComplete(roadmap)}
                          className="px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded"
                        >
                          Export Complete
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${roadmap.name}"? This cannot be undone.`)) {
                              deleteRoadmap(roadmap.id);
                            }
                          }}
                          className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Create Roadmap</h2>
              <input
                type="text"
                value={newRoadmapName}
                onChange={(e) => setNewRoadmapName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Roadmap name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-slate-900"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewRoadmapName("");
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
