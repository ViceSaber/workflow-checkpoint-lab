# 优先级筛选功能设计

## 背景

任务看板已实现优先级的类型定义、卡片展示和表单编辑，但缺少按优先级筛选的能力。本设计补齐该功能，并审查现有优先级实现的正确性。

## 需求

1. 新增优先级筛选器（全部/高/中/低），与现有状态筛选、关键词搜索组合使用
2. 旧 localStorage 数据中无 `priority` 字段的任务兼容为 `'medium'`，不报错

## 现有实现审查

| 文件 | 状态 |
|------|------|
| `types/index.ts` — `Priority` 类型 | 正常 |
| `TaskCard.tsx` — 优先级徽章 | 正常 |
| `TaskFormModal.tsx` — 新增/编辑选优先级 | 正常 |
| `TaskDetailPage.tsx` — 详情页展示优先级 | 正常 |
| `useTasks.ts` — reducer/seed 含 priority | 正常 |

现有实现无问题，只需新增筛选功能。

## 设计

### 方案：Context 扩展 + 新组件（最小改动）

在现有 Context 模式上加 `filterPriority` 状态，与 `filterStatus` 完全对称。

### 1. 数据兼容层

**文件**：`src/hooks/useTasks.ts` — `loadTasks()`

`JSON.parse` 后 normalize 每条任务，补全缺失或非法的 `priority`：

```typescript
return tasks.map(t => ({
  ...t,
  priority: (['high','medium','low'].includes(t.priority) ? t.priority : 'medium') as Priority,
}))
```

### 2. Context 扩展

**文件**：`src/context/taskContextDef.ts`

新增两个成员：

```typescript
filterPriority: Priority | 'all'
setFilterPriority: (priority: Priority | 'all') => void
```

**文件**：`src/context/TaskContext.tsx`

新增 state：

```typescript
const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
```

### 3. PriorityFilter 组件

**新文件**：`src/components/PriorityFilter.tsx`

与 `StatusFilter` 风格一致的按钮组：`[全部] [高] [中] [低]`

```typescript
const FILTERS: { label: string; value: Priority | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
]
```

### 4. Header 布局

**文件**：`src/components/Header.tsx`

在 `StatusFilter` 旁边添加 `PriorityFilter`，两者并排于 `header-controls` 中。

### 5. 筛选逻辑

**文件**：`src/components/KanbanBoard.tsx`

`filteredTasks` 在 status 过滤后、keyword 过滤前，插入 priority 过滤：

```typescript
if (filterPriority !== 'all') {
  result = result.filter((t) => t.priority === filterPriority)
}
```

## 改动清单

| 文件 | 改动 |
|------|------|
| `src/hooks/useTasks.ts` | `loadTasks` 添加 priority normalize |
| `src/context/taskContextDef.ts` | 接口新增 `filterPriority` + `setFilterPriority` |
| `src/context/TaskContext.tsx` | 新增 `filterPriority` state |
| `src/components/PriorityFilter.tsx` | **新建** — 优先级筛选按钮组 |
| `src/components/Header.tsx` | 引入 PriorityFilter |
| `src/components/KanbanBoard.tsx` | 筛选逻辑增加 priority 条件 |

## 风险

- **无破坏性变更**：所有改动向后兼容，现有功能不受影响
- **旧数据**：normalize 保证无 priority 的任务不会导致运行时错误
