import { useEffect, useState } from 'react'
import { Check, X, Search } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import RoleBadge from '../../components/common/RoleBadge.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { getUsers, getUserEffectivePermissions } from '../../services/user'
import { permissions as allPermissions, MODULES } from '../../data/mockData'
import useDebounce from '../../hooks/useDebounce'

export default function UserPermissionsLookup() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [perms, setPerms] = useState(null)
  const [loadingPerms, setLoadingPerms] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    if (!debouncedSearch) {
      setResults([])
      return
    }
    setSearching(true)
    getUsers({ page: 1, pageSize: 6, search: debouncedSearch })
      .then((res) => setResults(res.items))
      .finally(() => setSearching(false))
  }, [debouncedSearch])

  function selectUser(user) {
    setSelectedUser(user)
    setResults([])
    setSearch('')
    setLoadingPerms(true)
    getUserEffectivePermissions(user.id)
      .then(setPerms)
      .finally(() => setLoadingPerms(false))
  }

  const grouped = MODULES.map((module) => ({ module, items: allPermissions.filter((p) => p.module === module) })).filter(
    (g) => g.items.length > 0
  )

  return (
    <div>
      <PageHeader title="User permissions" description="Look up any user to see their complete effective permission set." />

      <Card className="mb-5">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="h-10 w-full rounded-lg border border-surface-border bg-white pl-9 pr-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
          {(searching || results.length > 0) && (
            <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-surface-border bg-white shadow-popover">
              {searching && <p className="px-4 py-3 text-sm text-slate-400">Searching…</p>}
              {!searching &&
                results.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => selectUser(u)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-muted transition-colors"
                  >
                    <Avatar name={u.name} color={u.avatarColor} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">{u.name}</p>
                      <p className="truncate text-xs text-slate-500">{u.email}</p>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </Card>

      {!selectedUser && (
        <Card>
          <EmptyState title="Search for a user" description="Use the search box above to find a user and view their effective permissions." />
        </Card>
      )}

      {selectedUser && loadingPerms && (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size={24} label="Loading permissions…" />
        </div>
      )}

      {selectedUser && perms && !loadingPerms && (
        <>
          <Card className="mb-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <Avatar name={selectedUser.name} color={selectedUser.avatarColor} size="lg" />
                <div>
                  <p className="text-base font-semibold text-ink-900">{selectedUser.name}</p>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {perms.roles.map((r) => (
                  <RoleBadge key={r} role={r} />
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Effective permissions" description={`${perms.effectivePermissions.length} permission(s) in total`} />
            <div className="flex flex-col gap-5">
              {grouped.map(({ module, items }) => (
                <div key={module}>
                  <p className="mb-2.5 text-sm font-semibold text-ink-900">{module}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => {
                      const hasIt = perms.effectivePermissions.includes(p.name)
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm ${
                            hasIt ? 'border-success-200 bg-success-50/60' : 'border-surface-border bg-surface-muted/40'
                          }`}
                        >
                          {hasIt ? <Check size={15} className="text-success-600" /> : <X size={15} className="text-slate-300" />}
                          <span className={hasIt ? 'font-medium text-ink-900' : 'text-slate-400'}>{p.displayName}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
