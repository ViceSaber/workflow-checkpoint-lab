import type { Task, TaskStatus } from '../types'
import { useTaskContext } from '../hooks/useTaskContext'
import { Tag } from './Tag'
import { Avatar } from './Avatar'
import { ProgressBar } from './ProgressBar'
import { DueDate } from './DueDate'

const STATUS_OPTIONS: { label: string; value: TaskStatus }[] = [
  { label: '待办', value: 'todo' },
  { label: '进行中', value: 'in-progress' },
  { label: '已完成', value: 'done' },
]

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onCardClick: (task: Task) => void
}

export function TaskCard({ task, onEdit, onDelete, onCardClick }: TaskCardProps) {
  const { updateTask } = useTaskContext()
  const isDone = task.status === 'done'
  const subtasks = task.subtasks
  const doneCount = subtasks ? subtasks.filter((s) => s.done).length : 0

  return (
    <div
      className={`task-card ${task.priority} ${isDone ? 'task-done' : ''}`}
      onClick={() => onCardClick(task)}
      style={{ cursor: 'pointer' }}
    >
      {task.tags && task.tags.length > 0 && (
        <div className="card-tags">
          {task.tags.map((tag) => <Tag key={tag} name={tag} />)}
        </div>
      )}
      <div className="card-title">{task.title}</div>
      {task.description && <div className="card-desc">{task.description}</div>}
      {subtasks && subtasks.length > 0 && (
        <ProgressBar done={doneCount} total={subtasks.length} />
      )}
      <div className="card-footer">
        <div className="card-avatars">
          {task.assignee && (
            <Avatar initial={task.assignee.initial} color={task.assignee.color} />
          )}
        </div>
        {task.dueDate && <DueDate date={task.dueDate} />}
        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
          <select
            className="status-select"
            value={task.status}
            onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="btn-icon" onClick={() => onEdit(task)} title="编辑">✎</button>
          <button className="btn-icon btn-danger" onClick={() => onDelete(task)} title="删除">✕</button>
        </div>
      </div>
    </div>
  )
}
