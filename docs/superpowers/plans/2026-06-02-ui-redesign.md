# UI Redesign: Dark Theme Kanban Board — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the light-themed kanban board into a modern dark-themed UI with sidebar navigation, enriched task cards (tags, avatars, progress bars, due dates), and polished visual design.

**Architecture:** Incremental CSS rewrite keeping pure CSS approach. Extend Task type with new optional fields (dueDate, assignee, tags). Add new leaf components (Sidebar, Avatar, Tag, ProgressBar, DueDate). Restructure App layout to sidebar + main. All new fields are optional for backward compatibility with existing localStorage data.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, React Testing Library, pure CSS

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `src/constants/assignees.ts` | Preset assignee definitions |
| `src/constants/tags.ts` | Tag name type + color mapping |
| `src/components/Sidebar.tsx` | Left navigation sidebar |
| `src/components/Sidebar.css` | Sidebar styles |
| `src/components/Avatar.tsx` | Circular avatar with gradient + initial |
| `src/components/Tag.tsx` | Colored pill badge |
| `src/components/ProgressBar.tsx` | Thin subtask progress indicator |
| `src/components/DueDate.tsx` | Date display with overdue detection |

### Modified files
| File | Changes |
|------|---------|
| `src/types/index.ts` | Add AvatarColor, TagName, Assignee types; extend Task with dueDate, assignee, tags |
| `src/hooks/useTasks.ts` | Import new types, extend ADD_TASK payload, update seed data |
| `src/App.tsx` | Import Sidebar, restructure to app-layout > sidebar + main |
| `src/App.css` | Full dark theme rewrite |
| `src/components/Header.tsx` | Dark top-header with search box, notification bell, new-task button |
| `src/components/TaskCard.tsx` | Import new leaf components, render tags/avatars/progress/due-date |
| `src/components/KanbanColumn.tsx` | Colored dot indicator, dark column styling |
| `src/components/TaskFormModal.tsx` | Add dueDate picker, assignee selector, tag toggles |
| `src/components/StatusFilter.tsx` | Switch to filter-chip class, remove wrapper div |
| `src/components/PriorityFilter.tsx` | Switch to filter-chip class, update labels |
| `src/components/TaskDetailPage.tsx` | Pass new fields in handleCopy |
| `src/__tests__/PriorityFilter.test.tsx` | Update button text expectations |

---

### Task 1: Extend Task type and constants

**Files:**
- Modify: `task-kanban/src/types/index.ts`
- Create: `task-kanban/src/constants/assignees.ts`
- Create: `task-kanban/src/constants/tags.ts`

- [ ] **Step 1: Update Task type in `src/types/index.ts`**

```typescript
import type { Subtask, Comment, Attachment } from './subtask'

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type Priority = 'high' | 'medium' | 'low'
export type AvatarColor = 'pink' | 'blue' | 'green' | 'purple' | 'orange'
export type TagName = '紧急' | '设计' | '开发' | '功能' | '优化' | '营销'

export interface Assignee {
  id: string
  name: string
  initial: string
  color: AvatarColor
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  createdAt: number
  subtasks?: Subtask[]
  comments?: Comment[]
  attachments?: Attachment[]
  dueDate?: string
  assignee?: Assignee
  tags?: TagName[]
}

export type { Subtask, Comment, Attachment }
```

- [ ] **Step 2: Create `src/constants/assignees.ts`**

```typescript
import type { Assignee } from '../types'

export const ASSIGNEES: Assignee[] = [
  { id: 'a1', name: '张三', initial: '张', color: 'pink' },
  { id: 'a2', name: '李四', initial: '李', color: 'blue' },
  { id: 'a3', name: '王五', initial: '王', color: 'green' },
  { id: 'a4', name: '赵六', initial: '赵', color: 'purple' },
  { id: 'a5', name: '周七', initial: '周', color: 'orange' },
]
```

- [ ] **Step 3: Create `src/constants/tags.ts`**

