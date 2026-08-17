import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, ShieldCheck } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card from '../../components/common/Card.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Button from '../../components/common/Button.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import Dropdown from '../../components/common/Dropdown.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { Can } from '../../routes/PermissionGuard.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getRoles, deleteRole } from '../../services/role'
import { formatDate } from '../../utils/format'
import useDebounce from '../../hooks/useDebounce'

export default function Roles() {
  const navigate = useNavigate()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const debouncedSearch = useDebounce(search, 350)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getRoles({ search: debouncedSearch })
      setData(res)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteRole(deleteTarget.id)
      toast.success('Role deleted', { description: `${deleteTarget.name} has been removed.` })
      setDeleteTarget(null)
      load()
    } catch {
      toast.error('Failed to delete role')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Role name',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <ShieldCheck size={15} />
          </div>
          <span className="font-medium text-ink-900">{r.name}</span>
        </div>
      ),
    },
    { key: 'description', header: 'Description', render: (r) => <span className="text-slate-500 line-clamp-1">{r.description}</span> },
    { key: 'usersCount', header: 'Users', sortable: true, render: (r) => <span className="text-slate-600">{r.usersCount}</span> },
    { key: 'permissionsCount', header: 'Permissions', sortable: true, render: (r) => <span className="text-slate-600">{r.permissionsCount}</span> },
    { key: 'createdAt', header: 'Created', sortable: true, render: (r) => <span className="text-slate-500">{formatDate(r.createdAt)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={
              <button className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-muted hover:text-slate-600 transition-colors">
                <MoreHorizontal size={17} />
              </button>
            }
            items={[
              { label: 'View permissions', icon: Eye, onClick: () => navigate(`/roles/${r.id}`) },
              { label: 'Edit role', icon: Pencil, onClick: () => navigate(`/roles/${r.id}`) },
              { divider: true },
              { label: 'Delete role', icon: Trash2, danger: true, onClick: () => setDeleteTarget(r) },
            ]}
          />
        </div>
      ),
    },
  ]

  if (error) {
    return (
      <div>
        <PageHeader title="Roles" description="Manage roles and their permission sets." />
        <Card padded={false}>
          <ErrorState onRetry={load} />
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Define roles and control which permissions each one grants."
        actions={
          <Can permission="roles.create">
            <Button icon={Plus} onClick={() => navigate('/roles/create')}>
              Create role
            </Button>
          </Can>
        }
      />

      <Card padded={false}>
        <div className="border-b border-surface-border p-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search roles…" className="sm:max-w-xs" />
        </div>

        <DataTable
          columns={columns}
          data={data.items}
          loading={loading}
          onRowClick={(r) => navigate(`/roles/${r.id}`)}
          empty={{
            icon: ShieldCheck,
            title: 'No roles found',
            description: 'No roles match your search.',
            actionLabel: 'Clear search',
            onAction: () => setSearch(''),
          }}
        />
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this role?"
        description={`Users assigned to "${deleteTarget?.name}" will lose the permissions it grants. This action cannot be undone.`}
        confirmLabel="Delete role"
      />
    </div>
  )
}
