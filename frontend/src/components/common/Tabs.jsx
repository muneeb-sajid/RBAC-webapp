import clsx from 'clsx'

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-surface-border overflow-x-auto scrollbar-thin">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors',
            active === tab.value ? 'text-brand-600' : 'text-slate-500 hover:text-ink-900'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={clsx(
                'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                active === tab.value ? 'bg-brand-100 text-brand-700' : 'bg-surface-muted text-slate-500'
              )}
            >
              {tab.count}
            </span>
          )}
          {active === tab.value && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-500" />}
        </button>
      ))}
    </div>
  )
}
