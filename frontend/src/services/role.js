import api, { USE_MOCKS } from './api'
import { roles as seedRoles, users as seedUsers } from '../data/mockData'

const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms))

let rolesStore = [...seedRoles]

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export async function getRoles({ search = '' } = {}) {
  if (USE_MOCKS) {
    await delay()
    let filtered = rolesStore
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    }
    const withCounts = filtered.map((r) => ({
      ...r,
      usersCount: seedUsers.filter((u) => u.roles.includes(r.name)).length,
      permissionsCount: r.permissions.length,
    }))
    return { items: clone(withCounts), total: withCounts.length }
  }
  const { data } = await api.get('/roles', { params: { search } })
  return data
}

export async function getRoleById(id) {
  if (USE_MOCKS) {
    await delay(300)
    const role = rolesStore.find((r) => r.id === id)
    if (!role) {
      const error = new Error('Role not found.')
      error.code = 'NOT_FOUND'
      throw error
    }
    const usersWithRole = seedUsers.filter((u) => u.roles.includes(role.name)).map((u) => ({ id: u.id, name: u.name, email: u.email }))
    return clone({ ...role, users: usersWithRole })
  }
  const { data } = await api.get(`/roles/${id}`)
  return data
}

export async function createRole(payload) {
  if (USE_MOCKS) {
    await delay(500)
    const newRole = {
      id: `r${Date.now()}`,
      name: payload.name,
      description: payload.description,
      status: payload.status || 'active',
      createdAt: new Date().toISOString().slice(0, 10),
      permissions: payload.permissions || [],
    }
    rolesStore = [newRole, ...rolesStore]
    return clone(newRole)
  }
  const { data } = await api.post('/roles', payload)
  return data
}

export async function updateRole(id, payload) {
  if (USE_MOCKS) {
    await delay(450)
    rolesStore = rolesStore.map((r) => (r.id === id ? { ...r, ...payload } : r))
    return clone(rolesStore.find((r) => r.id === id))
  }
  const { data } = await api.put(`/roles/${id}`, payload)
  return data
}

export async function deleteRole(id) {
  if (USE_MOCKS) {
    await delay(400)
    rolesStore = rolesStore.filter((r) => r.id !== id)
    return { success: true }
  }
  const { data } = await api.delete(`/roles/${id}`)
  return data
}


export async function getAllRoles() {
  try {
    const { data } = await api.get('/roles/all/list')
    console.log('📊 getAllRoles - Raw response:', data)
    
    // Handle different response formats
    let roles = []
    if (Array.isArray(data)) {
      roles = data
      console.log('✅ getAllRoles - Array with', roles.length, 'roles')
    } else if (data && data.roles && Array.isArray(data.roles)) {
      roles = data.roles
      console.log('✅ getAllRoles - data.roles with', roles.length, 'roles')
    } else if (data && data.items && Array.isArray(data.items)) {
      roles = data.items
      console.log('✅ getAllRoles - data.items with', roles.length, 'roles')
    } else {
      console.warn('⚠️ getAllRoles - Unknown format:', data)
      roles = []
    }
    
    return roles
  } catch (error) {
    console.error('❌ Error fetching all roles:', error)
    return []
  }
}