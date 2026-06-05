import { useRef } from 'react'
import type { Task, Attachment } from '../types'
import { useTaskContext } from '../hooks/useTaskContext'
import { validateAttachment } from '../utils/attachmentValidator'

interface AttachmentListProps {
  task: Task
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentList({ task }: AttachmentListProps) {
  const { updateTask } = useTaskContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const attachments = task.attachments ?? []

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateAttachment(file, attachments)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      const attachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        uploadedAt: Date.now(),
      }
      updateTask(task.id, { attachments: [...attachments, attachment] })
    }
    reader.readAsDataURL(file)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDownload = (att: Attachment) => {
    const link = document.createElement('a')
    link.href = att.data
    link.download = att.name
    link.click()
  }

  const handleDelete = (attId: string) => {
    updateTask(task.id, {
      attachments: attachments.filter((a) => a.id !== attId),
    })
  }

  return (
    <div className="attachment-list">
      {attachments.map((att) => (
        <div key={att.id} className="attachment-item">
          <span className="attachment-name">📎 {att.name}</span>
          <span className="attachment-size">({formatSize(att.size)})</span>
          <button type="button" className="attachment-btn" onClick={() => handleDownload(att)}>
            下载
          </button>
          <button type="button" className="attachment-btn attachment-btn-del" onClick={() => handleDelete(att.id)}>
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn-secondary attachment-upload"
        onClick={() => fileInputRef.current?.click()}
      >
        + 上传附件
      </button>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleUpload}
      />
    </div>
  )
}
