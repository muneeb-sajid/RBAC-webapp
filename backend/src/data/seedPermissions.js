// In-memory data layer. Swap this module for a real database (Postgres,
// MongoDB, etc.) later — every controller only talks to the functions
// exported from src/data/store.js, never to these arrays directly from
// outside this folder.

export const MODULES = ['Users', 'Roles', 'Permissions', 'Reports', 'Settings', 'Billing']

export const permissions = [
  { id: 'p1', name: 'users.view', displayName: 'View Users', module: 'Users', description: 'Allows viewing the users list and profiles.', status: 'active', createdAt: '2025-01-12' },
  { id: 'p2', name: 'users.create', displayName: 'Create Users', module: 'Users', description: 'Allows creating new user accounts.', status: 'active', createdAt: '2025-01-12' },
  { id: 'p3', name: 'users.update', displayName: 'Update Users', module: 'Users', description: 'Allows editing existing user accounts.', status: 'active', createdAt: '2025-01-12' },
  { id: 'p4', name: 'users.delete', displayName: 'Delete Users', module: 'Users', description: 'Allows removing user accounts.', status: 'active', createdAt: '2025-01-12' },
  { id: 'p5', name: 'roles.view', displayName: 'View Roles', module: 'Roles', description: 'Allows viewing roles and their permissions.', status: 'active', createdAt: '2025-01-14' },
  { id: 'p6', name: 'roles.create', displayName: 'Create Roles', module: 'Roles', description: 'Allows creating new roles.', status: 'active', createdAt: '2025-01-14' },
  { id: 'p7', name: 'roles.update', displayName: 'Update Roles', module: 'Roles', description: 'Allows editing existing roles.', status: 'active', createdAt: '2025-01-14' },
  { id: 'p8', name: 'roles.delete', displayName: 'Delete Roles', module: 'Roles', description: 'Allows removing roles.', status: 'active', createdAt: '2025-01-14' },
  { id: 'p9', name: 'permissions.view', displayName: 'View Permissions', module: 'Permissions', description: 'Allows viewing the permissions catalog.', status: 'active', createdAt: '2025-01-15' },
  { id: 'p10', name: 'permissions.create', displayName: 'Create Permissions', module: 'Permissions', description: 'Allows defining new permissions.', status: 'active', createdAt: '2025-01-15' },
  { id: 'p11', name: 'permissions.update', displayName: 'Update Permissions', module: 'Permissions', description: 'Allows editing permission metadata, including assigning/revoking on roles.', status: 'active', createdAt: '2025-01-15' },
  { id: 'p12', name: 'permissions.delete', displayName: 'Delete Permissions', module: 'Permissions', description: 'Allows removing permissions.', status: 'active', createdAt: '2025-01-15' },
  { id: 'p13', name: 'reports.view', displayName: 'View Reports', module: 'Reports', description: 'Allows viewing analytics and reports.', status: 'active', createdAt: '2025-02-01' },
  { id: 'p14', name: 'reports.export', displayName: 'Export Reports', module: 'Reports', description: 'Allows exporting reports to CSV/PDF.', status: 'active', createdAt: '2025-02-01' },
  { id: 'p15', name: 'settings.view', displayName: 'View Settings', module: 'Settings', description: 'Allows viewing system settings.', status: 'active', createdAt: '2025-02-05' },
  { id: 'p16', name: 'settings.update', displayName: 'Update Settings', module: 'Settings', description: 'Allows changing system settings.', status: 'active', createdAt: '2025-02-05' },
  { id: 'p17', name: 'billing.view', displayName: 'View Billing', module: 'Billing', description: 'Allows viewing invoices and billing history.', status: 'active', createdAt: '2025-02-10' },
  { id: 'p18', name: 'billing.manage', displayName: 'Manage Billing', module: 'Billing', description: 'Allows updating payment methods and plans.', status: 'inactive', createdAt: '2025-02-10' },
]

export const permissionNames = permissions.map((p) => p.name)
