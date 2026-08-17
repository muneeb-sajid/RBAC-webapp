import api, { USE_MOCKS } from './api'

const MOCK_DELAY = 550

const MOCK_ACCOUNTS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123!',
    roles: ['Admin'],
    permissions: [
      'users.view', 'users.create', 'users.update', 'users.delete',
      'roles.view', 'roles.create', 'roles.update', 'roles.delete',
      'permissions.view', 'permissions.create', 'permissions.update', 'permissions.delete',
      'reports.view', 'reports.export', 'settings.view', 'settings.update',
    ],
    avatarColor: '#4F46E5',
    createdAt: '2025-01-01',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Morgan Manager',
    email: 'manager@example.com',
    password: 'Manager123!',
    roles: ['Manager'],
    permissions: ['users.view', 'users.create', 'users.update', 'roles.view', 'reports.view', 'reports.export'],
    avatarColor: '#059669',
    createdAt: '2025-01-18',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Vera Viewer',
    email: 'viewer@example.com',
    password: 'Viewer123!',
    roles: ['Viewer'],
    permissions: ['users.view', 'roles.view', 'permissions.view', 'reports.view'],
    avatarColor: '#D97706',
    createdAt: '2025-02-02',
    lastLogin: new Date().toISOString(),
  },
]

const delay = (ms = MOCK_DELAY) => new Promise((resolve) => setTimeout(resolve, ms))

function sanitize(account) {
  const { password, ...rest } = account
  return rest
}

export async function login({ email, password }) {
  if (USE_MOCKS) {
    await delay()
    const account = MOCK_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase())
    if (!account || account.password !== password) {
      const error = new Error('Invalid email or password.')
      error.code = 'INVALID_CREDENTIALS'
      throw error
    }
    const token = `mock.${btoa(account.id)}.${Date.now()}`
    return { user: sanitize(account), token }
  }
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function register({ name, email, password, role }) {
  if (USE_MOCKS) {
    await delay()
    if (MOCK_ACCOUNTS.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      const error = new Error('An account with that email already exists.')
      error.code = 'EMAIL_TAKEN'
      throw error
    }
    const account = {
      id: String(MOCK_ACCOUNTS.length + 1),
      name,
      email,
      password,
      roles: [role || 'User'],
      permissions: ['users.view'],
      avatarColor: '#7C3AED',
      createdAt: new Date().toISOString().slice(0, 10),
      lastLogin: null,
    }
    MOCK_ACCOUNTS.push(account)
    const token = `mock.${btoa(account.id)}.${Date.now()}`
    return { user: sanitize(account), token }
  }
  const { data } = await api.post('/auth/register', { name, email, password, role })
  return data
}

export async function logout() {
  if (USE_MOCKS) {
    await delay(200)
    return { success: true }
  }
  const { data } = await api.post('/auth/logout')
  return data
}

export async function fetchCurrentUser() {
  if (USE_MOCKS) {
    await delay(200)
    const raw = localStorage.getItem('rbac_user')
    return raw ? JSON.parse(raw) : null
  }
  const { data } = await api.get('/auth/me')
  return data
}
