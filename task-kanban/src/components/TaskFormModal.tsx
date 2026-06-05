import { useState } from 'react'
import type { Task, Priority, TagName, Assignee } from '../types'
import { ASSIGNEES } from '../constants/assignees'
import { TAG_NAMES } from '../constants/tags'

interface TaskFormModalProps {
  task?: Task | null
  onSubmit: (data: {
    title: string; description: string; priority: Priority;
    dueDate?: string; assignee?: Assignee; tags?: TagName[]
  }) => void
  onClose: () => void
}

export function TaskFormModal({ task, onSubmit, onClose }: TaskFormModalProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [assigneeId, setAssigneeId] = useState(task?.assignee?.id ?? '')
  const [selectedTags, setSelectedTags] = useState<TagName[]>(task?.tags ?? [])

  const toggleTag = (tag: TagName) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const assignee = ASSIGNEES.find((a) => a.id === assigneeId)
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || undefined,
      assignee: assignee || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{task ? '编辑任务' : '新增任务'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">标题 *</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="输入任务标题" autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="description">描述</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="输入任务描述" rows={3} />
          </div>
          <div className="form-group">
            <label htmlFor="priority">优先级</label>
            <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dueDate">截止日期</label>
            <input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="assignee">负责人</label>
            <select id="assignee" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">未指定</option>
              {ASSIGNEES.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>标签</label>
            <div className="tag-checkboxes">
              {TAG_NAMES.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-toggle ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>取消</button>
            <button type="submit" className="btn-primary" disabled={!title.trim()}>
              {task ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
