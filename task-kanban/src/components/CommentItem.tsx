import type { Comment } from '../types'

interface CommentItemProps {
  comment: Comment
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="comment-author">{comment.author}</span>
        <span className="comment-time">{relativeTime(comment.createdAt)}</span>
      </div>
      <div className="comment-content">{comment.content}</div>
    </div>
  )
}
