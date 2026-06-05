import type { TaskStatus } from '../types'
import { useTaskContext } from '../hooks/useTaskContext'

const FILTERS: { label: string; value: TaskStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '待办', value: 'todo' },
  { label: '进行中', value: 'in-progress' },
  { label: '已完成', value: 'done' },
]

export function StatusFilter() {
  const { filterStatus, setFilterStatus } = useTaskContext()

  return (
    <>
      {FILTERS.map((f) => (
        <button
          key={f.value}
          className={`filter-chip ${filterStatus === f.value ? 'active' : ''}`}
          onClick={() => setFilterStatus(f.value)}
        >
          {f.label}
        </button>
      ))}
    </>
  )
}
