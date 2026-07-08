# Roadmap Tracker – Progress Checklist

## Phase 1: Foundation & Setup

- [x] **1.1** Configure TypeScript, Vite, Tailwind CSS
- [x] **1.2** Set up Zustand store for roadmap state management
- [x] **1.3** Set up Local Storage persistence layer (roadmaps + progress collections)
- [x] **1.4** Add react-markdown for Markdown rendering
- [x] **1.5** Create type definitions (Roadmap, RoadmapNode, RoadmapEdge, Progress)
- [x] **1.6** Create mapper utilities (Domain Model ↔ React Flow nodes/edges)
- [x] **1.7** Set up React Flow provider and base configuration

## Phase 2: Dashboard

- [x] **2.1** Create Dashboard page/component (table layout)
- [x] **2.2** Display roadmap list: name, progress %, last modified
- [x] **2.3** Implement global actions: Create, Import Roadmap, Import Progress, Import Complete
- [x] **2.4** Implement per-roadmap actions: Open, Edit, Export Roadmap, Export Progress, Export Complete, Delete
- [x] **2.5** Empty state: show Create/Import options when no roadmaps exist
- [x] **2.6** Progress calculation utility (completed / total nodes)
- [x] **2.7** Date formatting for "Last modified"

## Phase 3: React Flow Integration & Custom Nodes

- [x] **3.1** Create custom React Flow node component (RoadmapNode)
- [x] **3.2** Node visual: title, checkbox (default view), connection handles
- [x] **3.3** Node types: default (editable in Edit Mode), read-only (default view)
- [x] **3.8** Smart edge routing: edges connect to left/right/top/bottom handles based on relative node position
- [x] **3.4** Implement node selection → open sidebar with node details
- [x] **3.5** Implement edge rendering (smooth curved edges)
- [x] **3.6** Add mini-map, controls, background for React Flow
- [x] **3.7** Handle zoom/pan in both modes

## Phase 4: Edit Mode

- [x] **4.1** Create Editor page/view with React Flow
- [x] **4.2** Add node: keyboard shortcuts (Enter=sibling, Tab=child)
- [x] **4.3** Delete node: delete key → removes node + edges
- [x] **4.4** Rename node: inline edit in sidebar
- [x] **4.5** Move node: drag (React Flow handles, persist position on drag end)
- [x] **4.6** Connect nodes: drag from handle to handle (React Flow)
- [x] **4.7** Disconnect nodes: delete edge (keyboard)
- [x] **4.8** Node details sidebar: Markdown editor for notes (Edit Mode)
- [x] **4.9** Save roadmap: persist to Local Storage + exit Edit Mode
- [x] **4.10** Export roadmap: download JSON (roadmap definition only)
- [x] **4.11** Export complete: download JSON (roadmap + progress)
- [x] **4.12** Header: roadmap name, save button, keyboard hints, "Edit Roadmap" toggle
- [x] **4.13** Add Root Node button (shown only when roadmap is empty)
- [x] **4.14** Undo/redo in Edit Mode: Ctrl+Z / Cmd+Z undo, Ctrl+Shift+Z / Cmd+Shift+Z / Ctrl+Y / Cmd+Y redo
- [x] **4.15** Edge operations (connect/disconnect) immediately persist to store for consistent undo/redo tracking

## Phase 5: Progress Tracking (Default View)

- [x] **5.1** Create default view with React Flow (read-only structure)
- [x] **5.2** Disable node dragging, edge creation, node editing
- [x] **5.3** Node checkbox: toggle completion state
- [x] **5.4** Progress calculation: real-time percentage display in header
- [x] **5.5** Persist progress immediately on checkbox toggle
- [x] **5.6** Node details sidebar: render Markdown notes (read-only)
- [x] **5.7** Click node → open sidebar with details
- [x] **5.8** Header: roadmap name, progress %, toggle to Edit Mode
- [x] **5.9** Visual indicators: completed nodes (strikethrough, checkmark, green fill)
- [x] **5.10** Selected node indicator: blue border + ring highlight

