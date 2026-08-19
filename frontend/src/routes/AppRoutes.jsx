import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'
import PermissionGuard from './PermissionGuard.jsx'
import AppShell from '../layouts/AppShell.jsx'

import Login from '../pages/auth/Login.jsx'
import Register from '../pages/auth/Register.jsx'

import Dashboard from '../pages/dashboard/Dashboard.jsx'

import Users from '../pages/users/Users.jsx'
import UserCreate from '../pages/users/UserCreate.jsx'
import UserDetails from '../pages/users/UserDetails.jsx'
import UserPermissions from '../pages/users/UserPermissions.jsx'
import UserPermissionsLookup from '../pages/users/UserPermissionsLookup.jsx'
import UserActivity from '../pages/users/UserActivity.jsx'

import Roles from '../pages/roles/Roles.jsx'
import RoleCreate from '../pages/roles/RoleCreate.jsx'
import RoleDetails from '../pages/roles/RoleDetails.jsx'

import Permissions from '../pages/permissions/Permissions.jsx'
import AssignPermission from '../pages/permissions/AssignPermission.jsx'
import RevokePermission from '../pages/permissions/RevokePermission.jsx'

import Security from '../pages/security/Security.jsx'
import Profile from '../pages/profile/Profile.jsx'
import SettingsPage from '../pages/settings/Settings.jsx'

import Unauthorized from '../pages/errors/Unauthorized.jsx'
import Forbidden from '../pages/errors/Forbidden.jsx'
import NotFound from '../pages/errors/NotFound.jsx'
import ServerError from '../pages/errors/ServerError.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Standalone error routes (outside the shell) */}
      <Route path="/401" element={<Unauthorized />} />
      <Route path="/403" element={<Forbidden />} />
      <Route path="/500" element={<ServerError />} />

      {/* Protected routes inside the app shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/users"
            element={
              <PermissionGuard permission="users.view">
                <Users />
              </PermissionGuard>
            }
          />
          <Route
            path="/users/create"
            element={
              <PermissionGuard permission="users.create">
                <UserCreate />
              </PermissionGuard>
            }
          />
          <Route
            path="/users/lookup/permissions"
            element={
              <PermissionGuard permission="users.view">
                <UserPermissionsLookup />
              </PermissionGuard>
            }
          />
          <Route
            path="/users/:id"
            element={
              <PermissionGuard permission="users.view">
                <UserDetails />
              </PermissionGuard>
            }
          />
          <Route
            path="/users/:id/permissions"
            element={
              <PermissionGuard permission="users.view">
                <UserPermissions />
              </PermissionGuard>
            }
          />
          <Route
            path="/users/:id/activity"
            element={
              <PermissionGuard permission="activity.view">
                <UserActivity />
              </PermissionGuard>
            }
          />

          <Route
            path="/roles"
            element={
              <PermissionGuard permission="roles.view">
                <Roles />
              </PermissionGuard>
            }
          />
          <Route
            path="/roles/create"
            element={
              <PermissionGuard permission="roles.create">
                <RoleCreate />
              </PermissionGuard>
            }
          />
          <Route
            path="/roles/:id"
            element={
              <PermissionGuard permission="roles.view">
                <RoleDetails />
              </PermissionGuard>
            }
          />

          <Route
            path="/permissions"
            element={
              <PermissionGuard permission="permissions.view">
                <Permissions />
              </PermissionGuard>
            }
          />
          
          <Route
            path="/permissions/assign"
            element={
              <PermissionGuard permission="permissions.update">
                <AssignPermission />
              </PermissionGuard>
            }
          />
          <Route
            path="/permissions/revoke"
            element={
              <PermissionGuard permission="permissions.update">
                <RevokePermission />
              </PermissionGuard>
            }
          />

          <Route
            path="/security"
            element={
              <PermissionGuard permission="security.view">
                <Security />
              </PermissionGuard>
            }
          />

          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
