import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const STYLES = {
  success: 'border-success-500/30 bg-white text-ink-900 [&_svg]:text-success-500',
  error: 'border-danger-500/30 bg-white text-ink-900 [&_svg]:text-danger-500',
  warning: 'border-warning-500/30 bg-white text-ink-900 [&_svg]:text-warning-500',
  info: 'border-info-500/30 bg-white text-ink-900 [&_svg]:text-info-500',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message, { type = 'success', duration = 4000, description } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => [...prev, { id, message, description, type }])
      if (duration) {
        setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss]
  )

  const value = useMemo(
    () => ({
      showToast,
      success: (msg, opts) => showToast(msg, { ...opts, type: 'success' }),
      error: (msg, opts) => showToast(msg, { ...opts, type: 'error' }),
      warning: (msg, opts) => showToast(msg, { ...opts, type: 'warning' }),
      info: (msg, opts) => showToast(msg, { ...opts, type: 'info' }),
      dismiss,
    }),
    [showToast, dismiss]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2.5">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type]
          return (
            <div
              key={toast.id}
              role="status"
              className={`animate-slide-in-right flex items-start gap-3 rounded-xl border shadow-popover px-4 py-3.5 ${STYLES[toast.type]}`}
            >
              <Icon size={20} className="mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug">{toast.message}</p>
                {toast.description && <p className="mt-0.5 text-xs text-slate-500 leading-snug">{toast.description}</p>}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-surface-muted hover:text-slate-600 transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
