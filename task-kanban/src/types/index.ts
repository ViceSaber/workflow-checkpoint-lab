import type { Subtask, Comment, Attachment } from './subtask'

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type Priority = 'high' | 'medium' | 'low'
export type AvatarColor = 'pink' | 'blue' | 'green' | 'purple' | 'orange'
export type TagName = '紧急' | '设计' | '开发' | '功能' | '优化' | '营销'

export interface Assignee {
  id: string
  name: string
  initial: string
  color: AvatarColor
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  createdAt: number
  subtasks?: Subtask[]
  comments?: Comment[]
  attachments?: Attachment[]
  dueDate?: string
  assignee?: Assignee
  tags?: TagName[]
}

export type { Subtask, Comment, Attachment }
