import clsx from 'clsx'

const TONES = {
  neutral: 'bg-surface-muted text-slate-600',
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
  info: 'bg-info-50 text-info-700',
}

export default function Badge({ tone = 'neutral', dot = false, className, children }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        TONES[tone],
        className
      )}
    >
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full', `bg-current`)} />}
      {children}
    </span>
  )
}
