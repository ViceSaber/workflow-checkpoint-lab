import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Sidebar } from '../components/Sidebar'

describe('Sidebar', () => {
  it('renders app logo', () => {
    render(<Sidebar />)
    expect(screen.getByText('Kanban Pro')).toBeInTheDocument()
  })

  it('renders navigation items', () => {
    render(<Sidebar />)
    expect(screen.getByText('仪表盘')).toBeInTheDocument()
    expect(screen.getByText('任务')).toBeInTheDocument()
    expect(screen.getByText('日历')).toBeInTheDocument()
  })

  it('marks 任务 as active', () => {
    render(<Sidebar />)
    const taskItem = screen.getByText('任务').closest('.nav-item')
    expect(taskItem?.classList.contains('active')).toBe(true)
  })

  it('renders user section', () => {
    render(<Sidebar />)
    expect(screen.getByText('张三')).toBeInTheDocument()
  })
})
