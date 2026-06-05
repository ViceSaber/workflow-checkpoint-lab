import type { Task, TaskStatus } from '../types'
import { TaskCard } from './TaskCard'

const COLUMN_CONFIG: Record<TaskStatus, { title: string; dotClass: string }> = {
  todo: { title: '待办', dotClass: 'todo' },
  'in-progress': { title: '进行中', dotClass: 'in-progress' },
  done: { title: '已完成', dotClass: 'done' },
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
    <div className="column">
      <div className="column-header">
        <span className={`column-dot ${config.dotClass}`} />
        <span className="column-title">{config.title}</span>
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
