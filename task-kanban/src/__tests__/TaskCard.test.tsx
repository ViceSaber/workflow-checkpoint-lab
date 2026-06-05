import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { Task } from '../types'
import { TaskCard } from '../components/TaskCard'

vi.mock('../hooks/useTaskContext', () => ({
  useTaskContext: () => ({ updateTask: vi.fn() }),
}))

const baseTask: Task = {
  id: '1',
  title: 'Test task',
  description: 'A description',
  status: 'todo',
  priority: 'high',
  createdAt: Date.now(),
}

describe('TaskCard', () => {
  it('renders title', () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} onCardClick={vi.fn()} />)
    expect(screen.getByText('Test task')).toBeInTheDocument()
  })

  it('renders tags when present', () => {
    const task: Task = { ...baseTask, tags: ['设计', '紧急'] }
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} onCardClick={vi.fn()} />)
    expect(screen.getByText('设计')).toBeInTheDocument()
    expect(screen.getByText('紧急')).toBeInTheDocument()
  })

  it('renders assignee avatar when present', () => {
    const task = { ...baseTask, assignee: { id: 'a1', name: '张三', initial: '张', color: 'pink' as const } }
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} onCardClick={vi.fn()} />)
    expect(screen.getByText('张')).toBeInTheDocument()
  })

  it('renders progress bar when subtasks exist', () => {
    const task = {
      ...baseTask,
      subtasks: [{ id: 's1', text: 'a', done: true }, { id: 's2', text: 'b', done: false }],
    }
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} onCardClick={vi.fn()} />)
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('renders due date', () => {
    const future = new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10)
    const task = { ...baseTask, dueDate: future }
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} onCardClick={vi.fn()} />)
    expect(screen.getByText(/月/)).toBeInTheDocument()
  })
})
