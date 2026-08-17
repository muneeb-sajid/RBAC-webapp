import { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

const Select = forwardRef(({ label, error, hint, options = [], placeholder, className, containerClassName, required, ...props }, ref) => {
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
        <select
          ref={ref}
          id={id}
          aria-invalid={!!error}
          className={clsx(
            'h-10 w-full appearance-none rounded-lg border bg-white pl-3 pr-9 text-sm text-ink-900 transition-colors',
            'focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none',
            error ? 'border-danger-400' : 'border-surface-border',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>
      {error && <p className="text-xs font-medium text-danger-600">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
})

Select.displayName = 'Select'
export default Select
