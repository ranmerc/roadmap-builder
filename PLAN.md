# Roadmap Tracker – Project Plan

Overview

Roadmap Tracker is an offline-first web application for creating, managing, and tracking custom learning roadmaps.

The application combines the visual layout of roadmap.sh with an intuitive editor and built-in progress tracking.

Users can create their own roadmap, mark individual nodes as complete, save everything locally, and import/export both roadmap definitions and progress.

The application is intentionally focused. It is not a note-taking application or a general-purpose diagramming tool.

⸻

Goals

- Create roadmap diagrams visually.
- Track progress by checking off individual nodes.
- Store all data locally.
- Support importing and exporting roadmaps and progress.
- No authentication.
- No backend.
- Fast, lightweight, and offline-first.

⸻

Core Principles

Roadmaps are reusable

A roadmap represents a learning structure.

Examples:

- Frontend
- Backend
- Interview Preparation
- System Design
- AWS
- Kubernetes

A roadmap should be shareable without containing any user-specific progress.

⸻

Progress is independent

Progress is stored separately from the roadmap definition.

Benefits:

- Share roadmaps without sharing progress.
- Backup progress independently.
- Reset progress without rebuilding the roadmap.
- Edit roadmaps without affecting unrelated progress.

⸻

Offline First

The application should function entirely within the browser.

No backend services.

No authentication.

No cloud storage.

Everything is persisted using Local Storage.

⸻

User Flow

First Visit

If no roadmaps exist:

Display:

- Create Roadmap
- Import Roadmap
- Import Complete Roadmap

If roadmaps exist:

Display a dashboard listing all available roadmaps.

⸻

Dashboard

Each roadmap displays:

- Name
- Progress percentage
- Last modified date

Available actions:

- Open
- Edit
- Export Roadmap
- Export Progress
- Export Complete
- Delete

Global actions:

- Create Roadmap
- Import Roadmap
- Import Progress
- Import Complete Roadmap

Layout: List/table format

⸻

Create Roadmap

The user enters Editor Mode.

The editor allows:

- Add node
- Delete node
- Rename node
- Move node
- Connect nodes
- Disconnect nodes
- Zoom
- Pan
- Edit node details (notes in Markdown)

Saving creates:

- Roadmap Definition
- Empty Progress

⸻

Open Roadmap

Selecting a roadmap opens Study Mode.

Study Mode disables editing.

Clicking a node opens a sidebar with node details (Markdown notes rendered).

A dedicated checkbox on each node toggles its completion state.

Progress updates automatically.

Changes are immediately persisted.

⸻

Edit Roadmap

The user may switch into Editor Mode at any time via a toggle button in the header.

They may:

- Add nodes
- Remove nodes
- Rename nodes
- Move nodes
- Reconnect nodes
- Edit node details (notes in Markdown)

Saving updates the roadmap while preserving progress whenever possible.

⸻

Application Modes

Editor Mode

Purpose:

Create and edit roadmap structure.

Capabilities:

- Editable nodes
- Draggable nodes
- Connect nodes
- Delete nodes
- Rename nodes
- Edit node details (Markdown notes)
- Save
- Export

Completion is not displayed.

⸻

Study Mode

Purpose:

Track learning progress.

Capabilities:

- Toggle node completion via dedicated checkbox
- View overall progress
- Zoom
- Pan
- View node details in sidebar (Markdown notes rendered)
- Switch to Editor Mode via header toggle

Restrictions:

- Nodes cannot move.
- Nodes cannot reconnect.
- Nodes cannot be edited.
- Nodes cannot be deleted.

⸻

Data Model

Roadmap

type Roadmap = {
id: string;
name: string;
createdAt: string;
updatedAt: string;
nodes: Record<string, RoadmapNode>;
edges: RoadmapEdge[];
}

⸻

Roadmap Node

type RoadmapNode = {
id: string; // UUID (crypto.randomUUID)
title: string;
position: {
x: number;
y: number;
};
notes: string; // Markdown content
}

⸻

Roadmap Edge

type RoadmapEdge = {
id: string;
source: string;
target: string;
}

⸻

Progress

type Progress = {
roadmapId: string;
completed: Record<string, boolean>;
}

Roadmap definitions never store completion.

Progress never stores layout information.

⸻

Progress Rules

Progress is keyed entirely by node ID.

The following behavior is required:

Roadmap Change Progress Behavior
Node renamed Preserve progress
Node moved Preserve progress
Edge added/removed Preserve progress
New node added Initialize as incomplete
Node deleted Remove associated progress
Node ID changed Treat as a new node

Stable node IDs are therefore required (UUID via crypto.randomUUID).

⸻

Import / Export

The application supports three export formats.

Export Roadmap

Exports only the roadmap definition.

Purpose:

- Share roadmap structure
- Create templates
- Backup roadmap layout

Example:

frontend-roadmap.json

Importing creates:

- Roadmap Definition
- Empty Progress

⸻

Export Progress

Exports only progress.

Purpose:

- Backup learning progress
- Transfer progress between devices

Example:

frontend-progress.json

Importing requires an existing roadmap.

Progress is matched using node IDs.

⸻

Export Complete Roadmap

Exports:

- Roadmap Definition
- Progress

Example:

frontend-complete.json

Importing restores:

- Roadmap
- Layout
- Progress

This is the recommended backup format.

⸻

Local Storage

Two logical collections should exist.

roadmaps
progress

Example:

roadmaps
frontend
backend
aws
progress
frontend
backend
aws

The internal implementation may serialize these collections however is most appropriate.

⸻

Technology Stack

Framework

- React
- TypeScript
- Vite

Styling

- Tailwind CSS

Diagram Engine

- React Flow

Persistence

- Local Storage

Markdown Rendering

- react-markdown

State Management

- Zustand

No backend.

No database.

⸻

Architecture

The application owns its own domain model.

React Flow is used only as the rendering and interaction layer.

Data flow:

Roadmap Model
↓
Mapper
↓
React Flow
↓
User Interaction
↓
Mapper
↓
Roadmap Model

The application should never store React Flow nodes directly as its primary data model.

⸻

MVP Checklist

Dashboard

- List roadmaps (table layout)
- Create roadmap
- Open roadmap
- Edit roadmap
- Delete roadmap
- Import roadmap
- Import progress
- Import complete roadmap

Editor

- Add node
- Delete node
- Rename node
- Move node
- Connect nodes
- Disconnect nodes
- Edit node details (Markdown notes)
- Save roadmap
- Export roadmap
- Export complete roadmap

Study Mode

- Toggle node completion (dedicated checkbox)
- Automatic progress calculation
- Persist progress
- Disable editing
- View node details in sidebar (Markdown notes rendered)
- Switch to Editor Mode via header toggle

Persistence

- Local Storage
- Roadmap import/export
- Progress import/export
- Complete roadmap import/export

⸻

Guiding Philosophy

Roadmap Tracker should feel like an editable version of roadmap.sh.

Editor Mode should be focused entirely on creating and organizing learning paths.

Study Mode should be focused entirely on completing those learning paths.

The application should remain lightweight, responsive, offline-first, and purpose-built for learning, avoiding unnecessary complexity or features unrelated to roadmap creation and progress tracking.
