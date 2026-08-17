import { forwardRef, useId } from 'react'
import clsx from 'clsx'

const Input = forwardRef(
  ({ label, error, hint, icon: Icon, iconRight: IconRight, className, containerClassName, required, ...props }, ref) => {
    const generatedId = useId()
    const id = props.id || generatedId

    return (
      <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink-900">
            {label} {required && <span className="text-danger-500">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={clsx(
              'h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink-900 placeholder:text-slate-400 transition-colors',
              'focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none',
              Icon && 'pl-9',
              IconRight && 'pr-9',
              error ? 'border-danger-400' : 'border-surface-border',
              className
            )}
            {...props}
          />
          {IconRight && <div className="absolute right-3 top-1/2 -translate-y-1/2">{IconRight}</div>}
        </div>
        {error && (
          <p id={`${id}-error`} className="text-xs font-medium text-danger-600">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${id}-hint`} className="text-xs text-slate-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
