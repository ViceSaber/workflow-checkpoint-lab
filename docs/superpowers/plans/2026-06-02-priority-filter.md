# 优先级筛选功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为任务看板添加按优先级（高/中/低）筛选任务的能力，与现有状态筛选和关键词搜索组合使用，并兼容旧 localStorage 数据。

**Architecture:** 在现有 React Context 中新增 `filterPriority` 状态，新建 `PriorityFilter` 组件与 `StatusFilter` 风格一致，`KanbanBoard` 的 `filteredTasks` 增加优先级过滤条件。`loadTasks` 对旧数据补全缺失的 priority。

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/hooks/useTasks.ts` | Modify | loadTasks 中 normalize priority |
| `src/context/taskContextDef.ts` | Modify | 接口新增 filterPriority + setFilterPriority |
| `src/context/TaskContext.tsx` | Modify | 新增 filterPriority state |
| `src/components/PriorityFilter.tsx` | Create | 优先级筛选按钮组 |
| `src/components/Header.tsx` | Modify | 引入 PriorityFilter |
| `src/components/KanbanBoard.tsx` | Modify | 筛选逻辑增加 priority 条件 |
| `src/__tests__/useTasks.test.ts` | Modify | 旧数据兼容测试 |
| `src/__tests__/PriorityFilter.test.tsx` | Create | PriorityFilter 组件测试 |
| `src/__tests__/KanbanBoard.test.tsx` | Create | 优先级筛选集成测试 |

---

### Task 1: 数据兼容 — useTests.ts loadTasks normalize

**Files:**
- Modify: `src/hooks/useTasks.ts:39-46`
- Modify: `src/__tests__/useTasks.test.ts`

- [ ] **Step 1: Write failing test for legacy data without priority**

Add to `src/__tests__/useTasks.test.ts`:

```typescript
it('normalizes tasks missing priority field to medium', () => {
  localStorage.setItem('task-kanban-tasks', JSON.stringify([
    { id: 'old-1', title: 'Legacy task', description: 'desc', status: 'todo', createdAt: Date.now() },
    { id: 'old-2', title: 'Invalid priority', description: '', status: 'in-progress', priority: 'unknown', createdAt: Date.now() },
  ]))
  const { result } = renderHook(() => useTasks())
  expect(result.current.tasks[0].priority).toBe('medium')
  expect(result.current.tasks[1].priority).toBe('medium')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd task-kanban && npx vitest run src/__tests__/useTasks.test.ts`
Expected: FAIL — `result.current.tasks[0].priority` is `undefined`

- [ ] **Step 3: Add normalize logic in loadTasks**

In `src/hooks/useTasks.ts`, change the `loadTasks` function. After `if (data) return JSON.parse(data)`, replace with normalize:

```typescript
function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const raw = JSON.parse(data) as Task[]
      return raw.map((t) => ({
        ...t,
        priority: (['high', 'medium', 'low'].includes(t.priority)
          ? t.priority
          : 'medium') as Priority,
      }))
    }
  } catch {
    // fall through to seed
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd task-kanban && npx vitest run src/__tests__/useTasks.test.ts`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add task-kanban/src/hooks/useTasks.ts task-kanban/src/__tests__/useTasks.test.ts
git commit -m "feat: normalize legacy tasks missing priority to medium"
```

---

### Task 2: Context 扩展 — filterPriority 状态

**Files:**
- Modify: `src/context/taskContextDef.ts`
- Modify: `src/context/TaskContext.tsx`

- [ ] **Step 1: Extend the interface**

In `src/context/taskContextDef.ts`, add two members to `TaskContextValue`:

```typescript
import type { Task, TaskStatus, Priority } from '../types'

export interface TaskContextValue {
  tasks: Task[]
  addTask: (payload: { title: string; description: string; priority: Priority }) => void
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  filterStatus: TaskStatus | 'all'
  setFilterStatus: (status: TaskStatus | 'all') => void
  filterPriority: Priority | 'all'
  setFilterPriority: (priority: Priority | 'all') => void
  searchKeyword: string
  setSearchKeyword: (keyword: string) => void
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
}
```

- [ ] **Step 2: Add state in TaskProvider**

In `src/context/TaskContext.tsx`, add import for `Priority` and new state:

```typescript
import type { TaskStatus, Priority } from '../types'
```

Add state inside `TaskProvider`:

```typescript
const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
```

Add to provider value:

```typescript
value={{
  tasks,
  addTask,
  updateTask,
  deleteTask,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  searchKeyword,
  setSearchKeyword,
  selectedTaskId,
  setSelectedTaskId,
}}
```

- [ ] **Step 3: Verify build passes**

Run: `cd task-kanban && npx tsc -b`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add task-kanban/src/context/taskContextDef.ts task-kanban/src/context/TaskContext.tsx
git commit -m "feat: add filterPriority state to TaskContext"
```

---

### Task 3: PriorityFilter 组件

**Files:**
- Create: `src/components/PriorityFilter.tsx`
- Create: `src/__tests__/PriorityFilter.test.tsx`

- [ ] **Step 1: Write failing test for PriorityFilter**

Create `src/__tests__/PriorityFilter.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PriorityFilter } from '../components/PriorityFilter'