```typescript
import type { TagName } from '../types'

export const TAG_NAMES: TagName[] = ['紧急', '设计', '开发', '功能', '优化', '营销']

export const TAG_COLORS: Record<TagName, { bg: string; text: string }> = {
  '紧急': { bg: 'rgba(232, 67, 147, 0.2)', text: '#fd79a8' },
  '设计': { bg: 'rgba(108, 92, 231, 0.2)', text: '#a29bfe' },
  '开发': { bg: 'rgba(0, 184, 148, 0.2)', text: '#55efc4' },
  '功能': { bg: 'rgba(116, 185, 255, 0.2)', text: '#74b9ff' },
  '优化': { bg: 'rgba(253, 203, 110, 0.2)', text: '#fdcb6e' },
  '营销': { bg: 'rgba(253, 203, 110, 0.2)', text: '#fdcb6e' },
}
```

- [ ] **Step 4: Update seed data in `src/hooks/useTasks.ts`**

Add import at top:
```typescript
import type { Task, TaskStatus, Priority, Assignee, TagName } from '../types'
```

Add `dueDate`, `assignee`, and `tags` to each of the 5 seed tasks in `loadTasks()`:
- seed-1: `dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), assignee: { id: 'a1', name: '张三', initial: '张', color: 'pink' }, tags: ['优化', '开发']`
- seed-2: `dueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10), assignee: { id: 'a3', name: '王五', initial: '王', color: 'green' }, tags: ['设计']`
- seed-3: `dueDate: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10), assignee: { id: 'a2', name: '李四', initial: '李', color: 'blue' }, tags: ['开发']`
- seed-4: `dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), assignee: { id: 'a1', name: '张三', initial: '张', color: 'pink' }, tags: ['紧急', '开发']`
- seed-5: `dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), assignee: { id: 'a4', name: '赵六', initial: '赵', color: 'purple' }, tags: ['功能']`

Also update the `TaskAction` type and `addTask` function to accept the new fields:

```typescript
type TaskAction =
  | { type: 'ADD_TASK'; payload: { title: string; description: string; priority: Priority; dueDate?: string; assignee?: Assignee; tags?: TagName[] } }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Omit<Task, 'id' | 'createdAt'>> } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
```

In the reducer's `ADD_TASK` case, include:
```typescript
dueDate: action.payload.dueDate,
assignee: action.payload.assignee,
tags: action.payload.tags,
```

Update `addTask` function signature:
```typescript
const addTask = (payload: { title: string; description: string; priority: Priority; dueDate?: string; assignee?: Assignee; tags?: TagName[] }) => {
  dispatch({ type: 'ADD_TASK', payload })
}
```

- [ ] **Step 5: Run existing tests**

Run: `cd task-kanban && npm test`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add task-kanban/src/types/index.ts task-kanban/src/constants/ task-kanban/src/hooks/useTasks.ts
git commit -m "feat(ui-redesign): extend Task type with dueDate, assignee, tags"
```

---

### Task 2: Avatar component

**Files:**
- Create: `task-kanban/src/components/Avatar.tsx`
- Create: `task-kanban/src/__tests__/Avatar.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/__tests__/Avatar.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Avatar } from '../components/Avatar'

