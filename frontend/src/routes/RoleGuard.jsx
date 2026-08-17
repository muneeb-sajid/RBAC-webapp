import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Wrap a route element to require one of a set of roles.
 * Usage: <RoleGuard roles={["Admin", "Manager"]}><Dashboard /></RoleGuard>
 */
export default function RoleGuard({ children, roles = [], redirectTo = '/403' }) {
  const { hasRole } = useAuth()
  const allowed = roles.length === 0 || roles.some((role) => hasRole(role))

  if (!allowed) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
