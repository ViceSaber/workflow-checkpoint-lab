import type { Priority } from '../types'
import { useTaskContext } from '../hooks/useTaskContext'

const FILTERS: { label: string; value: Priority | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '高优先级', value: 'high' },
  { label: '中优先级', value: 'medium' },
  { label: '低优先级', value: 'low' },
]

export function PriorityFilter() {
  const { filterPriority, setFilterPriority } = useTaskContext()

  return (
    <>
      {FILTERS.map((f) => (
        <button
          key={f.value}
          className={`filter-chip ${filterPriority === f.value ? 'active' : ''}`}
          onClick={() => setFilterPriority(f.value)}
        >
          {f.label}
        </button>
      ))}
    </>
  )
}
