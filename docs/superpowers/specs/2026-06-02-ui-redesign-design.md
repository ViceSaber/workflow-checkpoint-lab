# UI Redesign: Dark Theme Kanban Board

**Date:** 2026-06-02
**Status:** Draft
**Approach:** Incremental CSS rewrite (Approach A)

## Overview

Redesign the task kanban board from a light-themed simple layout to a modern dark-themed professional UI with sidebar navigation, enriched task cards, and polished visual details. The reference mockup is at `docs/superpowers/specs/ui-mockup.html`.

## Layout Structure

### Sidebar (fixed, 240px, left)
- Dark background `#1a1d23` with `#2d3239` border-right
- Logo + app name at top
- Navigation items: 仪表盘, 项目, 任务 (active), 日历 — decorative only, no routing
- Label section: 设计, 开发, 营销 — decorative colored dots
- User avatar + name + role at bottom
- Collapses to hidden on mobile (< 768px)

### Top Header (inside main area)
- Background `#1a1d23`
- Page title "任务看板" on left
- Search input (styled dark) center
- Notification bell + "新建任务" gradient button on right

### Filter Bar (below header)
- Status filters: 全部 / 待办 / 进行中 / 已完成
- Divider
- Priority filters: 高优先级 / 中优先级 / 低优先级
- Styled as rounded chips with purple active state

### Kanban Board Area
- Background `#12151a` (darkest layer)
- Three columns: 待办 / 进行中 / 已完成
- Each column has: colored dot + title + count badge
- Columns scroll independently

## Color System

| Token | Value | Usage |
|-------|-------|-------|
| bg-base | `#12151a` | Board area background |
| bg-surface | `#1a1d23` | Sidebar, header background |
| bg-card | `#1e2228` | Task card background |
| bg-elevated | `#252830` | Search box, count badge, progress track |
| border | `#2d3239` | All borders |
| border-hover | `#3d4450` | Card hover border |
| text-primary | `#e1e4e8` | Headings, card titles |
| text-secondary | `#cdd3de` | Column titles |
| text-muted | `#6b7585` | Descriptions, dates |
| text-dim | `#4a5568` | Placeholder text |
| accent-purple | `#6c5ce7` / `#a29bfe` | Primary accent, active states |
| priority-high | `#e84393` / `#fd79a8` | High priority, overdue |
| priority-medium | `#fdcb6e` / `#e17055` | Medium priority |
| priority-low | `#00b894` / `#55efc4` | Low priority, done |
| tag-blue | `#74b9ff` / `#0984e3` | Blue tags |

## Task Card Design

Each card shows:
1. **Priority indicator** — 3px left border (pink=high, yellow=medium, green=low)
2. **Tags** — colored pills with semi-transparent background
3. **Title** — 14px bold white text
4. **Description** — 12px muted, max 2 lines, ellipsis
5. **Progress bar** (if subtasks exist) — thin 4px bar with gradient fill + "N/M" label
6. **Footer** — overlapping assignee avatars (left) + due date (right)

### Card Hover
- Border lightens to `#3d4450`
- 1px upward translate
- Subtle shadow `0 4px 12px rgba(0,0,0,0.3)`

## Data Model Changes

### Task type extensions

```typescript
interface Task {
  // existing fields
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  createdAt: number
  subtasks?: Subtask[]
  comments?: Comment[]
  attachments?: Attachment[]

  // new fields
  dueDate?: string          // ISO date string, e.g. "2026-06-05"
  assignee?: Assignee       // Preset avatar selection
  tags?: TagName[]          // Colored label tags
}

type TagName = '紧急' | '设计' | '开发' | '功能' | '优化' | '营销'

interface Assignee {
  id: string
  name: string
  initial: string   // first character, displayed in avatar circle
  color: AvatarColor // determines gradient
}

type AvatarColor = 'pink' | 'blue' | 'green' | 'purple' | 'orange'
```

### Preset avatars

The app ships with 5 preset assignees users can pick from:

| ID | Name | Initial | Color |
|----|------|---------|-------|
| a1 | 张三 | 张 | pink |
| a2 | 李四 | 李 | blue |
| a3 | 王五 | 王 | green |
| a4 | 赵六 | 赵 | purple |
| a5 | 周七 | 周 | orange |

### Tag color mapping

| Tag | Background | Text |
|-----|-----------|------|
| 紧急 | `rgba(232,67,147,0.2)` | `#fd79a8` |
| 设计 | `rgba(108,92,231,0.2)` | `#a29bfe` |
| 开发 | `rgba(0,184,148,0.2)` | `#55efc4` |
| 功能 | `rgba(116,185,255,0.2)` | `#74b9ff` |
| 优化 | `rgba(253,203,110,0.2)` | `#fdcb6e` |
| 营销 | `rgba(253,203,110,0.2)` | `#fdcb6e` |

## New Components

| Component | Purpose |
|-----------|---------|
| `Sidebar` | Left navigation with logo, nav items, labels, user section |
| `Avatar` | Circular avatar with gradient + initial letter |
| `Tag` | Colored pill badge for task categories |
| `ProgressBar` | Thin progress indicator for subtask completion |
| `DueDate` | Date display with overdue detection and red highlighting |

## Modified Components

| Component | Changes |
|-----------|---------|
| `App.tsx` | Add Sidebar, restructure layout to sidebar + main |
| `App.css` | Full dark theme rewrite, new layout system |
| `Header.tsx` | Integrate into top-header bar, add notification button |
| `TaskCard.tsx` | Add tags, avatars, progress bar, due date, priority border |
| `KanbanBoard.tsx` | Dark column styling, colored dots |
| `KanbanColumn.tsx` | Dark card list background |
| `TaskFormModal.tsx` | Add due date picker, assignee selector, tag checkboxes |
| `StatusFilter.tsx` | Restyle as dark filter chips |
| `PriorityFilter.tsx` | Restyle as dark filter chips |
| `TaskDetailPage.tsx` | Dark theme styling |
| `MarkdownEditor.tsx` | Dark theme styling |

## Mobile Responsive (< 768px)

- Sidebar hidden entirely
- Hamburger button in top-header to toggle sidebar overlay
- Columns stack vertically
- Card descriptions hidden to save space

## Migration / Backward Compatibility

- Tasks without `dueDate`, `assignee`, or `tags` render normally (fields are optional)
- Existing localStorage data continues to work — new fields default to undefined
- No data migration script needed

## Scope Exclusions

- No real user authentication
- No multi-project support
- No drag-and-drop between columns
- No notification system (bell is decorative)
- No backend/API changes
