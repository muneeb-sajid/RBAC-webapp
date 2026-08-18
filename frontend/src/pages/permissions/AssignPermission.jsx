// src/pages/permissions/AssignPermission.jsx
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom' // ✅ Add this
import PageHeader from '../../components/common/PageHeader.jsx'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Select from '../../components/common/Select.jsx'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import PermissionMatrix from '../../components/permissions/PermissionMatrix.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getRolesForAssignment, assignPermissions } from '../../services/permission'

export default function AssignPermission() {
  const toast = useToast()
  const location = useLocation() // ✅ Add this
  const [roles, setRoles] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [roleId, setRoleId] = useState('')
  const [selected, setSelected] = useState([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // ✅ Create a reusable load function
  const loadRoles = async () => {
    setLoadingRoles(true)
    try {
      const result = await getRolesForAssignment()
      
      
      if (result && result.length > 0) {
        setRoles(result)
        // Keep the currently selected role if it exists, otherwise use first
        const currentRole = result.find(r => r.id === roleId)
        if (currentRole) {
          setSelected(currentRole.permissions || [])
        } else {
          setRoleId(result[0].id)
          setSelected(result[0].permissions || [])
        }
      } else {
        setRoles([])
        setSelected([])
        toast.warning('No roles found. Please create a role first.')
      }
    } catch (error) {
      console.error('❌ Error loading roles:', error)
      toast.error(error.response?.data?.error?.message || 'Failed to load roles')
      setRoles([])
      setSelected([])
    } finally {
      setLoadingRoles(false)
    }
  }

  // ✅ Load on mount
  useEffect(() => {
    loadRoles()
  }, [])

  // ✅ Refresh when coming back from permission creation
  useEffect(() => {
    if (location.state?.refresh) {
      loadRoles()
      // Clear the refresh flag
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  function handleRoleChange(id) {
    setRoleId(id)
    const role = roles.find((r) => r.id === id)
    setSelected(role?.permissions || [])
  }

  const currentRole = roles.find((r) => r.id === roleId)
  const originalPermissions = currentRole?.permissions || []
  const newlyAdded = selected.filter((p) => !originalPermissions.includes(p))

  async function handleSave() {
 
    setSaving(true)
    try {
      await assignPermissions({ roleId, permissionNames: selected })
      toast.success('Permissions assigned', { 
        description: `${newlyAdded.length} new permission(s) added to ${currentRole?.name}.` 
      })
      setConfirmOpen(false)
      // ✅ Reload to refresh data
      await loadRoles()
    } catch (error) {
      console.error('❌ Assign permissions error:', error)
      toast.error(error.response?.data?.error?.message || 'Failed to assign permissions')
    } finally {
      setSaving(false)
    }
  }

  if (loadingRoles) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size={26} label="Loading roles…" />
      </div>
    )
  }

  if (!roles || roles.length === 0) {
    return (
      <div>
        <PageHeader title="Assign permissions" description="Grant additional permissions to a role." />
        <Card>
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <p>No roles found. Please create a role first.</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Assign permissions" description="Grant additional permissions to a role." />

      <Card className="mb-5 max-w-md">
        <Select
          label="Role"
          value={roleId}
          onChange={(e) => handleRoleChange(e.target.value)}
          options={roles.map((r) => ({ value: r.id, label: r.name }))}
        />
      </Card>

      <Card>
        <CardHeader
          title="Available permissions"
          description={`${selected.length} selected · ${newlyAdded.length} new`}
          action={
            <Button onClick={() => setConfirmOpen(true)} disabled={newlyAdded.length === 0 || saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          }
        />
        <PermissionMatrix 
          selected={selected} 
          onChange={setSelected} 
          highlightNames={originalPermissions} 
        />
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSave}
        loading={saving}
        tone="primary"
        title="Confirm permission assignment"
        description={`This will grant ${newlyAdded.length} new permission(s) to the ${currentRole?.name} role.`}
        confirmLabel="Assign permissions"
      />
    </div>
  )
}