import { useEffect, useState, useCallback } from 'react'
import { Check } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Select from '../../components/common/Select.jsx'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getRolesForAssignment, revokePermissions, getPermissions } from '../../services/permission'

export default function RevokePermission() {
  const toast = useToast()
  const [roles, setRoles] = useState([])
  const [allPermissions, setAllPermissions] = useState([]) // full predefined catalog from the API
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [roleId, setRoleId] = useState('')
  const [toRevoke, setToRevoke] = useState([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoadingRoles(true)
    try {
      const [rolesRes, permsRes] = await Promise.all([getRolesForAssignment(), getPermissions()])
      setRoles(rolesRes)
      setAllPermissions(permsRes.items || [])
      setRoleId((prev) => prev || rolesRes[0]?.id || '')
    } catch {
      toast.error('Failed to load roles or permissions')
    } finally {
      setLoadingRoles(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const currentRole = roles.find((r) => r.id === roleId)
  // Always driven by the live, predefined permission catalog (including
  // Security/Sessions/Activity permissions) — never the stale mock list.
  const assignedPermissions = allPermissions.filter((p) => currentRole?.permissions.includes(p.name))
  const moduleOrder = Array.from(new Set(allPermissions.map((p) => p.module)))
  const grouped = moduleOrder
    .map((module) => ({ module, items: assignedPermissions.filter((p) => p.module === module) }))
    .filter((g) => g.items.length > 0)

  function handleRoleChange(id) {
    setRoleId(id)
    setToRevoke([])
  }

  function toggle(name) {
    setToRevoke((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))
  }

  async function handleRevoke() {
    setSaving(true)
    try {
      await revokePermissions({ roleId, permissionNames: toRevoke })
      toast.success('Permissions revoked', { description: `${toRevoke.length} permission(s) removed from ${currentRole?.name}.` })
      setConfirmOpen(false)
      setToRevoke([])
      const refreshed = await getRolesForAssignment()
      setRoles(refreshed)
    } catch {
      toast.error('Failed to revoke permissions')
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

  return (
    <div>
      <PageHeader title="Revoke permissions" description="Remove permissions currently granted to a role." />

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
          title="Assigned permissions"
          description={`${assignedPermissions.length} granted · ${toRevoke.length} selected to revoke`}
          action={
            <Button variant="danger" onClick={() => setConfirmOpen(true)} disabled={toRevoke.length === 0}>
              Revoke selected
            </Button>
          }
        />

        {assignedPermissions.length === 0 ? (
          <EmptyState title="No permissions to revoke" description="This role doesn't currently have any permissions assigned." />
        ) : (
          <div className="flex flex-col gap-5">
            {grouped.map(({ module, items }) => (
              <div key={module}>
                <p className="mb-2.5 text-sm font-semibold text-ink-900">{module}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {items.map((p) => {
                    const marked = toRevoke.includes(p.name)
                    return (
                      <label
                        key={p.id || p.name}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          marked ? 'border-danger-300 bg-danger-50' : 'border-success-200 bg-success-50/60 hover:bg-success-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={marked}
                          onChange={() => toggle(p.name)}
                          className="h-3.5 w-3.5 rounded border-surface-border text-danger-500 focus:ring-danger-300"
                        />
                        {!marked && <Check size={14} className="text-success-600" />}
                        <span className={marked ? 'text-danger-700 line-through' : 'font-medium text-ink-900'}>{p.displayName}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRevoke}
        loading={saving}
        tone="danger"
        title="Confirm permission revocation"
        description={`This will remove ${toRevoke.length} permission(s) from the ${currentRole?.name} role. Users with this role will immediately lose that access.`}
        confirmLabel="Revoke permissions"
      />
    </div>
  )
}
