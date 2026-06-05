export interface Subtask {
  id: string
  text: string
  done: boolean
}

export interface Comment {
  id: string
  author: string
  content: string
  createdAt: number
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  data: string
  uploadedAt: number
}