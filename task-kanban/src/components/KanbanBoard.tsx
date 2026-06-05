import type { Task, TaskStatus } from '../types'
import { useTaskContext } from '../hooks/useTaskContext'
import { KanbanColumn } from './KanbanColumn'

const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done']

interface KanbanBoardProps {
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function KanbanBoard({ onEdit, onDelete }: KanbanBoardProps) {
  const { tasks, filterStatus, filterPriority, searchKeyword, setSelectedTaskId } = useTaskContext()

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
