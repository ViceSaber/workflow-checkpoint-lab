import './Sidebar.css'

const NAV_ITEMS = [
  { label: '仪表盘', icon: 'dashboard' },
  { label: '项目', icon: 'folder' },
  { label: '任务', icon: 'check', active: true },
  { label: '日历', icon: 'calendar' },
]

const LABELS = [
  { label: '设计', color: '#6c5ce7' },
  { label: '开发', color: '#00b894' },
  { label: '营销', color: '#fdcb6e' },
]

const ICONS: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  folder: '<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>',
  check: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
}

function NavIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <g dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }} />
    </svg>
  )
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">K</div>
        <span className="logo-text">Kanban Pro</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <div key={item.label} className={`nav-item ${item.active ? 'active' : ''}`}>
            <NavIcon name={item.icon} />
            {item.label}
          </div>
        ))}
        <div className="nav-section-label">标签</div>
        {LABELS.map((lb) => (
          <div key={lb.label} className="nav-item">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: lb.color, flexShrink: 0 }} />
            {lb.label}
          </div>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="user-avatar">张</div>
        <div className="user-info">
          <div className="user-name">张三</div>
          <div className="user-role">产品经理</div>
        </div>
      </div>
    </aside>
  )
}
