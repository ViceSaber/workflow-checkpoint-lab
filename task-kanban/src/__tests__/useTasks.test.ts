import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useTasks } from '../hooks/useTasks'

describe('useTasks', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('task-kanban-seeded', '1')
  })

  it('returns empty tasks initially when localStorage is empty', () => {
    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks).toEqual([])
  })

  it('adds a task', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({
        title: 'Test task',
        description: 'A description',
        priority: 'high',
      })
    })
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Test task')
    expect(result.current.tasks[0].status).toBe('todo')
    expect(result.current.tasks[0].priority).toBe('high')
  })

  it('updates a task', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Original', description: '', priority: 'medium' })
    })
    const id = result.current.tasks[0].id
    act(() => {
      result.current.updateTask(id, { title: 'Updated' })
    })
    expect(result.current.tasks[0].title).toBe('Updated')
  })

  it('deletes a task', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'To delete', description: '', priority: 'low' })
    })
    const id = result.current.tasks[0].id
    act(() => {
      result.current.deleteTask(id)
    })
    expect(result.current.tasks).toHaveLength(0)
  })

  it('changes task status', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Task', description: '', priority: 'medium' })
    })
    const id = result.current.tasks[0].id
    act(() => {
      result.current.updateTask(id, { status: 'in-progress' })
    })
    expect(result.current.tasks[0].status).toBe('in-progress')
  })

  it('persists tasks to localStorage', () => {
    const { result } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask({ title: 'Persistent', description: '', priority: 'high' })
    })
    const stored = JSON.parse(localStorage.getItem('task-kanban-tasks') || '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe('Persistent')
  })

  it('normalizes tasks missing priority field to medium', () => {
    localStorage.setItem('task-kanban-tasks', JSON.stringify([
      { id: 'old-1', title: 'Legacy task', description: 'desc', status: 'todo', createdAt: Date.now() },
      { id: 'old-2', title: 'Invalid priority', description: '', status: 'in-progress', priority: 'unknown', createdAt: Date.now() },
    ]))
    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks[0].priority).toBe('medium')
    expect(result.current.tasks[1].priority).toBe('medium')
  })

  it('loads tasks from localStorage on init', () => {
    localStorage.setItem('task-kanban-tasks', JSON.stringify([
      {
        id: 'existing-1',
        title: 'Existing task',
        description: 'desc',
        status: 'todo',
        priority: 'low',
        createdAt: Date.now(),
      },
    ]))
    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Existing task')
  })
})
