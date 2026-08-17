import { useAuth } from '../context/AuthContext.jsx'

// Thin convenience wrapper so components can do:
// const { can, canAny } = usePermission()
export default function usePermission() {
  const { hasPermission, hasAnyPermission, hasRole } = useAuth()
  return {
    can: hasPermission,
    canAny: hasAnyPermission,
    isRole: hasRole,
  }
}
