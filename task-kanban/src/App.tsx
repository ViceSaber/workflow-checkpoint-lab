import { useState } from 'react'
import type { Task, Priority, Assignee, TagName } from './types'
import { TaskProvider } from './context/TaskContext'
import { useTaskContext } from './hooks/useTaskContext'
import { Header } from './components/Header'
import { KanbanBoard } from './components/KanbanBoard'
import { TaskFormModal } from './components/TaskFormModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { TaskDetailPage } from './components/TaskDetailPage'
import { Sidebar } from './components/Sidebar'
import './App.css'

function AppContent() {
  const { addTask, updateTask, deleteTask, selectedTaskId } = useTaskContext()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const handleNewTask = () => {
    setEditingTask(null)
    setShowForm(true)
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleDelete = (task: Task) => {
    setDeletingTask(task)
  }

  const handleFormSubmit = (data: {
    title: string; description: string; priority: Priority;
    dueDate?: string; assignee?: Assignee; tags?: TagName[]
  }) => {
    if (editingTask) {
      updateTask(editingTask.id, data)
    } else {
      addTask(data)
    }
    setShowForm(false)
    setEditingTask(null)
  }

  const handleDeleteConfirm = () => {
    if (deletingTask) {
      deleteTask(deletingTask.id)
      setDeletingTask(null)
    }
  }

  if (selectedTaskId) {
    return <TaskDetailPage />
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main">
        <Header onNewTask={handleNewTask} />
        <KanbanBoard onEdit={handleEdit} onDelete={handleDelete} />
        {showForm && (
          <TaskFormModal
            task={editingTask}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setShowForm(false)
              setEditingTask(null)
            }}
          />
        )}
        {deletingTask && (
          <ConfirmDialog
            message={`确定要删除任务「${deletingTask.title}」吗？`}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeletingTask(null)}
          />
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  )
}

export default App
