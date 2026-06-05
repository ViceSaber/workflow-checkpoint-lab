import { useState, type ReactNode } from 'react'
import type { TaskStatus, Priority } from '../types'
import { useTasks } from '../hooks/useTasks'
import { TaskContext } from './taskContextDef'

export function TaskProvider({ children }: { children: ReactNode }) {
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        filterStatus,
        setFilterStatus,
        filterPriority,
        setFilterPriority,
        searchKeyword,
        setSearchKeyword,
        selectedTaskId,
        setSelectedTaskId,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}
