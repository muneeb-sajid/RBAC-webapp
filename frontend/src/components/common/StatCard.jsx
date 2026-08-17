import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import clsx from 'clsx'
import Card from './Card.jsx'
import { formatNumber } from '../../utils/format'

export default function StatCard({ label, value, trend, icon: Icon, tint = 'brand' }) {
  const positive = trend >= 0
  const tints = {
    brand: 'bg-brand-50 text-brand-600',
    success: 'bg-success-50 text-success-600',
    info: 'bg-info-50 text-info-600',
    warning: 'bg-warning-50 text-warning-600',
  }

  return (
    <Card className="hover:shadow-popover transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-ink-900">{formatNumber(value)}</p>
        </div>
        {Icon && (
          <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', tints[tint])}>
            <Icon size={19} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          <span className={clsx('inline-flex items-center gap-0.5', positive ? 'text-success-600' : 'text-danger-600')}>
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}{typeof trend === 'number' && Number.isFinite(trend) ? '%' : ''}
          </span>
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </Card>
  )
}
