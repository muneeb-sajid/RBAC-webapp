import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, ShieldCheck, KeyRound, Users as UsersIcon } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card from '../../components/common/Card.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Select from '../../components/common/Select.jsx'
import Button from '../../components/common/Button.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import DataTable from '../../components/tables/DataTable.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import RoleBadge from '../../components/common/RoleBadge.jsx'
import Dropdown from '../../components/common/Dropdown.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'
import { Can } from '../../routes/PermissionGuard.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getUsers, deleteUser } from '../../services/user'
import { roles } from '../../data/mockData'
import { formatDateTime, formatDate } from '../../utils/format'
import useDebounce from '../../hooks/useDebounce'

const PAGE_SIZE = 8

export default function Users() {
  const navigate = useNavigate()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [role, setRole] = useState('all')
  const [page, setPage] = useState(1)

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
      const res = await getUsers({ page, pageSize: PAGE_SIZE, search: debouncedSearch, status, role })
      setData(res)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, status, role])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, role])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      toast.success('User deleted', { description: `${deleteTarget.name} has been removed.` })
      setDeleteTarget(null)
      load()
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  function clearFilters() {
    setSearch('')
    setStatus('all')
    setRole('all')
  }

  const columns = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} color={u.avatarColor} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink-900">{u.name}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (u) => <span className="text-slate-600">{u.email}</span> },
    {
      key: 'roles',
      header: 'Roles',
      render: (u) => (
        <div className="flex flex-wrap gap-1.5">
          {u.roles.map((r) => (
            <RoleBadge key={r} role={r} icon={false} />
          ))}
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
    { key: 'createdAt', header: 'Created', sortable: true, render: (u) => <span className="text-slate-500">{formatDate(u.createdAt)}</span> },
    { key: 'lastLogin', header: 'Last login', render: (u) => <span className="text-slate-500">{formatDateTime(u.lastLogin)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (u) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={
              <button className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-muted hover:text-slate-600 transition-colors">
                <MoreHorizontal size={17} />
              </button>
            }
            items={[
              { label: 'View details', icon: Eye, onClick: () => navigate(`/users/${u.id}`) },
              { label: 'Edit user', icon: Pencil, onClick: () => navigate(`/users/${u.id}`) },
              { label: 'Manage permissions', icon: KeyRound, onClick: () => navigate(`/users/${u.id}/permissions`) },
              { divider: true },
              { label: 'Delete user', icon: Trash2, danger: true, onClick: () => setDeleteTarget(u) },
            ]}
          />
        </div>
      ),
    },
  ]

  if (error) {
    return (
      <div>
        <PageHeader title="Users" description="Manage user accounts, roles, and access." />
        <Card padded={false}>
          <ErrorState onRetry={load} />
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage user accounts, assign roles, and control access."
        actions={
          <Can permission="users.create">
            <Button icon={Plus} onClick={() => navigate('/users/create')}>
              Add user
            </Button>
          </Can>
        }
      />

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-surface-border p-4 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" className="sm:max-w-xs" />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="sm:w-40"
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="sm:w-44"
            options={[{ value: 'all', label: 'All roles' }, ...roles.map((r) => ({ value: r.name, label: r.name }))]}
          />
        </div>

        <DataTable
          columns={columns}
          data={data.items}
          loading={loading}
          onRowClick={(u) => navigate(`/users/${u.id}`)}
          empty={{
            icon: UsersIcon,
            title: 'No users found',
            description: 'No users match your current filters.',
            actionLabel: 'Clear filters',
            onAction: clearFilters,
          }}
        />

        {!loading && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />}
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this user?"
        description={`This will permanently remove ${deleteTarget?.name}'s account and revoke their access. This action cannot be undone.`}
        confirmLabel="Delete user"
      />
    </div>
  )
}
