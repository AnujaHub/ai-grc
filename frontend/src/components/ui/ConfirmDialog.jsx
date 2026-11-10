import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from './Button'
import Modal from './Modal'

function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', tone = 'danger', onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onCancel}
      size="sm"
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button
            onClick={confirm}
            loading={busy}
            className={tone === 'danger' ? '!border-danger !bg-danger !text-white hover:!opacity-90' : ''}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'}`}>
          <AlertTriangle className="h-4 w-4" />
        </span>
        <p className="text-sm text-ink-soft">{message}</p>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
