import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Input from '../../components/common/Input.jsx'
import Select from '../../components/common/Select.jsx'
import Button from '../../components/common/Button.jsx'
import PermissionMatrix from '../../components/permissions/PermissionMatrix.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { createRole } from '../../services/role'

export default function RoleCreate() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', description: '', status: 'active' })
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Role name is required.'
    if (!form.description.trim()) next.description = 'Description is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const role = await createRole({ ...form, permissions: selectedPermissions })
      toast.success('Role created', { description: `${role.name} has been added with ${selectedPermissions.length} permissions.` })
      navigate(`/roles/${role.id}`)
    } catch {
      toast.error('Failed to create role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Create role"
        description="Define a new role and assign its permissions."
        breadcrumb={[{ label: 'Roles', to: '/roles' }, { label: 'Create' }]}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Card className="max-w-2xl">
          <CardHeader title="Role details" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Role name"
              placeholder="e.g. Support Agent"
              value={form.name}
              error={errors.name}
              onChange={(e) => set('name', e.target.value)}
              required
              containerClassName="sm:col-span-2"
            />
            <Input
              label="Description"
              placeholder="What can this role do?"
              value={form.description}
              error={errors.description}
              onChange={(e) => set('description', e.target.value)}
              required
              containerClassName="sm:col-span-2"
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Permissions" description={`${selectedPermissions.length} permission(s) selected`} />
          <PermissionMatrix selected={selectedPermissions} onChange={setSelectedPermissions} />
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/roles')}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save role
          </Button>
        </div>
      </form>
    </div>
  )
}
