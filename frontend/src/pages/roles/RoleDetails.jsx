import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, X, Trash2, Users as UsersIcon } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { Can } from '../../routes/PermissionGuard.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getRoleById, deleteRole } from '../../services/role'
import { permissions as allPermissions, MODULES } from '../../data/mockData'
import { formatDate } from '../../utils/format'

export default function RoleDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    getRoleById(id).then(setRole).catch(setError).finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteRole(id)
      toast.success('Role deleted')
      navigate('/roles')
    } catch {
      toast.error('Failed to delete role')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size={26} label="Loading role…" />
      </div>
    )
  }

  if (error || !role) {
    return <ErrorState title="Role not found" onRetry={() => navigate('/roles')} />
  }

  const grouped = MODULES.map((module) => ({
    module,
    items: allPermissions.filter((p) => p.module === module),
  })).filter((g) => g.items.length > 0)

  return (
    <div>
      <PageHeader
        title={role.name}
        breadcrumb={[{ label: 'Roles', to: '/roles' }, { label: role.name }]}
        actions={
          <Can permission="roles.delete">
            <Button variant="danger" icon={Trash2} onClick={() => setConfirmOpen(true)}>
              Delete role
            </Button>
          </Can>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-1">
          <Card>
            <CardHeader title="Role information" />
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Description</dt>
                <dd className="mt-0.5 text-ink-900">{role.description}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={role.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Created</dt>
                <dd className="mt-0.5 text-ink-900">{formatDate(role.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Permissions granted</dt>
                <dd className="mt-0.5 text-ink-900">{role.permissions.length}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Assigned users" description={`${role.users?.length || 0} user(s) with this role`} />
            {role.users?.length ? (
              <div className="flex flex-col gap-3">
                {role.users.slice(0, 8).map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">{u.name}</p>
                      <p className="truncate text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={UsersIcon} title="No users yet" description="No users currently have this role assigned." />
            )}
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader title="Permissions" description="Grouped by module. Checked items are granted by this role." />
          <div className="flex flex-col gap-5">
            {grouped.map(({ module, items }) => (
              <div key={module}>
                <p className="mb-2.5 text-sm font-semibold text-ink-900">{module}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {items.map((p) => {
                    const granted = role.permissions.includes(p.name)
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm ${
                          granted ? 'border-success-200 bg-success-50/60' : 'border-surface-border bg-surface-muted/40'
                        }`}
                      >
                        {granted ? <Check size={15} className="text-success-600" /> : <X size={15} className="text-slate-300" />}
                        <span className={granted ? 'text-ink-900 font-medium' : 'text-slate-400'}>{p.displayName}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this role?"
        description={`Users with "${role.name}" will lose the permissions it grants. This action cannot be undone.`}
        confirmLabel="Delete role"
      />
    </div>
  )
}
