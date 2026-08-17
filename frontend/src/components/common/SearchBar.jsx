import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <div className={`relative ${className || ''}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-surface-border bg-white pl-9 pr-9 text-sm text-ink-900 placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
