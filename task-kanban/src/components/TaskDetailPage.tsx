import { useState } from 'react'
import { useTaskContext } from '../hooks/useTaskContext'
import { MarkdownEditor } from './MarkdownEditor'
import { TaskSidebar } from './TaskSidebar'
import { CommentSection } from './CommentSection'
import { AttachmentList } from './AttachmentList'
import { ConfirmDialog } from './ConfirmDialog'
import { parseSubtasks } from '../utils/subtaskParser'

const PRIORITY_LABEL: Record<string, string> = { high: '高', medium: '中', low: '低' }

export function TaskDetailPage() {
  const { tasks, selectedTaskId, setSelectedTaskId, updateTask, deleteTask, addTask } = useTaskContext()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const task = tasks.find((t) => t.id === selectedTaskId)
  if (!task) return null

  const subtasks = parseSubtasks(task.description)
  const doneCount = subtasks.filter((s) => s.done).length

  const handleBack = () => setSelectedTaskId(null)

  const handleCopy = () => {
    addTask({
      title: `${task.title} (副本)`,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      assignee: task.assignee,
      tags: task.tags,
    })
  }

  const handleDeleteConfirm = () => {
    deleteTask(task.id)
    setSelectedTaskId(null)
  }

  const handleDescriptionChange = (value: string) => {
    const parsed = parseSubtasks(value)
    updateTask(task.id, { description: value, subtasks: parsed })
  }

  const priorityClass = `priority-${task.priority}`
  const statusLabel = task.status === 'todo' ? '待办' : task.status === 'in-progress' ? '进行中' : '已完成'

  return (
    <div className="task-detail">
      {/* Top bar */}
      <div className="detail-topbar">
        <button type="button" className="btn-back" onClick={handleBack}>
          ← 返回看板
        </button>
        <span className="detail-timestamp">
          编辑于 {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Title row */}
      <div className="detail-title-row">
        <h1 className="detail-title">{task.title}</h1>
        <div className="detail-actions">
          <button type="button" className="action-icon" onClick={handleCopy} title="复制任务">📋</button>
          <button
            type="button"
            className="action-icon action-delete"
            onClick={() => setShowDeleteConfirm(true)}
            title="删除任务"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Badge row */}
      <div className="detail-badges">
        <span className={`badge ${priorityClass}`}>{PRIORITY_LABEL[task.priority]}优先级</span>
        <span className={`badge badge-status-${task.status}`}>{statusLabel}</span>
        <span className="badge-sep">·</span>
        <span className="badge-text">
          创建于 {new Date(task.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </span>
        {subtasks.length > 0 && (
          <>
            <span className="badge-sep">·</span>
            <span className="badge-text">子任务 {doneCount}/{subtasks.length}</span>
          </>
        )}
      </div>

      {/* Editor + Sidebar (stretch aligned) */}
      <div className="detail-main">
        <div className="detail-editor">
          <MarkdownEditor value={task.description} onChange={handleDescriptionChange} />
        </div>
        <div className="detail-sidebar-wrapper">
          <TaskSidebar task={task} />
        </div>
      </div>

      {/* Attachments */}
      <div className="detail-attachments">
        <AttachmentList task={task} />
      </div>

      {/* Comments */}
      <CommentSection task={task} />

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <ConfirmDialog
          message={`确定要删除任务「${task.title}」吗？`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
