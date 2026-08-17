import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

const VARIANTS = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm disabled:bg-brand-300',
  secondary: 'bg-white text-ink-900 border border-surface-border hover:bg-surface-muted active:bg-slate-100 disabled:text-slate-400',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 shadow-sm disabled:bg-danger-300',
  ghost: 'bg-transparent text-ink-900 hover:bg-surface-muted active:bg-slate-100 disabled:text-slate-400',
  outline: 'bg-transparent border border-surface-border text-ink-900 hover:bg-surface-muted disabled:text-slate-400',
}

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-9 w-9 p-0',
}

const Button = forwardRef(
  ({ variant = 'primary', size = 'md', loading = false, disabled, icon: Icon, iconRight: IconRight, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed select-none',
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
        ) : (
          Icon && <Icon size={size === 'sm' ? 14 : 16} />
        )}
        {children}
        {!loading && IconRight && <IconRight size={size === 'sm' ? 14 : 16} />}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
