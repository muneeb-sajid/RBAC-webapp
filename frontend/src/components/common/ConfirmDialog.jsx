import { AlertTriangle } from 'lucide-react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm" title="" >
      <div className="flex flex-col items-center text-center gap-3 -mt-2">
        <div
          className={
            tone === 'danger'
              ? 'flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger-500'
              : 'flex h-12 w-12 items-center justify-center rounded-full bg-warning-50 text-warning-500'
          }
        >
          <AlertTriangle size={22} />
        </div>
        <h3 className="text-base font-semibold text-ink-900">{title}</h3>
        {description && <p className="text-sm text-slate-500 leading-relaxed">{description}</p>}
        <div className="mt-3 flex w-full gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} className="flex-1" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
