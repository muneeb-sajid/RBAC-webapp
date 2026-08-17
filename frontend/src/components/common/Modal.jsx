import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import clsx from 'clsx'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
}

export default function Modal({ open, onClose, title, description, size = 'md', children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={clsx(
          'relative z-10 w-full rounded-2xl bg-white shadow-popover animate-slide-up max-h-[90vh] flex flex-col',
          SIZES[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-surface-border px-6 py-4 shrink-0">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-ink-900">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-muted hover:text-slate-600 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 scrollbar-thin">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2.5 border-t border-surface-border px-6 py-4 shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
