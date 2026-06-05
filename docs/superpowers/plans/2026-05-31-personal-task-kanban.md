# Personal Task Kanban Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first personal task kanban board with three-column layout, CRUD, filtering, search, and localStorage persistence.

**Architecture:** React Context + useReducer for state, localStorage for persistence, pure CSS for styling. Single-page app with three-column kanban layout.

**Tech Stack:** Vite, React 18, TypeScript, Vitest, React Testing Library

---

## File Structure

```
task-kanban/                     ← Vite project root
├── src/
│   ├── types/
│   │   └── index.ts             ← TaskStatus, Priority, Task types
│   ├── hooks/
│   │   └── useTasks.ts          ← useReducer + localStorage hook
│   ├── context/
│   │   └── TaskContext.tsx       ← React Context provider
│   ├── components/
│   │   ├── Header.tsx           ← Title + new task button + search
│   │   ├── StatusFilter.tsx     ← All / Todo / In Progress / Done tabs
│   │   ├── KanbanBoard.tsx      ← Three-column flex container
│   │   ├── KanbanColumn.tsx     ← Single status column
│   │   ├── TaskCard.tsx         ← Task card with priority + actions
│   │   ├── TaskFormModal.tsx    ← Create / edit modal
│   │   └── ConfirmDialog.tsx    ← Delete confirmation
│   ├── App.tsx                  ← Root component
│   ├── App.css                  ← All styles
│   └── main.tsx                 ← Vite entry point
├── src/__tests__/
│   └── useTasks.test.ts         ← Hook unit tests
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

### Task 1: Project Initialization

**Files:**
- Create: `task-kanban/package.json` (via Vite CLI)
- Create: `task-kanban/src/types/index.ts`

- [ ] **Step 1: Scaffold Vite project**

```bash
cd /path/to/workflow-checkpoint-lab
npm create vite@latest task-kanban -- --template react-ts
cd task-kanban
npm install
```

- [ ] **Step 2: Install test dependencies**

```bash
cd task-kanban
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Add Vitest config**

Create `task-kanban/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

Create `task-kanban/src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Add test script to package.json**

In `task-kanban/package.json`, add to scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write type definitions**

Create `task-kanban/src/types/index.ts`:

```typescript
export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  createdAt: number
}
```

- [ ] **Step 6: Verify setup**

```bash
cd task-kanban
npx vitest run
```

Expected: No tests found (or default Vite test passes), no errors.

- [ ] **Step 7: Commit**

```bash
git add task-kanban/
git commit -m "chore: scaffold Vite + React + TypeScript project with test deps"
```

---

### Task 2: useTasks Hook — Unit Tests

**Files:**
- Create: `task-kanban/src/__tests__/useTasks.test.ts`

- [ ] **Step 1: Write failing tests for useTasks**

Create `task-kanban/src/__tests__/useTasks.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useTasks } from '../hooks/useTasks'

describe('useTasks', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty tasks initially when localStorage is empty', () => {
    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks).toEqual([])
  })

  it('adds a task', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({
        title: 'Test task',
        description: 'A description',
        priority: 'high',
      })
    })
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Test task')
    expect(result.current.tasks[0].status).toBe('todo')
    expect(result.current.tasks[0].priority).toBe('high')
  })

  it('updates a task', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Original', description: '', priority: 'medium' })
    })
    const id = result.current.tasks[0].id
    act(() => {
      result.current.updateTask(id, { title: 'Updated' })
    })
    expect(result.current.tasks[0].title).toBe('Updated')
  })

  it('deletes a task', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'To delete', description: '', priority: 'low' })
    })
    const id = result.current.tasks[0].id
    act(() => {
      result.current.deleteTask(id)
    })
    expect(result.current.tasks).toHaveLength(0)
  })

  it('changes task status', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Task', description: '', priority: 'medium' })
    })
    const id = result.current.tasks[0].id
    act(() => {
      result.current.updateTask(id, { status: 'in-progress' })
    })
    expect(result.current.tasks[0].status).toBe('in-progress')
  })

  it('persists tasks to localStorage', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Persistent', description: '', priority: 'high' })
    })
    const stored = JSON.parse(localStorage.getItem('task-kanban-tasks') || '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe('Persistent')
  })

  it('loads tasks from localStorage on init', () => {
    localStorage.setItem('task-kanban-tasks', JSON.stringify([
      {
        id: 'existing-1',
        title: 'Existing task',
        description: 'desc',
        status: 'todo',
        priority: 'low',
        createdAt: Date.now(),
      },
    ]))
    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Existing task')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd task-kanban
npx vitest run src/__tests__/useTasks.test.ts
```

