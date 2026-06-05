import { useTaskContext } from '../hooks/useTaskContext'
import { PriorityFilter } from './PriorityFilter'
import { StatusFilter } from './StatusFilter'

interface HeaderProps {
  onNewTask: () => void
}

export function Header({ onNewTask }: HeaderProps) {
  const { searchKeyword, setSearchKeyword } = useTaskContext()

  return (
    <>
      <div className="top-header">
        <h1 className="page-title">任务看板</h1>
        <div className="header-spacer" />
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
        <div className="notification-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span className="notification-dot" />
        </div>
        <button className="new-task-btn" onClick={onNewTask}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          新建任务
        </button>
      </div>
      <div className="filter-bar">
        <StatusFilter />
        <div className="filter-divider" />
        <PriorityFilter />
      </div>
    </>
  )
}
