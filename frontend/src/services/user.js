import api, { USE_MOCKS } from './api'
import { users as seedUsers, roles as allRoles } from '../data/mockData'

const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory mutable copy so create/update/delete feel real during a session.
let usersStore = [...seedUsers]

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export async function getUsers({ page = 1, pageSize = 10, search = '', status = 'all', role = 'all' } = {}) {
  if (USE_MOCKS) {
    await delay()
    let filtered = usersStore
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    if (status !== 'all') filtered = filtered.filter((u) => u.status === status)
    if (role !== 'all') filtered = filtered.filter((u) => u.roles.includes(role))
    const total = filtered.length
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)
    return { items: clone(items), total, page, pageSize }
  }
  const { data } = await api.get('/users', { params: { page, pageSize, search, status, role } })
  return data
}

export async function getUserById(id) {
  if (USE_MOCKS) {
    await delay(300)
    const user = usersStore.find((u) => u.id === id)
    if (!user) {
      const error = new Error('User not found.')
      error.code = 'NOT_FOUND'
      throw error
    }
    return clone(user)
  }
  const { data } = await api.get(`/users/${id}`)
  return data
}

export async function createUser(payload) {
  if (USE_MOCKS) {
    await delay(500)
    const newUser = {
      id: `u${Date.now()}`,
      name: payload.name,
      email: payload.email,
      roles: payload.roles || [],
      status: payload.status || 'active',
      createdAt: new Date().toISOString().slice(0, 10),
      lastLogin: null,
      avatarColor: '#4F46E5',
    }
    usersStore = [newUser, ...usersStore]
    return clone(newUser)
  }
  const { data } = await api.post('/users', payload)
  return data
}

export async function updateUser(id, payload) {
  if (USE_MOCKS) {
    await delay(450)
    usersStore = usersStore.map((u) => (u.id === id ? { ...u, ...payload } : u))
    const updated = usersStore.find((u) => u.id === id)
    return clone(updated)
  }
  const { data } = await api.put(`/users/${id}`, payload)
  return data
}

export async function deleteUser(id) {
  if (USE_MOCKS) {
    await delay(400)
    usersStore = usersStore.filter((u) => u.id !== id)
    return { success: true }
  }
  const { data } = await api.delete(`/users/${id}`)
  return data
}

export async function getUserEffectivePermissions(id) {
  if (USE_MOCKS) {
    await delay(350)
    const user = usersStore.find((u) => u.id === id)
    if (!user) throw new Error('User not found.')
    const rolePermissions = new Set()
    user.roles.forEach((roleName) => {
      const role = allRoles.find((r) => r.name === roleName)
      role?.permissions.forEach((p) => rolePermissions.add(p))
    })
    const directPermissions = user.directPermissions || []
    const effective = new Set([...rolePermissions, ...directPermissions])
    return {
      roles: user.roles,
      rolePermissions: Array.from(rolePermissions),
      directPermissions,
      effectivePermissions: Array.from(effective),
    }
  }
  const { data } = await api.get(`/users/${id}/permissions`)
  return data
}
