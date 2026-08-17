import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('rbac_token')
    const rawUser = localStorage.getItem('rbac_user')
    if (token && rawUser) {
      try {
        setUser(JSON.parse(rawUser))
      } catch {
        localStorage.removeItem('rbac_user')
        localStorage.removeItem('rbac_token')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async ({ email, password, remember }) => {
    setAuthError(null)
    const { user: loggedInUser, token } = await authService.login({ email, password })
    localStorage.setItem('rbac_token', token)
    localStorage.setItem('rbac_user', JSON.stringify(loggedInUser))
    if (remember) localStorage.setItem('rbac_remember', '1')
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const register = useCallback(async (payload) => {
    setAuthError(null)
    const { user: newUser, token } = await authService.register(payload)
    localStorage.setItem('rbac_token', token)
    localStorage.setItem('rbac_user', JSON.stringify(newUser))
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      localStorage.removeItem('rbac_token')
      localStorage.removeItem('rbac_user')
      setUser(null)
    }
  }, [])

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false
      if (!permission) return true
      return user.permissions?.includes(permission)
    },
    [user]
  )

  const hasAnyPermission = useCallback(
    (permissionList = []) => permissionList.some((p) => hasPermission(p)),
    [hasPermission]
  )

  const hasRole = useCallback((roleName) => !!user?.roles?.includes(roleName), [user])

  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial }
      localStorage.setItem('rbac_user', JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      hasPermission,
      hasAnyPermission,
      hasRole,
      updateUser,
    }),
    [user, loading, authError, login, register, logout, hasPermission, hasAnyPermission, hasRole, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
