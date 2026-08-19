import { useCallback, useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import Card from '../../components/common/Card.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Select from '../../components/common/Select.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import ActionBadge from '../../components/common/ActionBadge.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import useDebounce from '../../hooks/useDebounce'
import { getGlobalActivity } from '../../services/security'
import { formatDateTime } from '../../utils/format'

const MODULE_OPTIONS = [
  { value: 'all', label: 'All modules' },
  { value: 'Users', label: 'Users' },
  { value: 'Roles', label: 'Roles' },
  { value: 'Permissions', label: 'Permissions' },
  { value: 'Sessions', label: 'Sessions' },
  { value: 'Authentication', label: 'Authentication' },
]

export default function AuditLogTab() {
  const [search, setSearch] = useState('')
  const [module, setModule] = useState('all')
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ items: [], total: 0, pageSize: 100 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const debouncedSearch = useDebounce(search, 350)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getGlobalActivity({ search: debouncedSearch, module, page, pageSize: 25 })
      setData({ items: res.items, total: res.total, pageSize: res.pageSize || 25 })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, module, page])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, module])

  const columns = [
    {
      key: 'performer',
      header: 'Performed by',
      render: (a) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={a.performer?.name || 'System'} size="sm" />
          <span className="text-sm font-medium text-ink-900">{a.performer?.name || 'System'}</span>
        </div>
      ),
    },
    { key: 'action', header: 'Action', render: (a) => <ActionBadge action={a.action} /> },
    { key: 'module', header: 'Module', render: (a) => <span className="text-slate-600">{a.module}</span> },
    { key: 'description', header: 'Details', render: (a) => <span className="text-slate-600 line-clamp-1 max-w-sm block">{a.description}</span> },
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
        <SearchBar value={search} onChange={setSearch} placeholder="Search audit log…" className="sm:max-w-xs" />
        <Select value={module} onChange={(e) => setModule(e.target.value)} className="sm:w-48" options={MODULE_OPTIONS} />
      </div>

      <DataTable
        columns={columns}
        data={data.items}
        loading={loading}
        rowKey="id"
        empty={{
          icon: ShieldAlert,
          title: 'No audit records found',
          description: 'No administrative actions match your current filters.',
          actionLabel: 'Clear filters',
          onAction: () => {
            setSearch('')
            setModule('all')
          },
        }}
      />

      <Pagination page={page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
    </Card>
  )
}
