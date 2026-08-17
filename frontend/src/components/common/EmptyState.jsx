import { Inbox } from 'lucide-react'
import Button from './Button.jsx'

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-slate-400">
        <Icon size={26} />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>}
      </div>
      {actionLabel && (
        <Button size="sm" variant="secondary" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
