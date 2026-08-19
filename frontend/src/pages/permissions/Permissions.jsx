import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, KeyRound } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card from '../../components/common/Card.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Select from '../../components/common/Select.jsx'
import Button from '../../components/common/Button.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import RoleBadge from '../../components/common/RoleBadge.jsx'
import Badge from '../../components/common/Badge.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { Can } from '../../routes/PermissionGuard.jsx'
import { getPermissions } from '../../services/permission'
import { formatDate } from '../../utils/format'
import useDebounce from '../../hooks/useDebounce'

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'view', label: 'View' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'manage', label: 'Manage' },
  { value: 'export', label: 'Export' },
  { value: 'assign', label: 'Assign' },
  { value: 'revoke', label: 'Revoke' },
  { value: 'force_logout', label: 'Force logout' },
]

export default function Permissions() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [module, setModule] = useState('all')
  const [type, setType] = useState('all')
  const [data, setData] = useState({ items: [], total: 0 })
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const debouncedSearch = useDebounce(search, 350)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPermissions({ search: debouncedSearch, module, type })
      setData(res)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, module, type])

  // Module list is derived from whatever the backend actually returns
  // (the predefined permission catalog), so a new module never has to be
  // hand-added here to appear in the filter.
  useEffect(() => {
    getPermissions().then((res) => {
      const unique = Array.from(new Set(res.items.map((p) => p.module))).sort()
      setModules(unique)
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const columns = [
    {
      key: 'name',
      header: 'Permission',
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info-50 text-info-600">
            <KeyRound size={14} />
          </div>
          <span className="font-mono text-xs font-medium text-ink-900">{p.name}</span>
        </div>
      ),
    },
    { key: 'displayName', header: 'Display name', render: (p) => <span className="text-slate-700">{p.displayName}</span> },
    { key: 'module', header: 'Module', render: (p) => <Badge tone="neutral">{p.module}</Badge> },
    { key: 'description', header: 'Description', render: (p) => <span className="text-slate-500 line-clamp-1 max-w-xs block">{p.description}</span> },
    {
      key: 'assignedRoles',
      header: 'Assigned roles',
      render: (p) => (
        <div className="flex flex-wrap gap-1.5 max-w-[220px]">
          {p.assignedRoles.length ? (
            p.assignedRoles.slice(0, 3).map((r) => <RoleBadge key={r} role={r} icon={false} />)
          ) : (
            <span className="text-xs text-slate-400">Unassigned</span>
          )}
          {p.assignedRoles.length > 3 && <span className="text-xs text-slate-400">+{p.assignedRoles.length - 3}</span>}
        </div>
      ),
    },
    { key: 'createdAt', header: 'Created', sortable: true, render: (p) => <span className="text-slate-500">{formatDate(p.createdAt)}</span> },
  ]

  if (error) {
    return (
      <div>
        <PageHeader title="Permissions" description="Browse the full permission catalog." />
        <Card padded={false}>
          <ErrorState onRetry={load} />
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Permissions"
        description="Browse, search, and manage the full permission catalog."
        
      />

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-surface-border p-4 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} placeholder="Search permissions…" className="sm:max-w-xs" />
          <Select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="sm:w-40"
            options={[{ value: 'all', label: 'All modules' }, ...modules.map((m) => ({ value: m, label: m }))]}
          />
          <Select value={type} onChange={(e) => setType(e.target.value)} className="sm:w-40" options={TYPE_OPTIONS} />
        </div>

        <DataTable
          columns={columns}
          data={data.items}
          loading={loading}
          empty={{
            icon: KeyRound,
            title: 'No permissions found',
            description: 'No permissions match your current filters.',
            actionLabel: 'Clear filters',
            onAction: () => {
              setSearch('')
              setModule('all')
              setType('all')
            },
          }}
        />
      </Card>
    </div>
  )
}
