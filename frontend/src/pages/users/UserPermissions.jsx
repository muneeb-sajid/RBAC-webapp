import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, X, ShieldCheck, KeyRound } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import RoleBadge from '../../components/common/RoleBadge.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { getUserById, getUserEffectivePermissions } from '../../services/user'
import { permissions as allPermissions, MODULES } from '../../data/mockData'

export default function UserPermissions() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [perms, setPerms] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([getUserById(id), getUserEffectivePermissions(id)])
      .then(([u, p]) => {
        setUser(u)
        setPerms(p)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size={26} label="Loading permissions…" />
      </div>
    )
  }

  if (error || !user || !perms) {
    return <ErrorState title="Unable to load permissions" onRetry={() => navigate('/users')} />
  }

  const grouped = MODULES.map((module) => ({
    module,
    items: allPermissions.filter((p) => p.module === module),
  })).filter((g) => g.items.length > 0)

  return (
    <div>
      <PageHeader
        title="Effective permissions"
        breadcrumb={[{ label: 'Users', to: '/users' }, { label: user.name, to: `/users/${id}` }, { label: 'Permissions' }]}
      />

      {/* User summary */}
      <Card className="mb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <Avatar name={user.name} color={user.avatarColor} size="lg" />
            <div>
              <p className="text-base font-semibold text-ink-900">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.roles.map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-5">
        <Card>
          <p className="text-xs font-medium text-slate-500">Role permissions</p>
          <p className="mt-1.5 text-2xl font-bold text-ink-900">{perms.rolePermissions.length}</p>
          <p className="mt-1 text-xs text-slate-400">Inherited from assigned roles</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-slate-500">Direct permissions</p>
          <p className="mt-1.5 text-2xl font-bold text-ink-900">{perms.directPermissions.length}</p>
          <p className="mt-1 text-xs text-slate-400">Granted directly to this user</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-slate-500">Effective total</p>
          <p className="mt-1.5 text-2xl font-bold text-brand-600">{perms.effectivePermissions.length}</p>
          <p className="mt-1 text-xs text-slate-400">Unique permissions this user can use</p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Permission breakdown by module"
          description="Green means this user has the permission today. Hover the badge to see where it comes from."
        />
        <div className="flex flex-col gap-5">
          {grouped.map(({ module, items }) => (
            <div key={module}>
              <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-ink-900">
                <KeyRound size={14} className="text-slate-400" />
                {module}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => {
                  const hasIt = perms.effectivePermissions.includes(p.name)
                  const fromRole = perms.rolePermissions.includes(p.name)
                  const fromDirect = perms.directPermissions.includes(p.name)
                  const source = fromRole && fromDirect ? 'Role + direct' : fromRole ? 'Via role' : fromDirect ? 'Direct grant' : ''
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm ${
                        hasIt ? 'border-success-200 bg-success-50/60' : 'border-surface-border bg-surface-muted/40'
                      }`}
                      title={source}
                    >
                      {hasIt ? <Check size={15} className="shrink-0 text-success-600" /> : <X size={15} className="shrink-0 text-slate-300" />}
                      <div className="min-w-0">
                        <p className={`truncate font-medium ${hasIt ? 'text-ink-900' : 'text-slate-400'}`}>{p.displayName}</p>
                        {hasIt && source && <p className="text-[11px] text-slate-400">{source}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
