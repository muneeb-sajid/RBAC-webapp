// Centralized mock data. Swap this file's exports for real API responses
// once the Node.js/Express backend is connected (see services/*.js).

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
  { id: 'p11', name: 'permissions.update', displayName: 'Update Permissions', module: 'Permissions', description: 'Allows editing permission metadata.', status: 'active', createdAt: '2025-01-15' },
  { id: 'p12', name: 'permissions.delete', displayName: 'Delete Permissions', module: 'Permissions', description: 'Allows removing permissions.', status: 'active', createdAt: '2025-01-15' },
  { id: 'p13', name: 'reports.view', displayName: 'View Reports', module: 'Reports', description: 'Allows viewing analytics and reports.', status: 'active', createdAt: '2025-02-01' },
  { id: 'p14', name: 'reports.export', displayName: 'Export Reports', module: 'Reports', description: 'Allows exporting reports to CSV/PDF.', status: 'active', createdAt: '2025-02-01' },
  { id: 'p15', name: 'settings.view', displayName: 'View Settings', module: 'Settings', description: 'Allows viewing system settings.', status: 'active', createdAt: '2025-02-05' },
  { id: 'p16', name: 'settings.update', displayName: 'Update Settings', module: 'Settings', description: 'Allows changing system settings.', status: 'active', createdAt: '2025-02-05' },
  { id: 'p17', name: 'billing.view', displayName: 'View Billing', module: 'Billing', description: 'Allows viewing invoices and billing history.', status: 'active', createdAt: '2025-02-10' },
  { id: 'p18', name: 'billing.manage', displayName: 'Manage Billing', module: 'Billing', description: 'Allows updating payment methods and plans.', status: 'inactive', createdAt: '2025-02-10' },
]

export const permissionNames = permissions.map((p) => p.name)

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

const firstNames = ['Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas', 'Mia', 'James', 'Amelia', 'Benjamin', 'Harper', 'Elijah', 'Evelyn', 'Henry', 'Abigail', 'Alexander', 'Zainab', 'Hassan', 'Ayesha', 'Bilal', 'Sara', 'Omar', 'Fatima', 'Ali']
const lastNames = ['Carter', 'Nguyen', 'Patel', 'Garcia', 'Kim', 'Rossi', 'Martin', 'Silva', 'Khan', 'Chen', 'Novak', 'Meyer', 'Osei', 'Diallo', 'Fischer', 'Suzuki', 'Ahmed', 'Malik', 'Farooq', 'Sheikh']

function seededUsers(count) {
  const list = []
  for (let i = 0; i < count; i++) {
    const first = firstNames[i % firstNames.length]
    const last = lastNames[(i * 3 + 1) % lastNames.length]
    const roleCount = (i % 5 === 0) ? 2 : 1
    const roleIdx = i % roles.length
    const userRoles = [roles[roleIdx].name]
    if (roleCount === 2) userRoles.push(roles[(roleIdx + 2) % roles.length].name)
    const status = i % 9 === 0 ? 'suspended' : i % 6 === 0 ? 'inactive' : 'active'
    const day = String((i % 27) + 1).padStart(2, '0')
    const month = String(((i * 2) % 12) + 1).padStart(2, '0')
    list.push({
      id: `u${i + 1}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@northgate.io`,
      roles: userRoles,
      status,
      createdAt: `2025-${month}-${day}`,
      lastLogin: i % 7 === 0 ? null : `2026-08-${String((i % 12) + 1).padStart(2, '0')}T0${(i % 9) + 1}:${(i * 7) % 60 < 10 ? '0' : ''}${(i * 7) % 60}:00`,
      avatarColor: ['#4F46E5', '#059669', '#D97706', '#DC2626', '#2563EB', '#7C3AED'][i % 6],
    })
  }
  return list
}

export const users = seededUsers(94)

export const recentActivity = [
  { id: 'a1', actor: 'Admin User', action: 'assigned role', target: 'Manager → Sara Ahmed', time: '8 minutes ago', type: 'role' },
  { id: 'a2', actor: 'Olivia Carter', action: 'updated permissions for', target: 'Editor role', time: '32 minutes ago', type: 'permission' },
  { id: 'a3', actor: 'System', action: 'suspended', target: 'Bilal Malik', time: '1 hour ago', type: 'user' },
  { id: 'a4', actor: 'Admin User', action: 'created role', target: 'Billing Admin', time: '3 hours ago', type: 'role' },
  { id: 'a5', actor: 'Noah Nguyen', action: 'revoked permission', target: 'billing.manage from Viewer', time: '5 hours ago', type: 'permission' },
  { id: 'a6', actor: 'Admin User', action: 'created user', target: 'Zainab Khan', time: 'Yesterday', type: 'user' },
  { id: 'a7', actor: 'Ethan Patel', action: 'logged in from a new device', target: 'Chrome on macOS', time: 'Yesterday', type: 'auth' },
  { id: 'a8', actor: 'Admin User', action: 'updated role', target: 'Manager permissions', time: '2 days ago', type: 'role' },
]

export const dashboardStats = {
  totalUsers: users.length,
  totalRoles: roles.length,
  totalPermissions: permissions.length,
  activeUsers: users.filter((u) => u.status === 'active').length,
  trends: { users: 12.5, roles: 2, permissions: 8, activeUsers: 6.4 },
}

export const usersByRole = roles.map((r) => ({
  role: r.name,
  count: users.filter((u) => u.roles.includes(r.name)).length,
}))

export const permissionsByModule = MODULES.map((m) => ({
  module: m,
  count: permissions.filter((p) => p.module === m).length,
}))

export const weeklyActiveTrend = [
  { day: 'Mon', value: 812 },
  { day: 'Tue', value: 940 },
  { day: 'Wed', value: 861 },
  { day: 'Thu', value: 1024 },
  { day: 'Fri', value: 980 },
  { day: 'Sat', value: 640 },
  { day: 'Sun', value: 705 },
]
