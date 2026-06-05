import { useState, useRef, useEffect } from 'react'
import type { Task, Comment } from '../types'
import { useTaskContext } from '../hooks/useTaskContext'
import { CommentItem } from './CommentItem'

const AUTHOR_KEY = 'task-kanban-author'

interface CommentSectionProps {
  task: Task
}

export function CommentSection({ task }: CommentSectionProps) {
  const { updateTask } = useTaskContext()
  const [author, setAuthor] = useState(() => localStorage.getItem(AUTHOR_KEY) || '')
  const [content, setContent] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const comments = task.comments ?? []

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [comments.length])

  const handleSubmit = () => {
    const trimmedAuthor = author.trim()
    const trimmedContent = content.trim()
    if (!trimmedAuthor || !trimmedContent) return

    localStorage.setItem(AUTHOR_KEY, trimmedAuthor)

    const newComment: Comment = {
      id: crypto.randomUUID(),
      author: trimmedAuthor,
      content: trimmedContent,
      createdAt: Date.now(),
    }
    updateTask(task.id, { comments: [...comments, newComment] })
    setContent('')
  }

  return (
    <div className="comment-section">
      <h3 className="comment-title">评论 ({comments.length})</h3>
      <div className="comment-list" ref={listRef}>
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} />
        ))}
        {comments.length === 0 && <p className="comment-empty">暂无评论</p>}
      </div>
      <div className="comment-input">
        <input
          className="comment-author-input"
          type="text"
          placeholder="你的名字"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <textarea
          className="comment-content-input"
          placeholder="输入评论... (Ctrl+Enter 发送)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
          }}
        />
        <button
          className="btn-primary comment-send"
          type="button"
          onClick={handleSubmit}
          disabled={!author.trim() || !content.trim()}
        >
          发送
        </button>
      </div>
    </div>
  )
}