describe('PriorityFilter', () => {
  it('renders all filter buttons', () => {
    render(<PriorityFilter />)
    expect(screen.getByText('全部')).toBeInTheDocument()
    expect(screen.getByText('高')).toBeInTheDocument()
    expect(screen.getByText('中')).toBeInTheDocument()
    expect(screen.getByText('低')).toBeInTheDocument()
  })

  it('calls setFilterPriority on click', async () => {
    const user = userEvent.setup()
    const setFilterPriority = vi.fn()
    vi.mock('../hooks/useTaskContext', () => ({
      useTaskContext: () => ({ filterPriority: 'all', setFilterPriority }),
    }))

    render(<PriorityFilter />)
    await user.click(screen.getByText('高'))
    expect(setFilterPriority).toHaveBeenCalledWith('high')

    vi.restoreAllMocks()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd task-kanban && npx vitest run src/__tests__/PriorityFilter.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement PriorityFilter**

Create `src/components/PriorityFilter.tsx`:

```typescript
import type { Priority } from '../types'
import { useTaskContext } from '../hooks/useTaskContext'

const FILTERS: { label: string; value: Priority | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
]

export function PriorityFilter() {
  const { filterPriority, setFilterPriority } = useTaskContext()

  return (
    <div className="status-filter">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          className={`filter-btn ${filterPriority === f.value ? 'active' : ''}`}
          onClick={() => setFilterPriority(f.value)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd task-kanban && npx vitest run src/__tests__/PriorityFilter.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add task-kanban/src/components/PriorityFilter.tsx task-kanban/src/__tests__/PriorityFilter.test.tsx
git commit -m "feat: add PriorityFilter component with tests"
```

---

### Task 4: Header 集成 PriorityFilter

**Files:**
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: Add PriorityFilter to Header**

In `src/components/Header.tsx`, add import and render:

```typescript
import { StatusFilter } from './StatusFilter'
import { PriorityFilter } from './PriorityFilter'
```

In the JSX, add `<PriorityFilter />` after `<StatusFilter />`:

```typescript
<div className="header-controls">
  <StatusFilter />
  <PriorityFilter />
  <input ... />
</div>
```

- [ ] **Step 2: Verify build passes**

Run: `cd task-kanban && npx tsc -b`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add task-kanban/src/components/Header.tsx
git commit -m "feat: integrate PriorityFilter into Header"
```

---

### Task 5: KanbanBoard 筛选逻辑

**Files:**
- Modify: `src/components/KanbanBoard.tsx`
- Create: `src/__tests__/KanbanBoard.test.tsx`

- [ ] **Step 1: Write failing test for priority filtering**

Create `src/__tests__/KanbanBoard.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { KanbanBoard } from '../components/KanbanBoard'

const mockContext = {
  tasks: [
    { id: '1', title: 'High task', description: '', status: 'todo', priority: 'high', createdAt: 1 },
    { id: '2', title: 'Medium task', description: '', status: 'todo', priority: 'medium', createdAt: 2 },
    { id: '3', title: 'Low task', description: '', status: 'in-progress', priority: 'low', createdAt: 3 },
  ],
  addTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  filterStatus: 'all' as const,
  setFilterStatus: vi.fn(),
  filterPriority: 'high' as const,
  setFilterPriority: vi.fn(),
  searchKeyword: '',
  setSearchKeyword: vi.fn(),
  selectedTaskId: null,
  setSelectedTaskId: vi.fn(),
}

vi.mock('../hooks/useTaskContext', () => ({
  useTaskContext: () => mockContext,
}))

describe('KanbanBoard with priority filter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows only high-priority tasks when filterPriority is high', () => {
    mockContext.filterPriority = 'high'
    mockContext.filterStatus = 'all'

    render(<KanbanBoard onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('High task')).toBeInTheDocument()
    expect(screen.queryByText('Medium task')).not.toBeInTheDocument()
    expect(screen.queryByText('Low task')).not.toBeInTheDocument()
  })

  it('shows all tasks when filterPriority is all', () => {
    mockContext.filterPriority = 'all'
    mockContext.filterStatus = 'all'

    render(<KanbanBoard onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('High task')).toBeInTheDocument()
    expect(screen.getByText('Medium task')).toBeInTheDocument()
    expect(screen.getByText('Low task')).toBeInTheDocument()
  })

  it('combines status and priority filters', () => {
    mockContext.filterPriority = 'medium'
    mockContext.filterStatus = 'todo'

    render(<KanbanBoard onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByText('High task')).not.toBeInTheDocument()
    expect(screen.getByText('Medium task')).toBeInTheDocument()
    expect(screen.queryByText('Low task')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd task-kanban && npx vitest run src/__tests__/KanbanBoard.test.tsx`
Expected: FAIL — all tasks shown regardless of filterPriority

- [ ] **Step 3: Add priority filter to KanbanBoard**

In `src/components/KanbanBoard.tsx`, destructure `filterPriority` from context:

```typescript
const { tasks, filterStatus, filterPriority, searchKeyword, setSelectedTaskId } = useTaskContext()
```

Add priority filter in `filteredTasks`:

```typescript
const filteredTasks = (status: TaskStatus): Task[] => {
  let result = tasks.filter((t) => t.status === status)
  if (filterPriority !== 'all') {
    result = result.filter((t) => t.priority === filterPriority)
  }
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd task-kanban && npx vitest run src/__tests__/KanbanBoard.test.tsx`
Expected: PASS

- [ ] **Step 5: Run full test suite**

Run: `cd task-kanban && npx vitest run`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add task-kanban/src/components/KanbanBoard.tsx task-kanban/src/__tests__/KanbanBoard.test.tsx
git commit -m "feat: add priority filtering to KanbanBoard"
```

---

### Task 6: 最终验证

- [ ] **Step 1: Run full test suite**

Run: `cd task-kanban && npx vitest run`
Expected: ALL PASS

- [ ] **Step 2: Run lint**

Run: `cd task-kanban && npx eslint .`
Expected: no errors

- [ ] **Step 3: Run build**

Run: `cd task-kanban && npx tsc -b && npx vite build`
Expected: build succeeds
