# Personal Task Kanban — Design Document

Date: 2026-05-31

## Overview

A local-first personal task kanban board built with React + TypeScript + Vite.
No backend, no authentication. Data persists via localStorage.

## Data Model

```typescript
type TaskStatus = 'todo' | 'in-progress' | 'done'
type Priority = 'high' | 'medium' | 'low'

interface Task {
  id: string        // crypto.randomUUID()
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  createdAt: number // Date.now()
}
```

## UI Layout

Classic three-column kanban (Trello style):

- **Column 1 — Todo** (待办): blue accent, shows tasks with status `todo`
- **Column 2 — In Progress** (进行中): amber accent, shows tasks with status `in-progress`
- **Column 3 — Done** (已完成): green accent, shows tasks with status `done`, completed cards have reduced opacity and strikethrough title

Each column header displays the task count as a badge.

## Component Tree

```
App
├── Header                    — Title + "New Task" button + search input
│   └── StatusFilter          — Tab bar: All / Todo / In Progress / Done
├── KanbanBoard               — Three-column grid container
│   ├── KanbanColumn (×3)     — Single status column: header + count + card list
│   │   └── TaskCard          — Card: title, description, priority color bar, action buttons
├── TaskFormModal             — Modal for creating and editing tasks
└── ConfirmDialog             — Delete confirmation dialog
```

## State Management

Custom hook `useTasks` wraps `useReducer` + localStorage:

- **State**: tasks array, filter status, search keyword
- **Actions**: add, update, delete, change status, set filter, set search
- **Persistence**: read from localStorage on mount; write after every mutation
- **localStorage key**: `task-kanban-tasks`

No external state management library. Context provides the hook return value to components.

## Interaction Flows

### Create Task

1. User clicks "New Task" button in Header
2. TaskFormModal opens with empty fields
3. User fills in title (required), description, priority (defaults to medium)
4. On submit, new task is created with status `todo` and appears in the Todo column

### Edit Task

1. User clicks edit button on a TaskCard
2. Same TaskFormModal opens, pre-filled with current task data
3. On submit, task is updated in place

### Delete Task

1. User clicks delete button on a TaskCard
2. ConfirmDialog appears asking for confirmation
3. On confirm, task is removed

### Change Status

1. User clicks the status selector on a TaskCard
2. Dropdown shows available statuses
3. On selection, task moves to the corresponding column

### Filter by Status

1. User clicks a status tab in StatusFilter
2. When a specific status is selected, only that column is highlighted/shown
3. "All" shows all three columns

### Search

1. User types in the search input
2. Tasks are filtered in real-time by matching title or description (case-insensitive)
3. Only matching tasks appear in their respective columns

### Task Counts

- Each KanbanColumn header shows the count of tasks in that status
- Counts update in real-time as tasks are added, deleted, or moved

## File Structure

```
src/
├── components/
│   ├── Header.tsx
│   ├── StatusFilter.tsx
│   ├── KanbanBoard.tsx
│   ├── KanbanColumn.tsx
│   ├── TaskCard.tsx
│   ├── TaskFormModal.tsx
│   └── ConfirmDialog.tsx
├── hooks/
│   └── useTasks.ts
├── types/
│   └── index.ts
├── App.tsx
├── App.css
└── main.tsx
```

## Styling

- Pure CSS in App.css — no UI framework
- Three-column layout via CSS Flexbox
- Priority indicated by left border color: red (high), amber (medium), green (low)
- Status columns have subtle background tint matching their accent color
- Modal uses fixed overlay with centered content
- Responsive: columns stack vertically on narrow screens

## Out of Scope

- Backend / API integration
- User authentication
- Drag-and-drop between columns
- Due dates or reminders
- Task categories or tags
- Multi-user collaboration
- Data export/import
