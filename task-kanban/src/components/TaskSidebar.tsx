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