Expected: FAIL — module `../hooks/useTasks` not found.

- [ ] **Step 3: Commit**

```bash
git add task-kanban/src/__tests__/
git commit -m "test: add failing useTasks hook tests"
```

---

### Task 3: useTasks Hook — Implementation

**Files:**
- Create: `task-kanban/src/hooks/useTasks.ts`

- [ ] **Step 1: Implement useTasks hook**

Create `task-kanban/src/hooks/useTasks.ts`:

```typescript
import { useReducer, useEffect } from 'react'
import type { Task, TaskStatus, Priority } from '../types'

const STORAGE_KEY = 'task-kanban-tasks'

type TaskAction =
  | { type: 'ADD_TASK'; payload: { title: string; description: string; priority: Priority } }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Omit<Task, 'id' | 'createdAt'>> } }
  | { type: 'DELETE_TASK'; payload: { id: string } }

function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'ADD_TASK':
      return [
        ...state,
        {
          id: crypto.randomUUID(),
          title: action.payload.title,
          description: action.payload.description,
          status: 'todo' as TaskStatus,
          priority: action.payload.priority,
          createdAt: Date.now(),
        },
      ]
    case 'UPDATE_TASK':
      return state.map((task) =>
        task.id === action.payload.id
          ? { ...task, ...action.payload.updates }
          : task
      )
    case 'DELETE_TASK':
      return state.filter((task) => task.id !== action.payload.id)
    default:
      return state
  }
}

function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function useTasks() {
  const [tasks, dispatch] = useReducer(taskReducer, [], loadTasks)

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const addTask = (payload: { title: string; description: string; priority: Priority }) => {
    dispatch({ type: 'ADD_TASK', payload })
  }

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
  }

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: { id } })
  }

  return { tasks, addTask, updateTask, deleteTask }
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
cd task-kanban
npx vitest run src/__tests__/useTasks.test.ts
```

Expected: All 7 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add task-kanban/src/hooks/ task-kanban/src/__tests__/
git commit -m "feat: implement useTasks hook with reducer and localStorage"
```

---

### Task 4: TaskContext Provider

**Files:**
- Create: `task-kanban/src/context/TaskContext.tsx`
- Modify: `task-kanban/src/App.tsx`

- [ ] **Step 1: Create TaskContext**

Create `task-kanban/src/context/TaskContext.tsx`:

```tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Task, TaskStatus, Priority } from '../types'
import { useTasks } from '../hooks/useTasks'

interface TaskContextValue {
  tasks: Task[]
  addTask: (payload: { title: string; description: string; priority: Priority }) => void
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  filterStatus: TaskStatus | 'all'
  setFilterStatus: (status: TaskStatus | 'all') => void
  searchKeyword: string
  setSearchKeyword: (keyword: string) => void
}

const TaskContext = createContext<TaskContextValue | null>(null)

export function TaskProvider({ children }: { children: ReactNode }) {
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [searchKeyword, setSearchKeyword] = useState('')

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        filterStatus,
        setFilterStatus,
        searchKeyword,
        setSearchKeyword,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext(): TaskContextValue {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider')
  return ctx
}
```

- [ ] **Step 2: Update App.tsx to wrap with provider**

Replace `task-kanban/src/App.tsx`:

```tsx
import { TaskProvider } from './context/TaskContext'
import './App.css'

function App() {
  return (
    <TaskProvider>
      <div className="app">Loading board...</div>
    </TaskProvider>
  )
}

export default App
```

- [ ] **Step 3: Verify app starts**

```bash
cd task-kanban
npm run dev
```

Expected: Dev server starts without errors. Page shows "Loading board...".

- [ ] **Step 4: Commit**

```bash
git add task-kanban/src/context/ task-kanban/src/App.tsx
git commit -m "feat: add TaskContext provider with filter and search state"
```

---

### Task 5: Header + StatusFilter Components

**Files:**
- Create: `task-kanban/src/components/Header.tsx`
- Create: `task-kanban/src/components/StatusFilter.tsx`

- [ ] **Step 1: Create StatusFilter component**

Create `task-kanban/src/components/StatusFilter.tsx`:

```tsx
import type { TaskStatus } from '../types'
import { useTaskContext } from '../context/TaskContext'

const FILTERS: { label: string; value: TaskStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '待办', value: 'todo' },
  { label: '进行中', value: 'in-progress' },
  { label: '已完成', value: 'done' },
]

