// src/components/permissions/PermissionMatrix.jsx
import { useMemo, useState, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { getPermissions } from '../../services/permission'
import LoadingSpinner from '../common/LoadingSpinner'

export default function PermissionMatrix({ selected = [], onChange, disabledNames = [], highlightNames = [] }) {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState({})
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ✅ Load permissions from API directly
  const loadPermissions = async () => {
    setLoading(true)
    setError(null)
    try {
      
      
      // Use getPermissions directly
      const result = await getPermissions()
      
      
      let items = []
      if (result && result.items && Array.isArray(result.items)) {
        items = result.items
      } else if (Array.isArray(result)) {
        items = result
      } else {
        items = []
      }
      
  
      
      // Group by module
      const grouped = {}
      items.forEach(p => {
        const module = p.module || 'Other'
        if (!grouped[module]) grouped[module] = []
        grouped[module].push({
          name: p.name,
          displayName: p.displayName || p.name,
          module: p.module,
          description: p.description || ''
        })
      })
      
      
      // Convert to array
      const permissionsArray = Object.entries(grouped).map(([module, moduleItems]) => ({
        module,
        items: moduleItems
      }))
      
      setPermissions(permissionsArray)
    } catch (error) {
      console.error('❌ Error loading permissions:', error)
      setError(error.message || 'Failed to load permissions')
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPermissions()
  }, [])

  const grouped = useMemo(() => {
    const q = search.toLowerCase()
    if (loading || permissions.length === 0) return []
    
    return permissions
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (p) => !q || 
            p.name.toLowerCase().includes(q) || 
            p.displayName.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0)
  }, [permissions, search, loading])

  function toggle(name) {
    if (disabledNames.includes(name)) return
    const next = selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]
    onChange(next)
  }

  function toggleModule(items, checkAll) {
    const names = items.map((i) => i.name).filter((n) => !disabledNames.includes(n))
    if (checkAll) {
      onChange(Array.from(new Set([...selected, ...names])))
    } else {
      onChange(selected.filter((n) => !names.includes(n)))
    }
  }

  function selectAll() {
    const all = permissions.flatMap(g => g.items.map(p => p.name))
    onChange(Array.from(new Set([...selected, ...all])))
  }

  function deselectAll() {
    onChange(selected.filter((n) => disabledNames.includes(n)))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size={24} label="Loading permissions..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-danger-500">Error: {error}</p>
        <button 
          onClick={loadPermissions}
          className="mt-2 px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600"
        >
          Retry
        </button>
      </div>
    )
  }

  if (permissions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        <p>No permissions found.</p>
        <button 
          onClick={loadPermissions}
          className="mt-2 px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600"
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions…"
            className="h-9 w-full rounded-lg border border-surface-border bg-white pl-9 pr-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none dark:bg-ink-800 dark:border-ink-700 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <button 
            type="button" 
            onClick={selectAll} 
            className="rounded-md px-2.5 py-1.5 text-brand-600 hover:bg-brand-50 transition-colors dark:text-brand-400 dark:hover:bg-brand-900/20"
          >
            Select all
          </button>
          <span className="text-slate-300">|</span>
          <button 
            type="button" 
            onClick={deselectAll} 
            className="rounded-md px-2.5 py-1.5 text-slate-500 hover:bg-surface-muted transition-colors dark:text-slate-400 dark:hover:bg-ink-800"
          >
            Deselect all
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {grouped.map(({ module, items }) => {
          const allChecked = items.every((i) => selected.includes(i.name))
          const someChecked = items.some((i) => selected.includes(i.name))
          const isCollapsed = collapsed[module]

          return (
            <div key={module} className="rounded-xl border border-surface-border overflow-hidden dark:border-ink-700">
              <div className="flex items-center justify-between bg-surface-muted/70 px-4 py-2.5 dark:bg-ink-800/50">
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => ({ ...c, [module]: !c[module] }))}
                  className="flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-white"
                >
                  <ChevronDown size={14} className={clsx('transition-transform text-slate-400', isCollapsed && '-rotate-90')} />
                  {module}
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 border border-surface-border dark:bg-ink-700 dark:text-slate-300 dark:border-ink-600">
                    {items.filter((i) => selected.includes(i.name)).length}/{items.length}
                  </span>
                </button>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 cursor-pointer select-none dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => el && (el.indeterminate = !allChecked && someChecked)}
                    onChange={(e) => toggleModule(items, e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-surface-border text-brand-500 focus:ring-brand-300 dark:border-ink-600"
                  />
                  All
                </label>
              </div>
              {!isCollapsed && (
                <div className="grid grid-cols-1 gap-x-4 gap-y-2 p-4 sm:grid-cols-2">
                  {items.map((item) => {
                    const isChecked = selected.includes(item.name)
                    const isDisabled = disabledNames.includes(item.name)
                    const isHighlighted = highlightNames.includes(item.name)
                    return (
                      <label
                        key={item.name}
                        className={clsx(
                          'flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors cursor-pointer',
                          isChecked ? 'bg-brand-50/60 dark:bg-brand-900/20' : 'hover:bg-surface-muted dark:hover:bg-ink-800',
                          isDisabled && 'cursor-not-allowed opacity-60',
                          isHighlighted && !isChecked && 'ring-1 ring-warning-500/40'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => toggle(item.name)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-surface-border text-brand-500 focus:ring-brand-300 dark:border-ink-600"
                        />
                        <span>
                          <span className="block font-medium text-ink-900 dark:text-white">{item.displayName}</span>
                          <span className="block font-mono text-xs text-slate-400 dark:text-slate-500">{item.name}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        {grouped.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
            No permissions match your search.
          </p>
        )}
      </div>
    </div>
  )
}