import { useCallback, useEffect, useState } from 'react'
import { LogIn } from 'lucide-react'
import Card from '../../components/common/Card.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Select from '../../components/common/Select.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import ActionBadge from '../../components/common/ActionBadge.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import useDebounce from '../../hooks/useDebounce'
import { getLoginActivity } from '../../services/security'
import { formatDateTime } from '../../utils/format'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
]

export default function LoginActivityTab() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ items: [], total: 0, pageSize: 20 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const debouncedSearch = useDebounce(search, 350)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getLoginActivity({ search: debouncedSearch, status, page, pageSize: 20 })
      setData({ items: res.items, total: res.total, pageSize: res.pageSize || 20 })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, page])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (a) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={a.user?.name || a.metadata?.email || 'Unknown'} color={a.user?.avatarColor} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink-900">{a.user?.name || a.metadata?.email || 'Unknown user'}</p>
            <p className="truncate text-xs text-slate-400">{a.user?.email || ''}</p>
          </div>
        </div>
      ),
    },
    { key: 'action', header: 'Activity', render: (a) => <ActionBadge action={a.action} /> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status?.toLowerCase()} /> },
    { key: 'device', header: 'Device', render: (a) => <span className="text-slate-600">{a.device || '—'}</span> },
    { key: 'ipAddress', header: 'IP address', render: (a) => <span className="font-mono text-xs text-slate-500">{a.ipAddress || '—'}</span> },
    { key: 'createdAt', header: 'Date', sortable: true, render: (a) => <span className="text-slate-500">{formatDateTime(a.createdAt)}</span> },
  ]

  if (error) {
    return (
      <Card padded={false}>
        <ErrorState onRetry={load} />
      </Card>
    )
  }

  return (
    <Card padded={false}>
      <div className="flex flex-col gap-3 border-b border-surface-border p-4 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by email…" className="sm:max-w-xs" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-40" options={STATUS_OPTIONS} />
      </div>

      <DataTable
        columns={columns}
        data={data.items}
        loading={loading}
        rowKey="id"
        empty={{
          icon: LogIn,
          title: 'No login activity found',
          description: 'No sign-in events match your current filters.',
          actionLabel: 'Clear filters',
          onAction: () => {
            setSearch('')
            setStatus('all')
          },
        }}
      />

      <Pagination page={page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
    </Card>
  )
}
