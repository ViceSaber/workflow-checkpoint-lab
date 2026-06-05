# Design: Personal Task Kanban

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

## Architecture

- **State management**: React Context + useReducer, no external libraries
- **Persistence**: localStorage under key `task-kanban-tasks`
- **Styling**: Pure CSS (App.css), no UI framework

## Component Tree

```
App
├── Header                    — Title + "New Task" button + search input
│   └── StatusFilter          — Tab bar: All / Todo / In Progress / Done
├── KanbanBoard               — Three-column grid
│   ├── KanbanColumn (×3)     — Status column: header + count + cards
│   │   └── TaskCard          — Task card with priority bar + actions
├── TaskFormModal             — Create / edit modal
└── ConfirmDialog             — Delete confirmation
```

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

- Three-column layout via Flexbox
- Priority shown by left border color: red (high), amber (medium), green (low)
- Column backgrounds tinted to match status accent color
- Done tasks have reduced opacity and strikethrough title
- Modal: fixed overlay + centered content
- Responsive: columns stack on narrow screens
