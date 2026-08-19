import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Activity } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card from '../../components/common/Card.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Select from '../../components/common/Select.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import ActionBadge from '../../components/common/ActionBadge.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import useDebounce from '../../hooks/useDebounce'
import { getUserActivity } from '../../services/security'
import { getUserById } from '../../services/user'
import { formatDateTime } from '../../utils/format'

const MODULE_OPTIONS = [
  { value: 'all', label: 'All modules' },
  { value: 'Users', label: 'Users' },
  { value: 'Roles', label: 'Roles' },
  { value: 'Permissions', label: 'Permissions' },
  { value: 'Sessions', label: 'Sessions' },
  { value: 'Authentication', label: 'Authentication' },
  { value: 'Account', label: 'Account' },
]

// This admin-only page answers "what did this specific user do in the
// system" with server-side pagination — never load the full history into
// the browser at once (Master prompt, section 21).
export default function UserActivity() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [search, setSearch] = useState('')
  const [module, setModule] = useState('all')
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ items: [], total: 0, pageSize: 100 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const debouncedSearch = useDebounce(search, 350)

  useEffect(() => {
    getUserById(id).then(setUser).catch(() => {})
  }, [id])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getUserActivity(id, { search: debouncedSearch, module, page, pageSize: 100 })
      setData({ items: res.items, total: res.total, pageSize: res.pageSize || 100 })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id, debouncedSearch, module, page])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, module])

  const columns = [
    { key: 'action', header: 'Activity', render: (a) => <ActionBadge action={a.action} /> },
    { key: 'module', header: 'Module', render: (a) => <span className="text-slate-600">{a.module}</span> },
    { key: 'description', header: 'Description', render: (a) => <span className="text-slate-600 line-clamp-1 max-w-md block">{a.description}</span> },
    { key: 'ipAddress', header: 'IP address', render: (a) => <span className="font-mono text-xs text-slate-500">{a.ipAddress || '—'}</span> },
    { key: 'createdAt', header: 'Date', sortable: true, render: (a) => <span className="text-slate-500">{formatDateTime(a.createdAt)}</span> },
  ]

  if (error) {
    return (
      <div>
        <PageHeader
          title="Activity"
          breadcrumb={[{ label: 'Users', to: '/users' }, { label: user?.name || '…', to: `/users/${id}` }, { label: 'Activity' }]}
        />
        <Card padded={false}>
          <ErrorState onRetry={load} />
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={user ? `${user.name}'s activity` : 'User activity'}
        description="Complete history of actions performed by and on this account."
        breadcrumb={[{ label: 'Users', to: '/users' }, { label: user?.name || '…', to: `/users/${id}` }, { label: 'Activity' }]}
      />

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-surface-border p-4 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} placeholder="Search this user's activity…" className="sm:max-w-xs" />
          <Select value={module} onChange={(e) => setModule(e.target.value)} className="sm:w-48" options={MODULE_OPTIONS} />
        </div>

        {loading && !data.items.length ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner size={24} label="Loading activity…" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data.items}
            loading={loading}
            rowKey="id"
            empty={{
              icon: Activity,
              title: 'No activity found',
              description: "No recorded actions match your current filters for this user.",
              actionLabel: 'Clear filters',
              onAction: () => {
                setSearch('')
                setModule('all')
              },
            }}
          />
        )}

        <Pagination page={page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
      </Card>
    </div>
  )
}
