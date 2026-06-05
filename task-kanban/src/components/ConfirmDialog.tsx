interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="form-actions">
          <button className="btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button className="btn-danger-solid" onClick={onConfirm}>
            确认删除
          </button>
        </div>
      </div>
    </div>
  )
}
