import { permissionNames } from './seedPermissions.js'

export const roles = [
  {
    id: 'r1',
    name: 'Admin',
    description: 'Full access to every module in the system.',
    status: 'active',
    createdAt: '2025-01-10',
    permissions: permissionNames,
  },
  {
    id: 'r2',
    name: 'Manager',
    description: 'Manage users and view reports, without destructive access.',
    status: 'active',
    createdAt: '2025-01-18',
    permissions: ['users.view', 'users.create', 'users.update', 'roles.view', 'reports.view', 'reports.export'],
  },
  {
    id: 'r3',
    name: 'Editor',
    description: 'Can update content-related records but cannot manage access.',
    status: 'active',
    createdAt: '2025-01-22',
    permissions: ['users.view', 'users.update', 'reports.view'],
  },
  {
    id: 'r4',
    name: 'Viewer',
    description: 'Read-only access across most modules.',
    status: 'active',
    createdAt: '2025-02-02',
    permissions: ['users.view', 'roles.view', 'permissions.view', 'reports.view'],
  },
  {
    id: 'r5',
    name: 'User',
    description: 'Default role for standard application users.',
    status: 'active',
    createdAt: '2025-02-14',
    permissions: ['users.view'],
  },
  {
    id: 'r6',
    name: 'Billing Admin',
    description: 'Manages invoices and payment settings only.',
    status: 'inactive',
    createdAt: '2025-03-01',
    permissions: ['billing.view', 'billing.manage'],
  },
]
