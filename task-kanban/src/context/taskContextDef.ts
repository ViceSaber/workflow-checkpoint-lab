import { createContext } from 'react'
import type { Task, TaskStatus, Priority, Assignee, TagName } from '../types'

export interface TaskContextValue {
  tasks: Task[]
  addTask: (payload: { title: string; description: string; priority: Priority; dueDate?: string; assignee?: Assignee; tags?: TagName[] }) => void
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  filterStatus: TaskStatus | 'all'
  setFilterStatus: (status: TaskStatus | 'all') => void
  filterPriority: Priority | 'all'
  setFilterPriority: (priority: Priority | 'all') => void
  searchKeyword: string
  setSearchKeyword: (keyword: string) => void
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
}

export const TaskContext = createContext<TaskContextValue | null>(null)
