interface DueDateProps {
  date: string
}

export function DueDate({ date }: DueDateProps) {
  const d = new Date(date + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const isOverdue = d < now
  const label = `${d.getMonth() + 1}月${d.getDate()}日`

  return (
    <span className={`card-date ${isOverdue ? 'overdue' : ''}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      {isOverdue ? '已逾期' : label}
    </span>
  )
}
