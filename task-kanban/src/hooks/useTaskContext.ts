import { useContext } from 'react'
import { TaskContext } from '../context/taskContextDef'
import type { TaskContextValue } from '../context/taskContextDef'

export function useTaskContext(): TaskContextValue {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider')
  return ctx
}
