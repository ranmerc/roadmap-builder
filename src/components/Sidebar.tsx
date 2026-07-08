import { useState } from "react";
import Markdown from "react-markdown";
import type { Roadmap } from "../types";

type Props = {
  nodeId: string;
  roadmap: Roadmap;
  isEditorMode: boolean;
  isCompleted: boolean;
  onClose: () => void;
  onToggleComplete: () => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateTitle: (title: string) => void;
  onDeleteNode: () => void;
};

export function Sidebar({
  nodeId,
  roadmap,
  isEditorMode,
  isCompleted,
  onClose,
  onToggleComplete,
  onUpdateNotes,
  onUpdateTitle,
  onDeleteNode,
}: Props) {
  const node = roadmap.nodes[nodeId];
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node?.title ?? "");
  const [editNotes, setEditNotes] = useState(node?.notes ?? "");

  if (!node) return null;

  const handleSave = () => {
    onUpdateTitle(editTitle);
    onUpdateNotes(editNotes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(node.title);
    setEditNotes(node.notes);
    setIsEditing(false);
  };

  return (
    <div className="w-80 border-l border-slate-200 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 className="font-semibold text-slate-900 truncate">{node.title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {!isEditorMode && (
          <div className="mb-4">
            <button
              onClick={onToggleComplete}
              className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                isCompleted
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {isCompleted ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Completed
                </>
              ) : (
                "Mark as Complete"
              )}
            </button>
          </div>
        )}

        {isEditorMode && (
          <div className="mb-4 flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  onClick={onDeleteNode}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Delete Node
                </button>
              </>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
          {isEditorMode && isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          ) : (
            <p className="text-slate-900">{node.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Notes</label>
          {isEditorMode && isEditing ? (
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add notes in Markdown..."
              className="w-full h-64 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-sm"
            />
          ) : node.notes ? (
            <div className="prose prose-sm prose-slate max-w-none">
              <Markdown>{node.notes}</Markdown>
            </div>
          ) : (
            <p className="text-slate-400 italic">No notes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
