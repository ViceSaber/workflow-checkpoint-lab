interface ProgressBarProps {
  done: number
  total: number
}

export function ProgressBar({ done, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="card-progress">
      <div className="progress-label">
        <span>进度</span>
        <span>{done}/{total}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
