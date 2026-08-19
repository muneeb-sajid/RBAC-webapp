import { useCallback, useEffect, useState } from 'react'
import { MonitorSmartphone, LogOut } from 'lucide-react'
import Card from '../../components/common/Card.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import Badge from '../../components/common/Badge.jsx'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { Can } from '../../routes/PermissionGuard.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getSessions, forceLogoutSession } from '../../services/security'
import { timeAgo } from '../../utils/format'

function PresenceBadge({ presence }) {
  if (presence === 'active') return <Badge tone="success" dot>Active</Badge>
  if (presence === 'idle') return <Badge tone="warning" dot>Idle</Badge>
  return <Badge tone="neutral" dot>Offline</Badge>
}

export default function ActiveSessionsTab() {
  const toast = useToast()
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [target, setTarget] = useState(null)
  const [revoking, setRevoking] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSessions({ status: 'ACTIVE', page: 1, pageSize: 100 })
      setData(res)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleForceLogout() {
    if (!target) return
    setRevoking(true)
    try {
      await forceLogoutSession(target.sessionId)
      toast.success('Session terminated', { description: `${target.user?.name || 'The user'}'s session has been signed out.` })
      setTarget(null)
      load()
    } catch {
      toast.error('Failed to terminate session')
    } finally {
      setRevoking(false)
    }
  }

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (s) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={s.user?.name || 'Unknown'} color={s.user?.avatarColor} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink-900">{s.user?.name || 'Unknown user'}</p>
            <p className="truncate text-xs text-slate-400">{s.user?.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'device', header: 'Device / Browser', render: (s) => <span className="text-slate-600">{s.device}</span> },
    { key: 'ipAddress', header: 'IP address', render: (s) => <span className="font-mono text-xs text-slate-500">{s.ipAddress || '—'}</span> },
    { key: 'lastActiveAt', header: 'Last active', sortable: true, render: (s) => <span className="text-slate-500">{timeAgo(s.lastActiveAt)}</span> },
    { key: 'presence', header: 'Status', render: (s) => <PresenceBadge presence={s.presence} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (s) => (
        <Can permission="sessions.force_logout">
          <Button variant="danger" size="sm" icon={LogOut} onClick={() => setTarget(s)}>
            Force logout
          </Button>
        </Can>
      ),
    },
  ]

  if (error) {
    return (
      <Card padded={false}>
        <ErrorState onRetry={load} />
      </Card>
    )
  }

  return (
    <>
      <Card padded={false}>
        <DataTable
          columns={columns}
          data={data.items}
          loading={loading}
          rowKey="id"
          empty={{
            icon: MonitorSmartphone,
            title: 'No active sessions',
            description: 'No one currently has an active session.',
          }}
        />
      </Card>

      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={handleForceLogout}
        loading={revoking}
        title="Force logout this session?"
        description={`This will immediately sign ${target?.user?.name || 'this user'} out of ${target?.device || 'this device'}. Their next request will be rejected and they'll be redirected to login.`}
        confirmLabel="Force logout"
      />
    </>
  )
}
