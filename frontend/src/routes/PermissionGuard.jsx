import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Wrap a route element to require one or more permissions.
 * Usage: <PermissionGuard permission="users.create"><UserCreate /></PermissionGuard>
 * or permissions={["a","b"]} any={true} to require at least one of several.
 */
export default function PermissionGuard({ children, permission, permissions, any = false, redirectTo = '/403' }) {
  const { hasPermission, hasAnyPermission } = useAuth()

  let allowed = true
  if (permission) {
    allowed = hasPermission(permission)
  } else if (permissions?.length) {
    allowed = any ? hasAnyPermission(permissions) : permissions.every((p) => hasPermission(p))
  }

  if (!allowed) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}

/**
 * Inline variant for hiding/disabling UI (not a route guard).
 * Usage: <Can permission="users.delete"><Button>Delete</Button></Can>
 */
export function Can({ permission, permissions, any = false, fallback = null, children }) {
  const { hasPermission, hasAnyPermission } = useAuth()
  let allowed = true
  if (permission) {
    allowed = hasPermission(permission)
  } else if (permissions?.length) {
    allowed = any ? hasAnyPermission(permissions) : permissions.every((p) => hasPermission(p))
  }
  return allowed ? children : fallback
}
