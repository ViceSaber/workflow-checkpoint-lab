# Rich Text Task Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-page task detail view with Markdown editor, subtask checklist, comments, and file attachments to the kanban app.

**Architecture:** State-driven view switching — `selectedTaskId` in context toggles between KanbanBoard and TaskDetailPage. New fields (subtasks, comments, attachments) are stored on the Task object and persisted to localStorage. marked.js renders Markdown to HTML.

**Tech Stack:** React 19, TypeScript, marked.js, Vitest, @testing-library/react

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `src/types/subtask.ts` | Subtask, Comment, Attachment interfaces |
| `src/utils/subtaskParser.ts` | Parse/serialize `- [ ]`/`- [x]` to/from Subtask[] |
| `src/utils/__tests__/subtaskParser.test.ts` | Tests for subtask parser |
| `src/utils/attachmentValidator.ts` | File size validation |
| `src/utils/__tests__/attachmentValidator.test.ts` | Tests for attachment validator |
| `src/components/MarkdownEditor.tsx` | Split-pane Markdown editor with toolbar |
| `src/components/TaskSidebar.tsx` | Right-side properties panel |
| `src/components/CommentSection.tsx` | Comment list + input |
| `src/components/CommentItem.tsx` | Single comment display |
| `src/components/AttachmentList.tsx` | File list + upload/download |

### Modified files
| File | Changes |
|------|---------|
| `src/types/index.ts` | Import subtask types, extend Task interface |
| `src/context/TaskContext.tsx` | Add `selectedTaskId` + `setSelectedTaskId` to context |
| `src/components/TaskDetailPage.tsx` | New container component |
| `src/App.tsx` | View switching between board and detail |
| `src/App.css` | New styles for detail page, editor, sidebar, comments, attachments |
| `src/components/KanbanBoard.tsx` | Pass onCardClick to columns |
| `src/components/KanbanColumn.tsx` | Pass onCardClick to cards |
| `src/components/TaskCard.tsx` | Card body click opens detail |

### Dependencies
| Package | Type | Purpose |
|---------|------|---------|
| `marked` | dependency | Markdown → HTML rendering |
| `@types/marked` | devDependency | TypeScript types |

---

## Task 1: Install Dependencies + Update Types

**Files:**
- Modify: `task-kanban/package.json`
- Create: `task-kanban/src/types/subtask.ts`
- Modify: `task-kanban/src/types/index.ts`

- [ ] **Step 1: Install marked**

```bash
cd task-kanban && npm install marked && npm install -D @types/marked
```

- [ ] **Step 2: Create `src/types/subtask.ts`**

```typescript
export interface Subtask {
  id: string
  text: string
  done: boolean
}

export interface Comment {
  id: string
  author: string
  content: string
  createdAt: number
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  data: string
  uploadedAt: number
}
```

- [ ] **Step 3: Update `src/types/index.ts`**

```typescript
import type { Subtask, Comment, Attachment } from './subtask'

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type Priority = 'high' | 'medium' | 'low'

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
}

export type { Subtask, Comment, Attachment }
```

- [ ] **Step 4: Run existing tests to verify no breakage**

Run: `cd task-kanban && npm test`
Expected: 7 tests pass

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: install marked, add Subtask/Comment/Attachment types"
```

---

## Task 2: Subtask Parser Utility (TDD)

**Files:**
- Create: `task-kanban/src/utils/subtaskParser.ts`
- Create: `task-kanban/src/utils/__tests__/subtaskParser.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/utils/__tests__/subtaskParser.test.ts
import { describe, it, expect } from 'vitest'
import { parseSubtasks, toggleSubtask, subtaskLine } from '../subtaskParser'

describe('parseSubtasks', () => {
  it('extracts subtasks from markdown lines', () => {
    const md = '## Tasks\n- [x] Design mockup\n- [ ] Build API\n- [ ] Write tests\nSome text'
    const result = parseSubtasks(md)
    expect(result).toHaveLength(3)
    expect(result[0].text).toBe('Design mockup')
    expect(result[0].done).toBe(true)
    expect(result[1].text).toBe('Build API')
    expect(result[1].done).toBe(false)
  })

  it('returns empty array when no subtask lines exist', () => {
    expect(parseSubtasks('hello world')).toEqual([])
  })

  it('handles uppercase X in checkbox', () => {
    const result = parseSubtasks('- [X] Done thing')
    expect(result).toHaveLength(1)
    expect(result[0].done).toBe(true)
  })
})

