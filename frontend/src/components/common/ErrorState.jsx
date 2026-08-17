import { AlertCircle } from 'lucide-react'
import Button from './Button.jsx'

export default function ErrorState({ title = 'Something went wrong', description = 'We ran into a problem loading this data.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-50 text-danger-500">
        <AlertCircle size={26} />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry} className="mt-1">
          Try again
        </Button>
      )}
    </div>
  )
}
