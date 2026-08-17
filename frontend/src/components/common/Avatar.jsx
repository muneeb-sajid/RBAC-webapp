import clsx from 'clsx'
import { initials } from '../../utils/format'

const SIZES = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-20 w-20 text-xl',
}

export default function Avatar({ name = '', color = '#4F46E5', size = 'md', className }) {
  return (
    <div
      className={clsx('flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none', SIZES[size], className)}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials(name) || '?'}
    </div>
  )
}