export function StatusFilter() {
  const { filterStatus, setFilterStatus } = useTaskContext()

  return (
    <div className="status-filter">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          className={`filter-btn ${filterStatus === f.value ? 'active' : ''}`}
          onClick={() => setFilterStatus(f.value)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create Header component**

Create `task-kanban/src/components/Header.tsx`:

```tsx
import { useTaskContext } from '../context/TaskContext'
import { StatusFilter } from './StatusFilter'

interface HeaderProps {
  onNewTask: () => void
}

export function Header({ onNewTask }: HeaderProps) {
  const { searchKeyword, setSearchKeyword } = useTaskContext()

  return (
    <header className="header">
      <div className="header-top">
        <h1 className="header-title">任务看板</h1>
        <button className="btn-primary" onClick={onNewTask}>
          + 新增任务
        </button>
      </div>
      <div className="header-controls">
        <StatusFilter />
        <input
          className="search-input"
          type="text"
          placeholder="搜索任务..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add task-kanban/src/components/Header.tsx task-kanban/src/components/StatusFilter.tsx
git commit -m "feat: add Header and StatusFilter components"
```

---

### Task 6: KanbanBoard + KanbanColumn + TaskCard

**Files:**
- Create: `task-kanban/src/components/TaskCard.tsx`
- Create: `task-kanban/src/components/KanbanColumn.tsx`
- Create: `task-kanban/src/components/KanbanBoard.tsx`

- [ ] **Step 1: Create TaskCard component**

Create `task-kanban/src/components/TaskCard.tsx`:

```tsx
import type { Task, TaskStatus } from '../types'
import { useTaskContext } from '../context/TaskContext'

const STATUS_OPTIONS: { label: string; value: TaskStatus }[] = [
  { label: '待办', value: 'todo' },
  { label: '进行中', value: 'in-progress' },
  { label: '已完成', value: 'done' },
]

const PRIORITY_CLASS: Record<string, string> = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
}

const PRIORITY_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { updateTask } = useTaskContext()
  const isDone = task.status === 'done'

  return (
    <div className={`task-card ${PRIORITY_CLASS[task.priority]} ${isDone ? 'task-done' : ''}`}>
      <div className="task-card-header">
        <h3 className={`task-title ${isDone ? 'title-done' : ''}`}>{task.title}</h3>
        <span className={`priority-badge ${PRIORITY_CLASS[task.priority]}`}>
          {PRIORITY_LABEL[task.priority]}
        </span>
      </div>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className="task-actions">
        <select
          className="status-select"
          value={task.status}
          onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button className="btn-icon" onClick={() => onEdit(task)} title="编辑">
          ✎
        </button>
        <button className="btn-icon btn-danger" onClick={() => onDelete(task)} title="删除">
          ✕
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create KanbanColumn component**

Create `task-kanban/src/components/KanbanColumn.tsx`:

```tsx
import type { Task, TaskStatus } from '../types'
import { TaskCard } from './TaskCard'

const COLUMN_CONFIG: Record<TaskStatus, { title: string; className: string }> = {
  todo: { title: '待办', className: 'column-todo' },
  'in-progress': { title: '进行中', className: 'column-progress' },
  done: { title: '已完成', className: 'column-done' },
}

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function KanbanColumn({ status, tasks, onEdit, onDelete }: KanbanColumnProps) {
  const config = COLUMN_CONFIG[status]

  return (
    <div className={`kanban-column ${config.className}`}>
      <div className="column-header">
        <h2 className="column-title">{config.title}</h2>
        <span className="column-count">{tasks.length}</span>
      </div>
      <div className="column-cards">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && <p className="column-empty">暂无任务</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create KanbanBoard component**

Create `task-kanban/src/components/KanbanBoard.tsx`:

```tsx
import type { Task, TaskStatus } from '../types'
import { useTaskContext } from '../context/TaskContext'
import { KanbanColumn } from './KanbanColumn'

const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done']

interface KanbanBoardProps {
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function KanbanBoard({ onEdit, onDelete }: KanbanBoardProps) {
  const { tasks, filterStatus, searchKeyword } = useTaskContext()

  const filteredTasks = (status: TaskStatus): Task[] => {
    let result = tasks.filter((t) => t.status === status)
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(kw) ||
          t.description.toLowerCase().includes(kw)
      )
    }
    return result
  }

  const visibleStatuses = filterStatus === 'all' ? STATUSES : [filterStatus]

  return (
    <div className="kanban-board">
      {visibleStatuses.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={filteredTasks(status)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add task-kanban/src/components/TaskCard.tsx task-kanban/src/components/KanbanColumn.tsx task-kanban/src/components/KanbanBoard.tsx
git commit -m "feat: add KanbanBoard, KanbanColumn, and TaskCard components"
```

---

### Task 7: TaskFormModal + ConfirmDialog

**Files:**
- Create: `task-kanban/src/components/TaskFormModal.tsx`
- Create: `task-kanban/src/components/ConfirmDialog.tsx`

- [ ] **Step 1: Create TaskFormModal component**

Create `task-kanban/src/components/TaskFormModal.tsx`:

```tsx
import { useState, useEffect } from 'react'
import type { Task, Priority } from '../types'

interface TaskFormModalProps {
  task?: Task | null
  onSubmit: (data: { title: string; description: string; priority: Priority }) => void
  onClose: () => void
}

export function TaskFormModal({ task, onSubmit, onClose }: TaskFormModalProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium')

  useEffect(() => {
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setPriority(task?.priority ?? 'medium')
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title: title.trim(), description: description.trim(), priority })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{task ? '编辑任务' : '新增任务'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">标题 *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">描述</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入任务描述"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor="priority">优先级</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary" disabled={!title.trim()}>
              {task ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ConfirmDialog component**

Create `task-kanban/src/components/ConfirmDialog.tsx`:

```tsx
interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="form-actions">
          <button className="btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            确认删除
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add task-kanban/src/components/TaskFormModal.tsx task-kanban/src/components/ConfirmDialog.tsx
git commit -m "feat: add TaskFormModal and ConfirmDialog components"
```

---

### Task 8: Wire Up App.tsx + Full Styles

**Files:**
- Modify: `task-kanban/src/App.tsx`
- Create: `task-kanban/src/App.css` (replace Vite default)
- Delete: `task-kanban/src/index.css` (if exists, remove Vite default)

- [ ] **Step 1: Write full App.tsx**

Replace `task-kanban/src/App.tsx`:

```tsx
import { useState } from 'react'
import type { Task, Priority } from './types'
import { useTaskContext } from './context/TaskContext'
import { Header } from './components/Header'
import { KanbanBoard } from './components/KanbanBoard'
import { TaskFormModal } from './components/TaskFormModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import './App.css'

function AppContent() {
  const { addTask, updateTask, deleteTask } = useTaskContext()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const handleNewTask = () => {
    setEditingTask(null)
    setShowForm(true)
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleDelete = (task: Task) => {
    setDeletingTask(task)
  }

  const handleFormSubmit = (data: { title: string; description: string; priority: Priority }) => {
    if (editingTask) {
      updateTask(editingTask.id, data)
    } else {
      addTask(data)
    }
    setShowForm(false)
    setEditingTask(null)
  }

  const handleDeleteConfirm = () => {
    if (deletingTask) {
      deleteTask(deletingTask.id)
      setDeletingTask(null)
    }
  }

  return (
    <div className="app">
      <Header onNewTask={handleNewTask} />
      <KanbanBoard onEdit={handleEdit} onDelete={handleDelete} />
      {showForm && (
        <TaskFormModal
          task={editingTask}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false)
            setEditingTask(null)
          }}
        />
      )}
      {deletingTask && (
        <ConfirmDialog
          message={`确定要删除任务「${deletingTask.title}」吗？`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingTask(null)}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  )
}

export default App
```

- [ ] **Step 2: Write full App.css**

Replace `task-kanban/src/App.css` with complete styles (see below — includes all layout, components, modals, responsive).

Write the following to `task-kanban/src/App.css`:

```css
/* === Reset & Base === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  color: #333;
  line-height: 1.5;
}

/* === App Layout === */
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

/* === Header === */
.header {
  margin-bottom: 24px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 240px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #4a6cf7;
}

/* === Status Filter === */
.status-filter {
  display: flex;
  gap: 4px;
}

.filter-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f0f0f0;
}

.filter-btn.active {
  background: #4a6cf7;
  color: #fff;
  border-color: #4a6cf7;
}

/* === Kanban Board === */
.kanban-board {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* === Kanban Column === */
.kanban-column {
  flex: 1;
  min-width: 0;
  border-radius: 8px;
  padding: 12px;
  min-height: 300px;
}

.column-todo {
  background: #f0f4ff;
}

.column-progress {
  background: #fef9ec;
}

.column-done {
  background: #ecfdf5;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.column-title {
  font-size: 15px;
  font-weight: 600;
}

.column-todo .column-title {
  color: #4a6cf7;
}

.column-progress .column-title {
  color: #d97706;
}

.column-done .column-title {
  color: #16a34a;
}

.column-count {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
}

.column-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column-empty {
  text-align: center;
  color: #aaa;
  font-size: 13px;
  padding: 20px;
}

/* === Task Card === */
.task-card {
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  border-left: 3px solid #ccc;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.priority-high {
  border-left-color: #ef4444;
}

.priority-medium {
  border-left-color: #f59e0b;
}

.priority-low {
  border-left-color: #22c55e;
}

.task-done {
  opacity: 0.6;
}

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.task-title {
  font-size: 14px;
  font-weight: 600;
  flex: 1;
  margin-right: 8px;
}

.title-done {
  text-decoration: line-through;
  color: #999;
}

.priority-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
  white-space: nowrap;
}

.priority-badge.priority-high {
  background: #fef2f2;
  color: #dc2626;
}

.priority-badge.priority-medium {
  background: #fffbeb;
  color: #d97706;
}

.priority-badge.priority-low {
  background: #f0fdf4;
  color: #16a34a;
}

.task-desc {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-select {
  flex: 1;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  background: #fff;
  cursor: pointer;
}

.btn-icon {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f0f0f0;
}

.btn-danger {
  color: #dc2626;
}

.btn-danger:hover {
  background: #fef2f2;
}

/* === Buttons === */
.btn-primary {
  padding: 8px 20px;
  background: #4a6cf7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #3b5de7;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 8px 20px;
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.btn-danger {
  padding: 8px 20px;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #b91c1c;
}

/* === Modal === */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.modal-sm {
  max-width: 360px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.confirm-message {
  font-size: 15px;
  margin-bottom: 20px;
}

/* === Form === */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #555;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #4a6cf7;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

/* === Responsive === */
@media (max-width: 768px) {
  .kanban-board {
    flex-direction: column;
  }

  .header-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }
}
```

- [ ] **Step 3: Clean up Vite defaults**

Delete `task-kanban/src/index.css` and `task-kanban/src/assets/` if they exist. Remove any `import './index.css'` from `main.tsx` if present.

- [ ] **Step 4: Verify app runs**

```bash
cd task-kanban
npm run dev
```

Expected: Dev server starts. Page shows kanban board with three empty columns, header with search and filter.

- [ ] **Step 5: Run tests**

```bash
cd task-kanban
npx vitest run
```

Expected: All 7 useTasks tests pass.

- [ ] **Step 6: Commit**

```bash
git add task-kanban/src/
git commit -m "feat: wire up App with full component tree and CSS styles"
```

---

### Task 9: Manual Verification & Cleanup

**Files:**
- Modify: `task-kanban/src/main.tsx` (clean up if needed)

- [ ] **Step 1: Clean main.tsx**

Ensure `task-kanban/src/main.tsx` looks like:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 2: Manual test all features**

```bash
cd task-kanban
npm run dev
```

Verify in browser:
1. Create a task with title, description, priority → appears in Todo column
2. Edit the task → changes persist
3. Change status to In Progress → card moves to second column
4. Change status to Done → card shows strikethrough + reduced opacity
5. Delete the task → confirmation dialog → task removed
6. Type in search → tasks filter in real-time
7. Click status filter tabs → columns show/hide
8. Refresh page → all tasks persist

- [ ] **Step 3: Run final test suite**

```bash
cd task-kanban
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add task-kanban/
git commit -m "chore: final cleanup and verification"
```

---

## Self-Review

**Spec coverage:**
- Task CRUD → Tasks 3, 7, 8
- Status management → Tasks 3, 6
- Filtering (status + keyword) → Tasks 5, 6
- Task counts → Task 6 (KanbanColumn shows count)
- Data persistence → Task 3 (useTasks with localStorage)
- Priority display → Tasks 6, 8 (CSS)

**Placeholder scan:** No TBDs, TODOs, or "implement later" patterns.

**Type consistency:** Task interface defined in Task 1, used consistently across all tasks. addTask/updateTask/deleteTask signatures match between useTasks, TaskContext, and consumers.

**Gaps:** None — all spec scenarios covered.
