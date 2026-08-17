import { useState } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import clsx from 'clsx'
import LoadingSpinner from '../common/LoadingSpinner.jsx'
import EmptyState from '../common/EmptyState.jsx'

/**
 * columns: [{ key, header, render?(row), sortable?, className? }]
 */
export default function DataTable({ columns, data = [], loading, empty, rowKey = 'id', onRowClick }) {
  const [sort, setSort] = useState({ key: null, direction: 'asc' })

  function toggleSort(col) {
    if (!col.sortable) return
    setSort((prev) => {
      if (prev.key !== col.key) return { key: col.key, direction: 'asc' }
      if (prev.direction === 'asc') return { key: col.key, direction: 'desc' }
      return { key: null, direction: 'asc' }
    })
  }

  const sorted = (() => {
    if (!sort.key) return data
    const copy = [...data]
    copy.sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (av === bv) return 0
      const result = av > bv ? 1 : -1
      return sort.direction === 'asc' ? result : -result
    })
    return copy
  })()

  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-surface-border bg-surface-muted/60">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => toggleSort(col)}
                className={clsx(
                  'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                  col.sortable && 'cursor-pointer select-none hover:text-ink-900',
                  col.className
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable &&
                    (sort.key === col.key ? (
                      sort.direction === 'asc' ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="text-slate-300" />
                    ))}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={`sk-${i}`} className="border-b border-surface-border">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5">
                    <div className="skeleton h-4 w-full max-w-[140px] rounded" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading && sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState {...(empty || {})} />
              </td>
            </tr>
          )}

          {!loading &&
            sorted.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'border-b border-surface-border last:border-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-surface-muted/60'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={clsx('px-4 py-3.5 align-middle', col.cellClassName)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