describe('Avatar', () => {
  it('renders the initial letter', () => {
    render(<Avatar initial="张" color="pink" />)
    expect(screen.getByText('张')).toBeInTheDocument()
  })

  it('applies the color class', () => {
    const { container } = render(<Avatar initial="李" color="blue" />)
    const el = container.firstChild as HTMLElement
    expect(el.classList.contains('avatar-blue')).toBe(true)
  })

  it('renders small size when specified', () => {
    const { container } = render(<Avatar initial="王" color="green" size="sm" />)
    const el = container.firstChild as HTMLElement
    expect(el.classList.contains('avatar-sm')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `cd task-kanban && npx vitest run src/__tests__/Avatar.test.tsx`

- [ ] **Step 3: Write Avatar component**

Create `src/components/Avatar.tsx`:
```typescript
import type { AvatarColor } from '../types'

interface AvatarProps {
  initial: string
  color: AvatarColor
  size?: 'sm' | 'md'
}

export function Avatar({ initial, color, size = 'md' }: AvatarProps) {
  return (
    <div className={`avatar avatar-${color} ${size === 'sm' ? 'avatar-sm' : ''}`}>
      {initial}
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

Run: `cd task-kanban && npx vitest run src/__tests__/Avatar.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add task-kanban/src/components/Avatar.tsx task-kanban/src/__tests__/Avatar.test.tsx
git commit -m "feat(ui-redesign): add Avatar component"
```

---

### Task 3: Tag component

**Files:**
- Create: `task-kanban/src/components/Tag.tsx`
- Create: `task-kanban/src/__tests__/Tag.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/__tests__/Tag.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Tag } from '../components/Tag'

describe('Tag', () => {
  it('renders the tag label', () => {
    render(<Tag name="设计" />)
    expect(screen.getByText('设计')).toBeInTheDocument()
  })

  it('applies correct background color', () => {
    const { container } = render(<Tag name="紧急" />)
    const el = container.firstChild as HTMLElement
    expect(el.style.backgroundColor).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

- [ ] **Step 3: Write Tag component**

Create `src/components/Tag.tsx`:
```typescript
import type { TagName } from '../types'
import { TAG_COLORS } from '../constants/tags'

interface TagProps {
  name: TagName
}

export function Tag({ name }: TagProps) {
  const colors = TAG_COLORS[name]
  return (
    <span className="tag" style={{ backgroundColor: colors.bg, color: colors.text }}>
      {name}
    </span>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add task-kanban/src/components/Tag.tsx task-kanban/src/__tests__/Tag.test.tsx
git commit -m "feat(ui-redesign): add Tag component"
```

---

### Task 4: ProgressBar and DueDate components

**Files:**
- Create: `task-kanban/src/components/ProgressBar.tsx`
- Create: `task-kanban/src/components/DueDate.tsx`
- Create: `task-kanban/src/__tests__/ProgressBar.test.tsx`
- Create: `task-kanban/src/__tests__/DueDate.test.tsx`

- [ ] **Step 1: Write failing ProgressBar test**

Create `src/__tests__/ProgressBar.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProgressBar } from '../components/ProgressBar'

describe('ProgressBar', () => {
  it('shows done/total label', () => {
    render(<ProgressBar done={2} total={5} />)
    expect(screen.getByText('2/5')).toBeInTheDocument()
  })

  it('renders fill with correct width', () => {
    const { container } = render(<ProgressBar done={3} total={4} />)
    const fill = container.querySelector('.progress-fill') as HTMLElement
    expect(fill.style.width).toBe('75%')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

- [ ] **Step 3: Write ProgressBar**

Create `src/components/ProgressBar.tsx`:
```typescript
interface ProgressBarProps {
  done: number
  total: number
}

export function ProgressBar({ done, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="card-progress">
      <div className="progress-label">
        <span>进度</span>
        <span>{done}/{total}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

- [ ] **Step 5: Write failing DueDate test**

Create `src/__tests__/DueDate.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DueDate } from '../components/DueDate'

describe('DueDate', () => {
  it('displays formatted date', () => {
    render(<DueDate date="2026-06-15" />)
    expect(screen.getByText(/6月15日/)).toBeInTheDocument()
  })

  it('shows overdue class for past date', () => {
    const past = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const { container } = render(<DueDate date={past} />)
    const el = container.querySelector('.card-date')
    expect(el?.classList.contains('overdue')).toBe(true)
  })

  it('no overdue class for future date', () => {
    const future = new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10)
    const { container } = render(<DueDate date={future} />)
    const el = container.querySelector('.card-date')
    expect(el?.classList.contains('overdue')).toBe(false)
  })
})
```

- [ ] **Step 6: Run test — expect FAIL**

- [ ] **Step 7: Write DueDate**

Create `src/components/DueDate.tsx`:
```typescript
interface DueDateProps {
  date: string
}

export function DueDate({ date }: DueDateProps) {
  const d = new Date(date + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const isOverdue = d < now
  const label = `${d.getMonth() + 1}月${d.getDate()}日`

  return (
    <span className={`card-date ${isOverdue ? 'overdue' : ''}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      {isOverdue ? '已逾期' : label}
    </span>
  )
}
```

- [ ] **Step 8: Run test — expect PASS**

- [ ] **Step 9: Commit**

```bash
git add task-kanban/src/components/ProgressBar.tsx task-kanban/src/components/DueDate.tsx task-kanban/src/__tests__/ProgressBar.test.tsx task-kanban/src/__tests__/DueDate.test.tsx
git commit -m "feat(ui-redesign): add ProgressBar and DueDate components"
```

---

### Task 5: Sidebar component

**Files:**
- Create: `task-kanban/src/components/Sidebar.tsx`
- Create: `task-kanban/src/components/Sidebar.css`
- Create: `task-kanban/src/__tests__/Sidebar.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/__tests__/Sidebar.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Sidebar } from '../components/Sidebar'

describe('Sidebar', () => {
  it('renders app logo', () => {
    render(<Sidebar />)
    expect(screen.getByText('Kanban Pro')).toBeInTheDocument()
  })

  it('renders navigation items', () => {
    render(<Sidebar />)
    expect(screen.getByText('仪表盘')).toBeInTheDocument()
    expect(screen.getByText('任务')).toBeInTheDocument()
    expect(screen.getByText('日历')).toBeInTheDocument()
  })

  it('marks 任务 as active', () => {
    render(<Sidebar />)
    const taskItem = screen.getByText('任务').closest('.nav-item')
    expect(taskItem?.classList.contains('active')).toBe(true)
  })

  it('renders user section', () => {
    render(<Sidebar />)
    expect(screen.getByText('张三')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

- [ ] **Step 3: Write Sidebar component**

Create `src/components/Sidebar.tsx`:
```typescript
import './Sidebar.css'

const NAV_ITEMS = [
  { label: '仪表盘', icon: 'dashboard' },
  { label: '项目', icon: 'folder' },
  { label: '任务', icon: 'check', active: true },
  { label: '日历', icon: 'calendar' },
]

const LABELS = [
  { label: '设计', color: '#6c5ce7' },
  { label: '开发', color: '#00b894' },
  { label: '营销', color: '#fdcb6e' },
]

const ICONS: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  folder: '<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>',
  check: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
}

function NavIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <g dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }} />
    </svg>
  )
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">K</div>
        <span className="logo-text">Kanban Pro</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <div key={item.label} className={`nav-item ${item.active ? 'active' : ''}`}>
            <NavIcon name={item.icon} />
            {item.label}
          </div>
        ))}
        <div className="nav-section-label">标签</div>
        {LABELS.map((lb) => (
          <div key={lb.label} className="nav-item">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: lb.color, flexShrink: 0 }} />
            {lb.label}
          </div>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="user-avatar">张</div>
        <div className="user-info">
          <div className="user-name">张三</div>
          <div className="user-role">产品经理</div>
        </div>
      </div>
    </aside>
  )
}
```

Create `src/components/Sidebar.css`:
```css
.sidebar {
  width: 240px;
  background: #1a1d23;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #2d3239;
  flex-shrink: 0;
}

.sidebar-logo {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #2d3239;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.logo-text { font-size: 16px; font-weight: 700; color: #fff; }

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #8b95a5;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover { background: #252830; color: #cdd3de; }
.nav-item.active { background: rgba(108, 92, 231, 0.15); color: #a29bfe; }

.nav-section-label {
  font-size: 11px;
  text-transform: uppercase;
  color: #4a5568;
  padding: 16px 12px 8px;
  letter-spacing: 0.05em;
}

.sidebar-user {
  padding: 16px;
  border-top: 1px solid #2d3239;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fd79a8, #e84393);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.user-info { flex: 1; }
.user-name { font-size: 13px; font-weight: 600; color: #e1e4e8; }
.user-role { font-size: 11px; color: #6b7585; }

@media (max-width: 768px) {
  .sidebar { display: none; }
}
```

- [ ] **Step 4: Run test — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add task-kanban/src/components/Sidebar.tsx task-kanban/src/components/Sidebar.css task-kanban/src/__tests__/Sidebar.test.tsx
git commit -m "feat(ui-redesign): add Sidebar component"
```

---

### Task 6: Rewrite App.css — dark theme

**Files:**
- Modify: `task-kanban/src/App.css` — full rewrite

Replace the entire file with dark theme CSS. Key sections:

1. **Reset & Base** — body bg `#12151a`, text `#e1e4e8`
2. **App Layout** — `.app-layout` flex row, full height
3. **Main area** — `.main` flex column, overflow hidden
4. **Top header** — `#1a1d23` bg, search box, notification, gradient button
5. **Filter bar** — chip styling with purple active state
6. **Kanban board** — dark flex layout
7. **Columns** — dark bg, colored dot indicators (todo=purple, in-progress=yellow, done=green)
8. **Task cards** — `#1e2228` bg, priority left border (pink/yellow/green), hover lift+shadow
9. **Card elements** — `.card-tags`, `.card-title`, `.card-desc` (2-line clamp), `.card-progress`, `.card-footer`
10. **Avatars** — gradient circles for pink/blue/green/purple/orange, `.avatar-sm` variant
11. **Tags** — inline colored pills via style attribute
12. **Progress bar** — thin 4px with gradient fill
13. **Due date** — `.overdue` class for red highlight
14. **Card actions** — dark status-select, icon buttons
15. **Modal** — dark overlay, `#1a1d23` content, dark inputs
16. **Form groups** — dark input/textarea/select bg `#252830`
17. **Task detail** — dark bg, dark badges, dark buttons
18. **Markdown editor** — dark toolbar, dark input/preview
19. **Comments** — dark cards, dark inputs
20. **Responsive** — sidebar hidden on mobile, columns stack

All color values from the design spec's color system table.

- [ ] **Step 1: Replace App.css entirely**

- [ ] **Step 2: Run all tests**

Run: `cd task-kanban && npm test`
Expected: All PASS

- [ ] **Step 3: Commit**

```bash
git add task-kanban/src/App.css
git commit -m "feat(ui-redesign): rewrite App.css with dark theme"
```

---

### Task 7: Update App.tsx — add Sidebar + layout

**Files:**
- Modify: `task-kanban/src/App.tsx`

Add `import { Sidebar } from './components/Sidebar'`.

Replace `<div className="app">` with:
```tsx
<div className="app-layout">
  <Sidebar />
  <div className="main">
    <Header onNewTask={handleNewTask} />
    <KanbanBoard onEdit={handleEdit} onDelete={handleDelete} />
    {/* modals unchanged */}
  </div>
</div>
```

Also update `handleFormSubmit` to pass new fields:
```typescript
const handleFormSubmit = (data: {
  title: string; description: string; priority: Priority;
  dueDate?: string; assignee?: import('./types').Assignee; tags?: import('./types').TagName[]
}) => {
  if (editingTask) { updateTask(editingTask.id, data) } else { addTask(data) }
  setShowForm(false); setEditingTask(null)
}
```

- [ ] **Step 1: Edit App.tsx**

- [ ] **Step 2: Run all tests**

Run: `cd task-kanban && npm test`

- [ ] **Step 3: Commit**

```bash
git add task-kanban/src/App.tsx
git commit -m "feat(ui-redesign): add Sidebar and restructure layout"
```

---

### Task 8: Update Header — dark theme

**Files:**
- Modify: `task-kanban/src/components/Header.tsx`

Rewrite Header with dark-themed top-header bar:
- Page title "任务看板" on left
- Search box with SVG icon in center
- Notification bell with red dot
- Gradient "新建任务" button on right
- Filter bar below with StatusFilter + divider + PriorityFilter

Remove the old `.header`, `.header-top`, `.header-controls` structure. Use `.top-header` and `.filter-bar` classes.

- [ ] **Step 1: Rewrite Header.tsx**

- [ ] **Step 2: Run all tests**

- [ ] **Step 3: Commit**

```bash
git add task-kanban/src/components/Header.tsx
git commit -m "feat(ui-redesign): dark Header with search and notification"
```

---

### Task 9: Update filters to chip style

**Files:**
- Modify: `task-kanban/src/components/StatusFilter.tsx`
- Modify: `task-kanban/src/components/PriorityFilter.tsx`
- Modify: `task-kanban/src/__tests__/PriorityFilter.test.tsx`

StatusFilter: change `className="filter-btn"` to `className="filter-chip"`, remove `<div className="status-filter">` wrapper, return fragment.

PriorityFilter: same class change, update labels from '高'/'中'/'低' to '高优先级'/'中优先级'/'低优先级'.

PriorityFilter test: update `getByText('高')` to `getByText('高优先级')`, etc.

- [ ] **Step 1: Edit both filter components and test**

- [ ] **Step 2: Run all tests**

- [ ] **Step 3: Commit**

```bash
git add task-kanban/src/components/StatusFilter.tsx task-kanban/src/components/PriorityFilter.tsx task-kanban/src/__tests__/PriorityFilter.test.tsx
git commit -m "feat(ui-redesign): dark chip style for filters"
```

---

### Task 10: Update TaskCard — new visual elements

**Files:**
- Modify: `task-kanban/src/components/TaskCard.tsx`
- Create: `task-kanban/src/__tests__/TaskCard.test.tsx`

Import Tag, Avatar, ProgressBar, DueDate. Rewrite card layout:
1. Tags row (if task.tags)
2. Title
3. Description (2-line clamp via CSS)
4. Progress bar (if task.subtasks)
5. Footer: avatars (left) + due date (right) + action buttons

Remove old `.task-card-header` / `.priority-badge` structure. Priority is shown via CSS left border.

- [ ] **Step 1: Write failing TaskCard test**

- [ ] **Step 2: Run test — expect FAIL**

- [ ] **Step 3: Rewrite TaskCard.tsx**

- [ ] **Step 4: Run all tests**

- [ ] **Step 5: Commit**

```bash
git add task-kanban/src/components/TaskCard.tsx task-kanban/src/__tests__/TaskCard.test.tsx
git commit -m "feat(ui-redesign): TaskCard with tags, avatars, progress, due date"
```

---

### Task 11: Update KanbanColumn — colored dots

**Files:**
- Modify: `task-kanban/src/components/KanbanColumn.tsx`

Add colored dot (`.column-dot.todo` / `.in-progress` / `.done`) before title. Use `.column` class instead of `.kanban-column`. Remove old color-coded column backgrounds.

- [ ] **Step 1: Edit KanbanColumn.tsx**

- [ ] **Step 2: Run all tests**

- [ ] **Step 3: Commit**

```bash
git add task-kanban/src/components/KanbanColumn.tsx
git commit -m "feat(ui-redesign): KanbanColumn with colored dots"
```

---

### Task 12: Update TaskFormModal — new fields

**Files:**
- Modify: `task-kanban/src/components/TaskFormModal.tsx`

Add fields: date picker (`<input type="date">`), assignee dropdown (from ASSIGNEES constant), tag toggle buttons (from TAG_NAMES constant). Update `onSubmit` payload to include new fields. Add `.tag-toggle` and `.tag-checkboxes` CSS classes.

- [ ] **Step 1: Edit TaskFormModal.tsx**

- [ ] **Step 2: Run all tests**

- [ ] **Step 3: Commit**

```bash
git add task-kanban/src/components/TaskFormModal.tsx
git commit -m "feat(ui-redesign): TaskFormModal with dueDate, assignee, tags"
```

---

### Task 13: Dark theme for detail page + editor

**Files:**
- Modify: `task-kanban/src/components/TaskDetailPage.tsx`

Update `handleCopy` to pass `dueDate`, `assignee`, `tags`. Dark styling handled by CSS rewrite from Task 6.

- [ ] **Step 1: Edit TaskDetailPage.tsx handleCopy**

- [ ] **Step 2: Run all tests**

- [ ] **Step 3: Commit**

```bash
git add task-kanban/src/components/TaskDetailPage.tsx
git commit -m "feat(ui-redesign): dark TaskDetailPage"
```

---

### Task 14: Visual verification

**Files:** None

- [ ] **Step 1: Run full test suite**

Run: `cd task-kanban && npm test`

- [ ] **Step 2: Run TypeScript check**

Run: `cd task-kanban && npx tsc --noEmit`

- [ ] **Step 3: Start dev server and verify visually**

Run: `cd task-kanban && npm run dev`

Verify: dark theme, sidebar, header, filters, cards with all new elements, form with new fields, detail page dark, responsive on mobile.