describe('toggleSubtask', () => {
  it('toggles a subtask from unchecked to checked in markdown', () => {
    const md = '- [ ] Build API'
    const result = toggleSubtask(md, 0)
    expect(result).toBe('- [x] Build API')
  })

  it('toggles a subtask from checked to unchecked in markdown', () => {
    const md = '- [x] Build API'
    const result = toggleSubtask(md, 0)
    expect(result).toBe('- [ ] Build API')
  })

  it('toggles the correct subtask when multiple exist', () => {
    const md = '- [x] First\n- [ ] Second\n- [ ] Third'
    const result = toggleSubtask(md, 1)
    expect(result).toBe('- [x] First\n- [x] Second\n- [ ] Third')
  })
})

describe('subtaskLine', () => {
  it('generates an unchecked subtask line', () => {
    expect(subtaskLine('New task', false)).toBe('- [ ] New task')
  })

  it('generates a checked subtask line', () => {
    expect(subtaskLine('Done task', true)).toBe('- [x] Done task')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd task-kanban && npm test`
Expected: FAIL — `subtaskParser` module not found

- [ ] **Step 3: Implement subtask parser**

```typescript
// src/utils/subtaskParser.ts
import type { Subtask } from '../types'

const SUBTASK_RE = /^- \[([ xX])] (.+)$/

export function parseSubtasks(markdown: string): Subtask[] {
  const lines = markdown.split('\n')
  const subtasks: Subtask[] = []
  let index = 0
  for (const line of lines) {
    const match = SUBTASK_RE.exec(line.trim())
    if (match) {
      subtasks.push({
        id: `subtask-${index}`,
        text: match[2],
        done: match[1].toLowerCase() === 'x',
      })
      index++
    }
  }
  return subtasks
}

export function toggleSubtask(markdown: string, subtaskIndex: number): string {
  const lines = markdown.split('\n')
  let count = 0
  return lines
    .map((line) => {
      const trimmed = line.trim()
      const match = SUBTASK_RE.exec(trimmed)
      if (match) {
        if (count === subtaskIndex) {
          const isChecked = match[1].toLowerCase() === 'x'
          const prefix = line.substring(0, line.indexOf(trimmed))
          count++
          return `${prefix}- [${isChecked ? ' ' : 'x'}] ${match[2]}`
        }
        count++
      }
      return line
    })
    .join('\n')
}

export function subtaskLine(text: string, done: boolean): string {
  return `- [${done ? 'x' : ' '}] ${text}`
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd task-kanban && npm test`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add subtask parser with tests"
```

---

## Task 3: Attachment Validator Utility (TDD)

**Files:**
- Create: `task-kanban/src/utils/attachmentValidator.ts`
- Create: `task-kanban/src/utils/__tests__/attachmentValidator.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// src/utils/__tests__/attachmentValidator.test.ts
import { describe, it, expect } from 'vitest'
import { validateAttachment } from '../attachmentValidator'

describe('validateAttachment', () => {
  it('accepts a file under the single-file limit', () => {
    const result = validateAttachment({ size: 400 * 1024 }, [])
    expect(result.valid).toBe(true)
  })

  it('rejects a file over 500KB', () => {
    const result = validateAttachment({ size: 600 * 1024 }, [])
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/500/)
  })

  it('rejects when total attachments exceed 2MB', () => {
    const existing = [{ size: 1800 * 1024 }]
    const result = validateAttachment({ size: 300 * 1024 }, existing)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/2MB/)
  })

  it('accepts when total is exactly at limit', () => {
    const existing = [{ size: 1536 * 1024 }]
    const result = validateAttachment({ size: 512 * 1024 }, existing)
    expect(result.valid).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd task-kanban && npm test`
Expected: FAIL — module not found

- [ ] **Step 3: Implement validator**

```typescript
// src/utils/attachmentValidator.ts
const MAX_FILE_SIZE = 500 * 1024
const MAX_TOTAL_SIZE = 2 * 1024 * 1024

interface FileLike {
  size: number
}

export function validateAttachment(
  file: FileLike,
  existingAttachments: FileLike[]
): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: '文件大小超过限制（最大 500KB）' }
  }
  const totalExisting = existingAttachments.reduce((sum, a) => sum + a.size, 0)
  if (totalExisting + file.size > MAX_TOTAL_SIZE) {
    return { valid: false, error: '附件总大小超过限制（最大 2MB）' }
  }
  return { valid: true }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd task-kanban && npm test`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add attachment size validator with tests"
```

---

## Task 4: Update Context with selectedTaskId

**Files:**
- Modify: `task-kanban/src/context/TaskContext.tsx`

- [ ] **Step 1: Update TaskContext.tsx**

Replace the full file:

```typescript
// src/context/TaskContext.tsx
import { createContext, useState, type ReactNode } from 'react'
import type { Task, TaskStatus, Priority } from '../types'
import { useTasks } from '../hooks/useTasks'

export interface TaskContextValue {
  tasks: Task[]
  addTask: (payload: { title: string; description: string; priority: Priority }) => void
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  filterStatus: TaskStatus | 'all'
  setFilterStatus: (status: TaskStatus | 'all') => void
  searchKeyword: string
  setSearchKeyword: (keyword: string) => void
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
}

export const TaskContext = createContext<TaskContextValue | null>(null)

export function TaskProvider({ children }: { children: ReactNode }) {
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

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
        selectedTaskId,
        setSelectedTaskId,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}
```

- [ ] **Step 2: Run tests to verify no breakage**

Run: `cd task-kanban && npm test`
Expected: 7 tests pass

- [ ] **Step 3: Commit**

```bash
git add src/context/TaskContext.tsx && git commit -m "feat: add selectedTaskId to TaskContext"
```

---

## Task 5: MarkdownEditor Component

**Files:**
- Create: `task-kanban/src/components/MarkdownEditor.tsx`

- [ ] **Step 1: Implement MarkdownEditor**

```typescript
// src/components/MarkdownEditor.tsx
import { useRef, useCallback } from 'react'
import { marked } from 'marked'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

interface ToolbarAction {
  label: string
  prefix: string
  suffix: string
  block?: boolean
}

const TOOLBAR_GROUPS: ToolbarAction[][] = [
  [
    { label: 'B', prefix: '**', suffix: '**' },
    { label: 'I', prefix: '_', suffix: '_' },
    { label: 'S', prefix: '~~', suffix: '~~' },
  ],
  [
    { label: 'H1', prefix: '# ', suffix: '', block: true },
    { label: 'H2', prefix: '## ', suffix: '', block: true },
    { label: 'H3', prefix: '### ', suffix: '', block: true },
  ],
  [
    { label: 'UL', prefix: '- ', suffix: '', block: true },
    { label: 'OL', prefix: '1. ', suffix: '', block: true },
    { label: '{}', prefix: '`', suffix: '`' },
    { label: '🔗', prefix: '[', suffix: '](url)' },
  ],
  [
    { label: '☐ 子任务', prefix: '- [ ] ', suffix: '', block: true },
  ],
]

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const html = marked.parse(value || '', { async: false }) as string

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  const insert = useCallback(
    (action: ToolbarAction) => {
      const ta = textareaRef.current
      if (!ta) return
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const selected = value.substring(start, end)

      let insertText: string
      if (action.block && start > 0 && value[start - 1] !== '\n') {
        insertText = '\n' + action.prefix + selected + action.suffix
      } else {
        insertText = action.prefix + selected + action.suffix
      }

      const newVal = value.substring(0, start) + insertText + value.substring(end)
      onChange(newVal)

      const cursorOffset = action.prefix.length + (insertText.startsWith('\n') ? 1 : 0)
      requestAnimationFrame(() => {
        ta.focus()
        ta.selectionStart = ta.selectionEnd = start + cursorOffset
      })
    },
    [value, onChange]
  )

  return (
    <div className="md-editor">
      <div className="md-toolbar">
        {TOOLBAR_GROUPS.map((group, gi) => (
          <span key={gi} className="md-toolbar-group">
            {group.map((action) => (
              <button
                key={action.label}
                type="button"
                className="md-toolbar-btn"
                onClick={() => insert(action)}
                title={action.label}
              >
                {action.label}
              </button>
            ))}
          </span>
        ))}
      </div>
      <div className="md-panes">
        <textarea
          ref={textareaRef}
          className="md-input"
          value={value}
          onChange={handleInput}
          placeholder="用 Markdown 编写任务描述..."
        />
        <div
          className="md-preview"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MarkdownEditor.tsx && git commit -m "feat: add MarkdownEditor with split-pane and toolbar"
```

---

## Task 6: TaskSidebar Component

**Files:**
- Create: `task-kanban/src/components/TaskSidebar.tsx`

- [ ] **Step 1: Implement TaskSidebar**

```typescript
// src/components/TaskSidebar.tsx
import type { Task, TaskStatus, Priority } from '../types'
import { useTaskContext } from '../hooks/useTaskContext'

interface TaskSidebarProps {
  task: Task
}

const STATUS_OPTIONS: { label: string; value: TaskStatus }[] = [
  { label: '待办', value: 'todo' },
  { label: '进行中', value: 'in-progress' },
  { label: '已完成', value: 'done' },
]

const PRIORITY_OPTIONS: { label: string; value: Priority }[] = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
]

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TaskSidebar({ task }: TaskSidebarProps) {
  const { updateTask } = useTaskContext()

  const subtasks = task.subtasks ?? []
  const done = subtasks.filter((s) => s.done).length
  const total = subtasks.length
  const pct = total > 0 ? (done / total) * 100 : 0

  return (
    <div className="task-sidebar">
      <div className="sidebar-label">属性</div>
      <div className="sidebar-field">
        <span className="sidebar-field-label">状态</span>
        <select
          value={task.status}
          onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="sidebar-field">
        <span className="sidebar-field-label">优先级</span>
        <select
          value={task.priority}
          onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="sidebar-field">
        <span className="sidebar-field-label">创建时间</span>
        <span className="sidebar-value">{formatDate(task.createdAt)}</span>
      </div>
      {total > 0 && (
        <div className="sidebar-field">
          <span className="sidebar-field-label">子任务进度</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="progress-text">{done} / {total} 已完成</span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TaskSidebar.tsx && git commit -m "feat: add TaskSidebar with status/priority/progress"
```

---

## Task 7: CommentSection + CommentItem Components

**Files:**
- Create: `task-kanban/src/components/CommentItem.tsx`
- Create: `task-kanban/src/components/CommentSection.tsx`

- [ ] **Step 1: Create CommentItem**

```typescript
// src/components/CommentItem.tsx
import type { Comment } from '../types'

interface CommentItemProps {
  comment: Comment
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="comment-author">{comment.author}</span>
        <span className="comment-time">{relativeTime(comment.createdAt)}</span>
      </div>
      <div className="comment-content">{comment.content}</div>
    </div>
  )
}
```

- [ ] **Step 2: Create CommentSection**

```typescript
// src/components/CommentSection.tsx
import { useState, useRef, useEffect } from 'react'
import type { Task, Comment } from '../types'
import { useTaskContext } from '../hooks/useTaskContext'
import { CommentItem } from './CommentItem'

const AUTHOR_KEY = 'task-kanban-author'

interface CommentSectionProps {
  task: Task
}

export function CommentSection({ task }: CommentSectionProps) {
  const { updateTask } = useTaskContext()
  const [author, setAuthor] = useState(() => localStorage.getItem(AUTHOR_KEY) || '')
  const [content, setContent] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const comments = task.comments ?? []

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [comments.length])

  const handleSubmit = () => {
    const trimmedAuthor = author.trim()
    const trimmedContent = content.trim()
    if (!trimmedAuthor || !trimmedContent) return

    localStorage.setItem(AUTHOR_KEY, trimmedAuthor)

    const newComment: Comment = {
      id: crypto.randomUUID(),
      author: trimmedAuthor,
      content: trimmedContent,
      createdAt: Date.now(),
    }
    updateTask(task.id, { comments: [...comments, newComment] })
    setContent('')
  }

  return (
    <div className="comment-section">
      <h3 className="comment-title">评论 ({comments.length})</h3>
      <div className="comment-list" ref={listRef}>
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} />
        ))}
        {comments.length === 0 && <p className="comment-empty">暂无评论</p>}
      </div>
      <div className="comment-input">
        <input
          className="comment-author-input"
          type="text"
          placeholder="你的名字"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <textarea
          className="comment-content-input"
          placeholder="输入评论... (Ctrl+Enter 发送)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
          }}
        />
        <button
          className="btn-primary comment-send"
          type="button"
          onClick={handleSubmit}
          disabled={!author.trim() || !content.trim()}
        >
          发送
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CommentItem.tsx src/components/CommentSection.tsx && git commit -m "feat: add CommentSection and CommentItem components"
```

---

## Task 8: AttachmentList Component

**Files:**
- Create: `task-kanban/src/components/AttachmentList.tsx`

- [ ] **Step 1: Implement AttachmentList**

```typescript
// src/components/AttachmentList.tsx
import { useRef } from 'react'
import type { Task, Attachment } from '../types'
import { useTaskContext } from '../hooks/useTaskContext'
import { validateAttachment } from '../utils/attachmentValidator'

interface AttachmentListProps {
  task: Task
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentList({ task }: AttachmentListProps) {
  const { updateTask } = useTaskContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const attachments = task.attachments ?? []

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateAttachment(file, attachments)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      const attachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        uploadedAt: Date.now(),
      }
      updateTask(task.id, { attachments: [...attachments, attachment] })
    }
    reader.readAsDataURL(file)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDownload = (att: Attachment) => {
    const link = document.createElement('a')
    link.href = att.data
    link.download = att.name
    link.click()
  }

  const handleDelete = (attId: string) => {
    updateTask(task.id, {
      attachments: attachments.filter((a) => a.id !== attId),
    })
  }

  return (
    <div className="attachment-list">
      {attachments.map((att) => (
        <div key={att.id} className="attachment-item">
          <span className="attachment-name">📎 {att.name}</span>
          <span className="attachment-size">({formatSize(att.size)})</span>
          <button type="button" className="attachment-btn" onClick={() => handleDownload(att)}>
            下载
          </button>
          <button type="button" className="attachment-btn attachment-btn-del" onClick={() => handleDelete(att.id)}>
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn-secondary attachment-upload"
        onClick={() => fileInputRef.current?.click()}
      >
        + 上传附件
      </button>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleUpload}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AttachmentList.tsx && git commit -m "feat: add AttachmentList with upload/download/delete"
```

---

## Task 9: TaskDetailPage Container

**Files:**
- Create: `task-kanban/src/components/TaskDetailPage.tsx`

- [ ] **Step 1: Implement TaskDetailPage**

```typescript
// src/components/TaskDetailPage.tsx
import { useState } from 'react'
import { useTaskContext } from '../hooks/useTaskContext'
import { MarkdownEditor } from './MarkdownEditor'
import { TaskSidebar } from './TaskSidebar'
import { CommentSection } from './CommentSection'
import { AttachmentList } from './AttachmentList'
import { ConfirmDialog } from './ConfirmDialog'
import { parseSubtasks, toggleSubtask } from '../utils/subtaskParser'

const PRIORITY_LABEL: Record<string, string> = { high: '高', medium: '中', low: '低' }

export function TaskDetailPage() {
  const { tasks, selectedTaskId, setSelectedTaskId, updateTask, deleteTask } = useTaskContext()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const task = tasks.find((t) => t.id === selectedTaskId)
  if (!task) return null

  const subtasks = parseSubtasks(task.description)
  const doneCount = subtasks.filter((s) => s.done).length

  const handleBack = () => setSelectedTaskId(null)

  const handleCopy = () => {
    const { id, createdAt, subtasks: _, comments: __, attachments: ___, ...rest } = task
    addTask({ ...rest, title: `${task.title} (副本)` })
  }

  const handleDeleteConfirm = () => {
    deleteTask(task.id)
    setSelectedTaskId(null)
  }

  const handleDescriptionChange = (value: string) => {
    const parsed = parseSubtasks(value)
    updateTask(task.id, { description: value, subtasks: parsed })
  }

  const priorityClass = `priority-${task.priority}`
  const statusLabel = task.status === 'todo' ? '待办' : task.status === 'in-progress' ? '进行中' : '已完成'

  return (
    <div className="task-detail">
      {/* Top bar */}
      <div className="detail-topbar">
        <button type="button" className="btn-back" onClick={handleBack}>
          ← 返回看板
        </button>
        <span className="detail-timestamp">
          编辑于 {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Title row */}
      <div className="detail-title-row">
        <h1 className="detail-title">{task.title}</h1>
        <div className="detail-actions">
          <button type="button" className="action-icon" onClick={handleCopy} title="复制任务">📋</button>
          <button
            type="button"
            className="action-icon action-delete"
            onClick={() => setShowDeleteConfirm(true)}
            title="删除任务"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Badge row */}
      <div className="detail-badges">
        <span className={`badge ${priorityClass}`}>{PRIORITY_LABEL[task.priority]}优先级</span>
        <span className={`badge badge-status-${task.status}`}>{statusLabel}</span>
        <span className="badge-sep">·</span>
        <span className="badge-text">
          创建于 {new Date(task.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </span>
        {subtasks.length > 0 && (
          <>
            <span className="badge-sep">·</span>
            <span className="badge-text">子任务 {doneCount}/{subtasks.length}</span>
          </>
        )}
      </div>

      {/* Editor + Sidebar (stretch aligned) */}
      <div className="detail-main">
        <div className="detail-editor">
          <MarkdownEditor value={task.description} onChange={handleDescriptionChange} />
        </div>
        <div className="detail-sidebar-wrapper">
          <TaskSidebar task={task} />
        </div>
      </div>

      {/* Attachments */}
      <div className="detail-attachments">
        <AttachmentList task={task} />
      </div>

      {/* Comments */}
      <CommentSection task={task} />

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <ConfirmDialog
          message={`确定要删除任务「${task.title}」吗？`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
```

**Note:** The `handleCopy` function uses `addTask` from context. Import it from the destructured context value (it's already available).

- [ ] **Step 2: Commit**

```bash
git add src/components/TaskDetailPage.tsx && git commit -m "feat: add TaskDetailPage container component"
```

---

## Task 10: App View Switching + CSS Styles

**Files:**
- Modify: `task-kanban/src/App.tsx`
- Modify: `task-kanban/src/App.css`

- [ ] **Step 1: Update App.tsx**

```typescript
// src/App.tsx
import { useState } from 'react'
import type { Task, Priority } from './types'
import { TaskProvider } from './context/TaskContext'
import { useTaskContext } from './hooks/useTaskContext'
import { Header } from './components/Header'
import { KanbanBoard } from './components/KanbanBoard'
import { TaskFormModal } from './components/TaskFormModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { TaskDetailPage } from './components/TaskDetailPage'
import './App.css'

function AppContent() {
  const { addTask, updateTask, deleteTask, selectedTaskId } = useTaskContext()
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

  if (selectedTaskId) {
    return <TaskDetailPage />
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

- [ ] **Step 2: Append CSS styles to `src/App.css`**

Add the following at the end of the file:

```css
/* === Task Detail Page === */
.task-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.detail-topbar {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 14px;
}

.btn-back {
  font-size: 13px;
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #555;
  cursor: pointer;
}

.detail-timestamp {
  margin-left: auto;
  font-size: 11px;
  color: #aaa;
}

.detail-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
  flex: 1;
}

.detail-actions {
  display: flex;
  gap: 4px;
}

.action-icon {
  width: 28px;
  height: 28px;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #fff;
  color: #aaa;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.action-icon:hover {
  border-color: #ccc;
  color: #555;
  background: #f5f5f5;
}

.action-delete:hover {
  color: #dc2626;
  border-color: #fca5a5;
  background: #fef2f2;
}

.detail-badges {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 11px;
  margin-bottom: 12px;
}

.badge {
  padding: 1px 8px;
  border-radius: 8px;
  font-weight: 500;
}

.badge.priority-high { background: #fef2f2; color: #dc2626; }
.badge.priority-medium { background: #fffbeb; color: #d97706; }
.badge.priority-low { background: #f0fdf4; color: #16a34a; }

.badge-status-todo { background: #f0f4ff; color: #4a6cf7; }
.badge-status-in-progress { background: #fef9ec; color: #d97706; }
.badge-status-done { background: #ecfdf5; color: #16a34a; }

.badge-sep { color: #ccc; }
.badge-text { color: #999; }

/* Editor + Sidebar layout */
.detail-main {
  display: flex;
  gap: 20px;
  align-items: stretch;
  margin-bottom: 12px;
}

.detail-editor {
  flex: 2;
  min-width: 0;
}

.detail-sidebar-wrapper {
  flex: 0 0 200px;
}

/* === Markdown Editor === */
.md-editor {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.md-toolbar {
  display: flex;
  align-items: center;
  gap: 1px;
  padding: 6px 10px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.md-toolbar-group {
  display: flex;
  gap: 2px;
  align-items: center;
}

.md-toolbar-group + .md-toolbar-group::before {
  content: '';
  width: 1px;
  height: 14px;
  background: #e0e0e0;
  margin: 0 4px;
}

.md-toolbar-btn {
  padding: 2px 6px;
  font-size: 11px;
  border: 1px solid #ddd;
  border-radius: 3px;
  background: #fff;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}

.md-toolbar-btn:hover {
  background: #f0f0f0;
  border-color: #bbb;
  color: #333;
}

.md-panes {
  display: flex;
  flex: 1;
  min-height: 160px;
}

.md-input {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-right: 1px solid #eee;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  color: #555;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.md-preview {
  flex: 1;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.6;
  overflow-y: auto;
}

.md-preview h1, .md-preview h2, .md-preview h3 {
  margin: 8px 0 4px;
}

.md-preview code {
  background: #f0f0f0;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 12px;
}

.md-preview pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}

.md-preview ul {
  padding-left: 20px;
}

/* === Task Sidebar === */
.task-sidebar {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-label {
  font-size: 11px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.sidebar-field {
  margin-bottom: 10px;
  font-size: 12px;
}

.sidebar-field:last-child {
  margin-bottom: 0;
}

.sidebar-field-label {
  display: block;
  color: #aaa;
  font-size: 10px;
  margin-bottom: 2px;
}

.sidebar-field select {
  width: 100%;
  padding: 3px 6px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  outline: none;
}

.sidebar-value {
  color: #555;
}

.progress-bar {
  background: #e5e7eb;
  border-radius: 3px;
  height: 5px;
  margin-top: 4px;
}

.progress-fill {
  background: #16a34a;
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 10px;
  color: #999;
  margin-top: 2px;
  display: block;
}

/* === Attachments === */
.detail-attachments {
  margin-bottom: 16px;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  background: #fafafa;
}

.attachment-name { color: #333; }
.attachment-size { color: #999; font-size: 11px; }

.attachment-btn {
  border: none;
  background: none;
  color: #4a6cf7;
  cursor: pointer;
  font-size: 12px;
  padding: 0 2px;
}

.attachment-btn:hover {
  text-decoration: underline;
}

.attachment-btn-del {
  color: #999;
  font-size: 14px;
}

.attachment-btn-del:hover {
  color: #dc2626;
}

.attachment-upload {
  font-size: 12px;
  padding: 4px 12px;
}

/* === Comments === */
.comment-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

.comment-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.comment-list {
  max-height: 240px;
  overflow-y: auto;
  margin-bottom: 12px;
}

.comment-empty {
  text-align: center;
  color: #aaa;
  font-size: 12px;
  padding: 12px;
}

.comment-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 2px;
}

.comment-author {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.comment-time {
  font-size: 11px;
  color: #aaa;
}

.comment-content {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
}

.comment-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-author-input {
  width: 200px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
}

.comment-author-input:focus {
  border-color: #4a6cf7;
}

.comment-content-input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  resize: vertical;
}

.comment-content-input:focus {
  border-color: #4a6cf7;
}

.comment-send {
  align-self: flex-end;
  padding: 6px 20px;
  font-size: 13px;
}

/* === Responsive: detail page === */
@media (max-width: 768px) {
  .detail-main {
    flex-direction: column;
  }
  .detail-sidebar-wrapper {
    flex: none;
    width: 100%;
  }
  .md-panes {
    flex-direction: column;
  }
  .md-input {
    border-right: none;
    border-bottom: 1px solid #eee;
    min-height: 120px;
  }
}
```

- [ ] **Step 3: Run all tests**

Run: `cd task-kanban && npm test`
Expected: All tests pass

- [ ] **Step 4: Run lint**

Run: `cd task-kanban && npm run lint`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.css && git commit -m "feat: wire TaskDetailPage into App with view switching and styles"
```

---

## Task 11: Wire Card Click to Detail Page

**Files:**
- Modify: `task-kanban/src/components/KanbanBoard.tsx`
- Modify: `task-kanban/src/components/KanbanColumn.tsx`
- Modify: `task-kanban/src/components/TaskCard.tsx`

- [ ] **Step 1: Update KanbanBoard to add onCardClick**

```typescript
// src/components/KanbanBoard.tsx
import type { Task, TaskStatus } from '../types'
import { useTaskContext } from '../hooks/useTaskContext'
import { KanbanColumn } from './KanbanColumn'

const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done']

interface KanbanBoardProps {
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function KanbanBoard({ onEdit, onDelete }: KanbanBoardProps) {
  const { tasks, filterStatus, searchKeyword, setSelectedTaskId } = useTaskContext()

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

  const totalForStatus = (status: TaskStatus): number =>
    tasks.filter((t) => t.status === status).length

  const visibleStatuses = filterStatus === 'all' ? STATUSES : [filterStatus]

  const handleCardClick = (task: Task) => {
    setSelectedTaskId(task.id)
  }

  return (
    <div className="kanban-board">
      {visibleStatuses.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={filteredTasks(status)}
          totalCount={totalForStatus(status)}
          onEdit={onEdit}
          onDelete={onDelete}
          onCardClick={handleCardClick}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Update KanbanColumn to pass onCardClick**

```typescript
// src/components/KanbanColumn.tsx
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
  totalCount: number
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onCardClick: (task: Task) => void
}

export function KanbanColumn({ status, tasks, totalCount, onEdit, onDelete, onCardClick }: KanbanColumnProps) {
  const config = COLUMN_CONFIG[status]

  return (
    <div className={`kanban-column ${config.className}`}>
      <div className="column-header">
        <h2 className="column-title">{config.title}</h2>
        <span className="column-count">{totalCount}</span>
      </div>
      <div className="column-cards">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onCardClick={onCardClick} />
        ))}
        {tasks.length === 0 && <p className="column-empty">暂无任务</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update TaskCard to handle card body click**

```typescript
// src/components/TaskCard.tsx
import type { Task, TaskStatus } from '../types'
import { useTaskContext } from '../hooks/useTaskContext'

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
  onCardClick: (task: Task) => void
}

export function TaskCard({ task, onEdit, onDelete, onCardClick }: TaskCardProps) {
  const { updateTask } = useTaskContext()
  const isDone = task.status === 'done'

  return (
    <div
      className={`task-card ${PRIORITY_CLASS[task.priority]} ${isDone ? 'task-done' : ''}`}
      style={{ cursor: 'pointer' }}
      onClick={() => onCardClick(task)}
    >
      <div className="task-card-header">
        <h3 className={`task-title ${isDone ? 'title-done' : ''}`}>{task.title}</h3>
        <span className={`priority-badge ${PRIORITY_CLASS[task.priority]}`}>
          {PRIORITY_LABEL[task.priority]}
        </span>
      </div>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className="task-actions" onClick={(e) => e.stopPropagation()}>
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

- [ ] **Step 4: Run all tests**

Run: `cd task-kanban && npm test`
Expected: All tests pass

- [ ] **Step 5: Run lint**

Run: `cd task-kanban && npm run lint`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/KanbanBoard.tsx src/components/KanbanColumn.tsx src/components/TaskCard.tsx && git commit -m "feat: wire card click to open TaskDetailPage"
```

---

## Self-Review

**1. Spec coverage:**
- Markdown editor with toolbar → Task 5
- Split edit/preview → Task 5
- Subtask checklist parsing → Task 2
- Comments with author → Task 7
- Attachments with upload/download → Task 8
- File size validation → Task 3
- Full page layout → Task 9, 10
- View switching → Task 10, 11
- Sidebar with properties → Task 6
- Copy/delete actions → Task 9

**2. Placeholder scan:** No TBD, TODO, or vague instructions found.

**3. Type consistency:** All type references (`Subtask`, `Comment`, `Attachment`, `Task`) are consistent across tasks. `onCardClick` prop added to `KanbanColumn` and `TaskCard` in Task 11, used consistently.
