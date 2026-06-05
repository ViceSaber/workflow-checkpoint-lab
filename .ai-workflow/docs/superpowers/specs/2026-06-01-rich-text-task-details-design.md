# Design: Rich Text Task Details

Date: 2026-06-01
Status: Draft

## Overview

Add a full-page task detail view with Markdown editor (split edit/preview), subtask checklist, comments, and file attachments to the personal task kanban. Zero backend — all data persisted to localStorage.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Detail view entry | Full page (state switch) | No router dependency; state-driven component swap |
| Markdown rendering | marked.js | Lightweight (~40KB), sufficient for kanban tool |
| Toolbar style | Gray outline buttons | Subtle, not visually dominant |
| Attachments storage | localStorage base64 | Simple; single-file 500KB limit, 2MB per task |
| Comments author | Free-text input, remembered in localStorage | No auth system |
| View switching | `selectedTaskId` state | `<App>` renders `KanbanBoard` or `TaskDetailPage` |

## Data Model Changes

```typescript
// Existing
interface Task {
  id: string
  title: string
  description: string        // now stores Markdown source
  status: TaskStatus
  priority: Priority
  createdAt: number
}

// New fields added to Task
interface Task {
  // ...existing fields...
  subtasks?: Subtask[]
  comments?: Comment[]
  attachments?: Attachment[]
}

interface Subtask {
  id: string
  text: string
  done: boolean
}

interface Comment {
  id: string
  author: string
  content: string
  createdAt: number
}

interface Attachment {
  id: string
  name: string
  type: string        // MIME type
  size: number        // bytes
  data: string        // base64
  uploadedAt: number
}
```

### Subtask Parsing

Subtasks are derived from Markdown `- [ ]` / `- [x]` syntax in the description. On every description change:

1. Parse lines matching `/^- \[([ xX])] (.+)$/`
2. Build `Subtask[]` from matches
3. Store as `task.subtasks` for quick progress calculation
4. When user toggles a checkbox in preview, update the Markdown source line and the subtask

## New Components

### TaskDetailPage
Full-page container. Receives `taskId`, renders:
- Top bar: back button + last-edited timestamp
- Title row: editable title + copy/delete icon buttons
- Badge row: priority, status badges, created date, subtask progress
- Main area (flex row):
  - Left: MarkdownEditor
  - Right: TaskSidebar (stretch-aligned, same height)
- Below main area: AttachmentList
- Bottom: CommentSection

### MarkdownEditor
Split-pane editor:
- Toolbar: gray outline buttons (B, I, S, |, H1-H3, |, UL, OL, {}, link, |, subtask)
- Left pane: plain `<textarea>` with Markdown source
- Right pane: rendered HTML via marked.js
- Toolbar click inserts Markdown syntax at cursor position

### TaskSidebar
Right panel with:
- Status `<select>`
- Priority `<select>`
- Created time (display only)
- Subtask progress bar (done/total)

### AttachmentList
Below the editor:
- List of uploaded files (name + size + download + delete)
- Upload button → hidden `<input type="file">` → FileReader → base64
- Validation: reject > 500KB single file, > 2MB total per task

### CommentSection
Below attachments:
- Scrollable list of `CommentItem` components
- Input area: author name (pre-filled from localStorage) + content textarea + send button

### CommentItem
Single comment: author name (bold) + content + relative timestamp

## Layout (v7 approved)

```
┌── Top bar: ← 返回看板 ─────────────────── 编辑于 X 分钟前 ──┐
├─────────────────────────────────────────────────────────────┤
│ 标题文本                                    📋 🗑             │
│ 高优先级 · 已完成 · 创建于 2026-05-28 14:30 · 子任务 2/4    │
├────────────────────────────────┬────────────────────────────┤
│ [Toolbar: B I S | H1 H2 H3 | UL OL {} 🔗 | ☐]             │
│ ┌─ 编辑 (Markdown) ─┬─ 预览 ─┐│ 属性                       │
│ │ ## 需求分析        │ 需求分析││ 状态 [已完成 ▾]            │
│ │ - [x] 设计流程图   │ ☑ 设计 ││ 优先级 [高 ▾]              │
│ │ - [ ] API 调整     │ ☐ API  ││ 创建时间 2026-05-28 14:30  │
│ └───────────────────┴────────┘│ 子任务 ████░░░░ 2/4        │
├────────────────────────────────┴────────────────────────────┤
│ 📎 截图.png (120KB) [下载] [×]  📎 需求文档.pdf (340KB) [下载] [×]  [+上传] │
├─────────────────────────────────────────────────────────────┤
│ 💬 评论 (3)                                                 │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 小明 · 2小时前                                          ││
│ │ 方案可行，建议先完成前端部分                              ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ 小红 · 1小时前                                          ││
│ │ API 部分需要和后端确认字段名                             ││
│ └─────────────────────────────────────────────────────────┘
│ [你的名字] [输入评论...]                          [发送]     │
└─────────────────────────────────────────────────────────────┘
```

## Interaction Flow

1. **Card click** → set `selectedTaskId` in context → `App` renders `TaskDetailPage`
2. **Back button** → clear `selectedTaskId` → `App` renders `KanbanBoard`
3. **Editor onChange** → update `task.description` → parse subtasks → update progress
4. **Checkbox toggle** → update Markdown source line + subtask.done → save
5. **Status/priority change** in sidebar → `updateTask()` → saves to localStorage
6. **File upload** → validate size → FileReader → base64 → add to `task.attachments`
7. **File download** → `<a href="data:..." download={name}>` click
8. **Comment submit** → push to `task.comments` → save
9. **Delete task** → ConfirmDialog → `deleteTask()` → return to board

## Constraints

- Single-file limit: 500KB
- Per-task attachment limit: 2MB
- No user auth — author name is free text, stored in localStorage
- No image thumbnails — attachments show name + size only

## Dependencies

- `marked` (MIT) — Markdown to HTML
- `@types/marked` — TypeScript types

## Not In Scope

- WYSIWYG editor
- Image preview/thumbnails
- User authentication
- Real-time collaboration
- Backend / API
