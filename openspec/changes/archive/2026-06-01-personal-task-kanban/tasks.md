# Tasks: Personal Task Kanban

## Setup

- [ ] Initialize Vite + React + TypeScript project
- [ ] Add type definitions (TaskStatus, Priority, Task)

## Core State

- [ ] Implement useTasks hook with useReducer
- [ ] Add localStorage read/write persistence
- [ ] Create TaskContext provider

## Components

- [ ] App shell (layout, context provider)
- [ ] Header (title, new task button, search input)
- [ ] StatusFilter (All / Todo / In Progress / Done tabs)
- [ ] KanbanBoard (three-column flex container)
- [ ] KanbanColumn (column header with count + card list)
- [ ] TaskCard (title, description, priority bar, status selector, edit/delete buttons)
- [ ] TaskFormModal (create/edit form with validation)
- [ ] ConfirmDialog (delete confirmation)

## Styling

- [ ] App.css: full layout and component styles

## Verification

- [ ] Test all CRUD operations
- [ ] Test status switching
- [ ] Test filtering and search
- [ ] Test localStorage persistence (refresh page)
- [ ] Test responsive layout
