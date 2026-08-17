import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  function pagesToShow() {
    const pages = []
    const window = 1
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= page - window && p <= page + window)) {
        pages.push(p)
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…')
      }
    }
    return pages
  }

  if (total === 0) return null

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-surface-border px-4 py-3.5 sm:flex-row">
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-ink-900">{start}</span>–<span className="font-medium text-ink-900">{end}</span> of{' '}
        <span className="font-medium text-ink-900">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-slate-500 hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>
        {pagesToShow().map((p, idx) =>
          p === '…' ? (
            <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={clsx(
                'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors',
                p === page ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-surface-muted'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border text-slate-500 hover:bg-surface-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
