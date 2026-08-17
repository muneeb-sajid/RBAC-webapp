import clsx from 'clsx'

export default function Card({ className, padded = true, children, ...props }) {
  return (
    <div
      className={clsx('rounded-2xl border border-surface-border bg-surface-card shadow-card', padded && 'p-5', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={clsx('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
