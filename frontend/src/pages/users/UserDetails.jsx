import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2, KeyRound, Mail, Calendar, Clock } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import RoleBadge from '../../components/common/RoleBadge.jsx'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { Can } from '../../routes/PermissionGuard.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getUserById, deleteUser } from '../../services/user'
import { recentActivity } from '../../data/mockData'
import { formatDate, formatDateTime } from '../../utils/format'

export default function UserDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    getUserById(id)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteUser(id)
      toast.success('User deleted')
      navigate('/users')
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size={26} label="Loading user…" />
      </div>
    )
  }

  if (error || !user) {
    return <ErrorState title="User not found" description="This user may have been removed." onRetry={() => navigate('/users')} />
  }

  return (
    <div>
      <PageHeader
        title={user.name}
        breadcrumb={[{ label: 'Users', to: '/users' }, { label: user.name }]}
        actions={
          <>
            <Can permission="users.update">
              <Button variant="secondary" icon={Pencil} onClick={() => navigate(`/users/${id}/permissions`)}>
                Edit
              </Button>
            </Can>
            <Can permission="users.delete">
              <Button variant="danger" icon={Trash2} onClick={() => setConfirmOpen(true)}>
                Delete
              </Button>
            </Can>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user.name} color={user.avatarColor} size="xl" />
            <h2 className="mt-3 text-base font-semibold text-ink-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="mt-2">
              <StatusBadge status={user.status} />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-surface-border pt-5 text-sm">
            <div className="flex items-center gap-2.5 text-slate-500">
              <Mail size={15} />
              <span className="text-ink-900">{user.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500">
              <Calendar size={15} />
              <span>
                Created <span className="text-ink-900">{formatDate(user.createdAt)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500">
              <Clock size={15} />
              <span>
                Last login <span className="text-ink-900">{formatDateTime(user.lastLogin)}</span>
              </span>
            </div>
          </div>

          <Can permission="users.update">
            <Button variant="secondary" icon={KeyRound} className="mt-5 w-full" onClick={() => navigate(`/users/${id}/permissions`)}>
              Manage permissions
            </Button>
          </Can>
        </Card>

        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Roles */}
          <Card>
            <CardHeader title="Assigned roles" description="Roles determine this user's base permissions" />
            <div className="flex flex-wrap gap-2">
              {user.roles.map((r) => (
                <RoleBadge key={r} role={r} />
              ))}
            </div>
          </Card>

          {/* Effective permissions preview */}
          <Card>
            <CardHeader
              title="Effective permissions"
              description="Combined permissions from all assigned roles"
              action={
                <Button variant="ghost" size="sm" onClick={() => navigate(`/users/${id}/permissions`)}>
                  View full breakdown
                </Button>
              }
            />
            <p className="text-sm text-slate-500">
              This user has access through <span className="font-medium text-ink-900">{user.roles.length}</span> role
              {user.roles.length !== 1 ? 's' : ''}. Open the full permissions view to see exactly where each permission
              comes from.
            </p>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader title="Recent activity" description="Latest actions involving this account" />
            <div className="flex flex-col gap-4">
              {recentActivity.slice(0, 4).map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  <div>
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-ink-900">{a.actor}</span> {a.action}{' '}
                      <span className="font-medium text-ink-900">{a.target}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this user?"
        description={`This will permanently remove ${user.name}'s account. This action cannot be undone.`}
        confirmLabel="Delete user"
      />
    </div>
  )
}