## Phase 6: Import / Export

- [x] **6.1** Import Roadmap: file input → parse JSON → create roadmap + empty progress
- [x] **6.2** Import Progress: file input → parse JSON → match by node IDs → merge progress
- [x] **6.3** Import Complete: file input → parse JSON → restore roadmap + progress + layout
- [x] **6.4** Export Roadmap: download JSON (roadmap only)
- [x] **6.5** Export Progress: download JSON (progress only)
- [x] **6.6** Export Complete: download JSON (roadmap + progress)
- [x] **6.7** File naming convention: `{name}-roadmap.json`, `{name}-progress.json`, `{name}-complete.json`
- [x] **6.8** Validation: check required fields, handle missing node IDs gracefully

## Phase 7: Data Persistence & Progress Rules

- [x] **7.1** Local Storage service: save/load roadmaps collection
- [x] **7.2** Local Storage service: save/load progress collection
- [x] **7.3** UUID generation for nodes (crypto.randomUUID)
- [x] **7.4** Progress preservation rules on roadmap edit:
  - [x] Node renamed → preserve progress
  - [x] Node moved → preserve progress
  - [x] Edge added/removed → preserve progress
  - [x] New node added → initialize as incomplete
  - [x] Node deleted → remove associated progress
  - [x] Node ID changed → treat as new node
- [x] **7.5** Auto-save on changes (debounced for roadmap, immediate for progress)

## Phase 8: UI/UX Polish

- [ ] **8.1** Responsive layout (mobile-friendly dashboard, sidebar collapse)
- [x] **8.2** Keyboard shortcuts: Enter (sibling), Tab (child), Delete (node)
- [ ] **8.3** Loading states for imports
- [ ] **8.4** Error toasts for failed imports/exports
- [x] **8.5** Confirmation dialogs for destructive actions (delete roadmap, delete node)
- [ ] **8.6** Empty state illustrations for dashboard and editor
- [ ] **8.7** Progress bar component (reusable)
- [ ] **8.8** Markdown rendering with syntax highlighting (code blocks)
- [x] **8.9** Mind-map layout algorithm (root center, branches outward)
- [x] **8.10** Position persistence on drag end
- [x] **8.11** Smooth curved edges (getSmoothStepPath)
- [x] **8.12** Selected node visual indicator (blue border + ring)
- [x] **8.13** Save button exits Edit Mode after saving
- [x] **8.14** Undo/redo keyboard shortcuts (Ctrl+Z/Cmd+Z, Ctrl+Shift+Z/Cmd+Shift+Z, Ctrl+Y/Cmd+Y)
- [x] **8.15** Smart edge handle routing (edges connect to left/right/top/bottom based on node position)

## Phase 9: Testing & Verification

- [x] **9.1** Run typecheck (`npm run build`)
- [x] **9.2** Run lint (`npm run lint`)
- [x] **9.3** Run format check (`npm run fmt:check`)
- [ ] **9.4** Manual test: Create → Edit → Save → Open Study → Complete nodes → Export/Import
- [ ] **9.5** Manual test: Edit roadmap after progress exists → verify progress preserved
- [ ] **9.6** Manual test: Import progress into modified roadmap → verify matching
- [ ] **9.7** Manual test: Import complete roadmap → verify full restore
- [ ] **9.8** Verify Local Storage persistence across browser sessions

---

## Notes

- **MVP scope**: Phases 1-7 are core MVP. Phases 8-9 are polish/verification.
- **Order**: Some tasks can be parallelized within phases.
- **Dependencies**: Phase 3 depends on Phase 1. Phase 4 & 5 depend on Phase 3. Phase 6 depends on Phase 7.
- **Design reference**: Mind-map style layout (root center, branches outward, curved edges)
