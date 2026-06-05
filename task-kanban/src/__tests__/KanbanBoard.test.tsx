import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { TaskStatus, Priority } from '../types'
import { KanbanBoard } from '../components/KanbanBoard'

const mockContext: {
  tasks: { id: string; title: string; description: string; status: string; priority: string; createdAt: number }[]
  addTask: ReturnType<typeof vi.fn>
  updateTask: ReturnType<typeof vi.fn>
  deleteTask: ReturnType<typeof vi.fn>
  filterStatus: TaskStatus | 'all'
  setFilterStatus: ReturnType<typeof vi.fn>
  filterPriority: Priority | 'all'
  setFilterPriority: ReturnType<typeof vi.fn>
  searchKeyword: string
  setSearchKeyword: ReturnType<typeof vi.fn>
  selectedTaskId: string | null
  setSelectedTaskId: ReturnType<typeof vi.fn>
} = {
  tasks: [
    { id: '1', title: 'High task', description: '', status: 'todo', priority: 'high', createdAt: 1 },
    { id: '2', title: 'Medium task', description: '', status: 'todo', priority: 'medium', createdAt: 2 },
    { id: '3', title: 'Low task', description: '', status: 'in-progress', priority: 'low', createdAt: 3 },
  ],
  addTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  filterStatus: 'all',
  setFilterStatus: vi.fn(),
  filterPriority: 'high',
  setFilterPriority: vi.fn(),
  searchKeyword: '',
  setSearchKeyword: vi.fn(),
  selectedTaskId: null,
  setSelectedTaskId: vi.fn(),
}

vi.mock('../hooks/useTaskContext', () => ({
  useTaskContext: () => mockContext,
}))

describe('KanbanBoard with priority filter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows only high-priority tasks when filterPriority is high', () => {
    mockContext.filterPriority = 'high'
    mockContext.filterStatus = 'all'

    render(<KanbanBoard onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('High task')).toBeInTheDocument()
    expect(screen.queryByText('Medium task')).not.toBeInTheDocument()
    expect(screen.queryByText('Low task')).not.toBeInTheDocument()
  })

  it('shows all tasks when filterPriority is all', () => {
    mockContext.filterPriority = 'all'
    mockContext.filterStatus = 'all'

    render(<KanbanBoard onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('High task')).toBeInTheDocument()
    expect(screen.getByText('Medium task')).toBeInTheDocument()
    expect(screen.getByText('Low task')).toBeInTheDocument()
  })

  it('combines status and priority filters', () => {
    mockContext.filterPriority = 'medium'
    mockContext.filterStatus = 'todo'

    render(<KanbanBoard onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByText('High task')).not.toBeInTheDocument()
    expect(screen.getByText('Medium task')).toBeInTheDocument()
    expect(screen.queryByText('Low task')).not.toBeInTheDocument()
  })
})
