// src/pages/permissions/PermissionCreate.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card from '../../components/common/Card.jsx'
import Input from '../../components/common/Input.jsx'
import Select from '../../components/common/Select.jsx'
import Button from '../../components/common/Button.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { createPermission } from '../../services/permission'
import { MODULES } from '../../data/mockData'

export default function PermissionCreate() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ 
    name: '', 
    displayName: '', 
    module: MODULES[0], 
    description: '', 
    status: 'active' 
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Permission name is required.'
    else if (!/^[a-z0-9]+\.[a-z0-9]+$/.test(form.name)) next.name = 'Use the format module.action, e.g. users.create.'
    if (!form.displayName.trim()) next.displayName = 'Display name is required.'
    if (!form.description.trim()) next.description = 'Description is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const result = await createPermission(form)
      
      toast.success('Permission created', { 
        description: `${form.name} is now available to assign.` 
      })
      
      
      navigate('/permissions', { 
        state: { 
          refresh: Date.now(),
          fromCreate: true 
        } 
      })
    } catch (error) {
      console.error('❌ Error creating permission:', error)
      toast.error(error.response?.data?.error?.message || 'Failed to create permission')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Create permission"
        description="Define a new permission that roles can be granted."
        breadcrumb={[{ label: 'Permissions', to: '/permissions' }, { label: 'Create' }]}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Permission name"
              placeholder="users.create"
              hint="Lowercase, dot-separated: module.action"
              value={form.name}
              error={errors.name}
              onChange={(e) => set('name', e.target.value)}
              required
              className="font-mono"
            />
            <Input
              label="Display name"
              placeholder="Create Users"
              value={form.displayName}
              error={errors.displayName}
              onChange={(e) => set('displayName', e.target.value)}
              required
            />
            <Select
              label="Module"
              value={form.module}
              onChange={(e) => set('module', e.target.value)}
              options={MODULES.map((m) => ({ value: m, label: m }))}
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
            <Input
              label="Description"
              placeholder="Allows the user to create new users."
              value={form.description}
              error={errors.description}
              onChange={(e) => set('description', e.target.value)}
              required
              containerClassName="sm:col-span-2"
            />
          </div>
        </Card>

        <div className="mt-5 flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/permissions')}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create permission
          </Button>
        </div>
      </form>
    </div>
  )
}