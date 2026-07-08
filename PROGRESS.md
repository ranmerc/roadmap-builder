# Roadmap Tracker – Progress Checklist

## Phase 1: Foundation & Setup

- [ ] **1.1** Configure TypeScript, Vite, Tailwind CSS
- [ ] **1.2** Set up Zustand store for roadmap state management
- [ ] **1.3** Set up Local Storage persistence layer (roadmaps + progress collections)
- [ ] **1.4** Add react-markdown for Markdown rendering
- [ ] **1.5** Create type definitions (Roadmap, RoadmapNode, RoadmapEdge, Progress)
- [ ] **1.6** Create mapper utilities (Domain Model ↔ React Flow nodes/edges)
- [ ] **1.7** Set up React Flow provider and base configuration

## Phase 2: Dashboard

- [ ] **2.1** Create Dashboard page/component (table layout)
- [ ] **2.2** Display roadmap list: name, progress %, last modified
- [ ] **2.3** Implement global actions: Create, Import Roadmap, Import Progress, Import Complete
- [ ] **2.4** Implement per-roadmap actions: Open, Edit, Export Roadmap, Export Progress, Export Complete, Delete
- [ ] **2.5** Empty state: show Create/Import options when no roadmaps exist
- [ ] **2.6** Progress calculation utility (completed / total nodes)
- [ ] **2.7** Date formatting for "Last modified"

## Phase 3: React Flow Integration & Custom Nodes

- [ ] **3.1** Create custom React Flow node component (RoadmapNode)
- [ ] **3.2** Node visual: title, checkbox (Study Mode), connection handles
- [ ] **3.3** Node types: default (editable in Editor), read-only (Study Mode)
- [ ] **3.4** Implement node selection → open sidebar with node details
- [ ] **3.5** Implement edge rendering (React Flow default edges)
- [ ] **3.6** Add mini-map, controls, background for React Flow
- [ ] **3.7** Handle zoom/pan in both modes

## Phase 4: Editor Mode

- [ ] **4.1** Create Editor page/view with React Flow
- [ ] **4.2** Add node: context menu or toolbar button → creates node with UUID
- [ ] **4.3** Delete node: delete key or context menu → removes node + edges
- [ ] **4.4** Rename node: double-click or inline edit on node
- [ ] **4.5** Move node: drag (React Flow handles, persist position on drag end)
- [ ] **4.6** Connect nodes: drag from handle to handle (React Flow)
- [ ] **4.7** Disconnect nodes: delete edge (keyboard or context menu)
- [ ] **4.8** Node details sidebar: Markdown editor for notes (Editor Mode)
- [ ] **4.9** Save roadmap: persist to Local Storage (roadmap + empty progress)
- [ ] **4.10** Export roadmap: download JSON (roadmap definition only)
- [ ] **4.11** Export complete: download JSON (roadmap + progress)
- [ ] **4.12** Header: roadmap name, save button, toggle to Study Mode

## Phase 5: Study Mode

- [ ] **5.1** Create Study page/view with React Flow (read-only)
- [ ] **5.2** Disable node dragging, edge creation, node editing
- [ ] **5.3** Node checkbox: toggle completion state
- [ ] **5.4** Progress calculation: real-time percentage display
- [ ] **5.5** Persist progress immediately on checkbox toggle
- [ ] **5.6** Node details sidebar: render Markdown notes (read-only)
- [ ] **5.7** Click node → open sidebar with details
- [ ] **5.8** Header: roadmap name, progress %, toggle to Editor Mode
- [ ] **5.8** Visual indicators: completed nodes (strikethrough, checkmark, muted color)

## Phase 6: Import / Export

- [ ] **6.1** Import Roadmap: file input → parse JSON → create roadmap + empty progress
- [ ] **6.2** Import Progress: file input → parse JSON → match by node IDs → merge progress
- [ ] **6.3** Import Complete: file input → parse JSON → restore roadmap + progress + layout
- [ ] **6.4** Export Roadmap: download JSON (roadmap only)
- [ ] **6.5** Export Progress: download JSON (progress only)
- [ ] **6.6** Export Complete: download JSON (roadmap + progress)
- [ ] **6.7** File naming convention: `{name}-roadmap.json`, `{name}-progress.json`, `{name}-complete.json`
- [ ] **6.8** Validation: check required fields, handle missing node IDs gracefully

## Phase 7: Data Persistence & Progress Rules

- [ ] **7.1** Local Storage service: save/load roadmaps collection
- [ ] **7.2** Local Storage service: save/load progress collection
- [ ] **7.3** UUID generation for nodes (crypto.randomUUID)
- [ ] **7.4** Progress preservation rules on roadmap edit:
  - [ ] Node renamed → preserve progress
  - [ ] Node moved → preserve progress
  - [ ] Edge added/removed → preserve progress
  - [ ] New node added → initialize as incomplete
  - [ ] Node deleted → remove associated progress
  - [ ] Node ID changed → treat as new node
- [ ] **7.5** Auto-save on changes (debounced for roadmap, immediate for progress)

## Phase 8: UI/UX Polish

- [ ] **8.1** Responsive layout (mobile-friendly dashboard, sidebar collapse)
- [ ] **8.2** Keyboard shortcuts: delete node, save, zoom
- [ ] **8.3** Loading states for imports
- [ ] **8.4** Error toasts for failed imports/exports
- [ ] **8.5** Confirmation dialogs for destructive actions (delete roadmap, delete node)
- [ ] **8.6** Empty state illustrations for dashboard and editor
- [ ] **8.7** Progress bar component (reusable)
- [ ] **8.8** Markdown rendering with syntax highlighting (code blocks)

## Phase 9: Testing & Verification

- [ ] **9.1** Run typecheck (`npm run build`)
- [ ] **9.2** Run lint (`npm run lint`)
- [ ] **9.3** Run format check (`npm run fmt:check`)
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
- **Design reference**: roadmap.sh visual style (clean, category-colored nodes, sidebar on click)