// src/services/permission.js
import api, { USE_MOCKS } from './api'
import { permissions as seedPermissions, roles as seedRoles } from '../data/mockData'

const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms))

let permissionsStore = [...seedPermissions]
let rolesStore = seedRoles

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// src/services/permission.js - Updated getPermissions

export async function getPermissions({ search = '', module = 'all', type = 'all' } = {}) {
  if (USE_MOCKS) {
    await delay()
    let filtered = permissionsStore
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q))
    }
    if (module !== 'all') filtered = filtered.filter((p) => p.module === module)
    if (type !== 'all') filtered = filtered.filter((p) => p.name.endsWith(`.${type}`))
    const withRoles = filtered.map((p) => ({
      ...p,
      assignedRoles: rolesStore.filter((r) => r.permissions.includes(p.name)).map((r) => r.name),
    }))
    return { items: clone(withRoles), total: withRoles.length }
  }
  
  // 🔥 REAL API CALL
  try {
    const response = await api.get('/permissions', { params: { search, module, type } })
    
    // ✅ The data is directly in response.data (an array)
    const data = response.data
    
    // ✅ Since the response is already an array, use it directly
    let permissions = []
    
    if (Array.isArray(data)) {
      permissions = data
    } else if (data && data.permissions && Array.isArray(data.permissions)) {
      permissions = data.permissions
    } else if (data && data.items && Array.isArray(data.items)) {
      permissions = data.items
     
    } else {
      console.warn('⚠️ Unknown data format:', data)
      permissions = []
    }
    
    // ✅ Ensure each permission has an assignedRoles array
    permissions = permissions.map(p => ({
      ...p,
      assignedRoles: p.assignedRoles || []
    }))
    
    
    // ✅ Always return { items, total }
    return {
      items: permissions,
      total: permissions.length
    }
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return { items: [], total: 0 }
  }
}

// src/services/permission.js - Updated assignPermissions

export async function assignPermissions({ roleId, permissionNames }) {
  if (!roleId) {
    console.error('❌ roleId is required')
    throw new Error('roleId is required')
  }

  if (
    !Array.isArray(permissionNames) ||
    permissionNames.length === 0
  ) {
    console.error('❌ permissionNames array is required and must not be empty')
    throw new Error('permissionNames array is required and must not be empty')
  }

  if (USE_MOCKS) {
    await delay(500)

    rolesStore = rolesStore.map((r) => {
      if (r.id !== roleId) return r

      const merged = Array.from(
        new Set([...r.permissions, ...permissionNames])
      )

      return {
        ...r,
        permissions: merged,
      }
    })

    return clone(rolesStore.find((r) => r.id === roleId))
  }

  try {
    const { data } = await api.post('/permissions/assign', {
      roleId,
      permissionNames,
    })

    return data
  } catch (error) {
    console.error(
      '❌ Error assigning permissions:',
      error.response?.data || error
    )
    throw error
  }
}

export async function revokePermissions({ roleId, permissionNames }) {
  if (!roleId) {
    console.error('❌ roleId is required')
    throw new Error('roleId is required')
  }

  if (
    !Array.isArray(permissionNames) ||
    permissionNames.length === 0
  ) {
    console.error(
      '❌ permissionNames array is required and must not be empty'
    )
    throw new Error(
      'permissionNames array is required and must not be empty'
    )
  }

  if (USE_MOCKS) {
    await delay(500)

    rolesStore = rolesStore.map((r) => {
      if (r.id !== roleId) return r

      return {
        ...r,
        permissions: (r.permissions || []).filter(
          (permission) => !permissionNames.includes(permission)
        ),
      }
    })

    return clone(
      rolesStore.find((r) => r.id === roleId)
    )
  }

  try {
    const { data } = await api.post('/permissions/revoke', {
      roleId,
      permissionNames,
    })

    return data
  } catch (error) {
    console.error(
      '❌ Error revoking permissions:',
      error.response?.data || error
    )

    throw error
  }
}

// ✅ FIXED: Get roles for assignment
export async function getRolesForAssignment() {
  if (USE_MOCKS) {
    await delay(300)
    return clone(rolesStore.map(r => ({
      id: r.id,
      name: r.name,
      permissions: r.permissions || []
    })))
  }
  
  try {
    // 🔥 REAL API CALL - /roles/all/list returns an array directly
    const { data } = await api.get('/roles/all/list')
    
    // ✅ The response is already an array!
    let roles = []
    
    if (Array.isArray(data)) {
      roles = data
    } else if (data.roles && Array.isArray(data.roles)) {
      roles = data.roles
    } else if (data.items && Array.isArray(data.items)) {
      roles = data.items
    } else {
      // If it's neither, try to convert
      roles = Object.values(data).filter(item => typeof item === 'object' && item !== null)
    }
    
    
    // ✅ Map to the format the component expects: { id, name, permissions }
    return roles.map(r => ({
      id: r.id || r._id || String(Math.random()),
      name: r.name || 'Unnamed',
      permissions: r.permissions || []
    }))
    
  } catch (error) {
    console.error('Error fetching roles for assignment:', error)
    return [] // Return empty array instead of throwing
  }
}
// src/services/permission.js - Add or update this function

export async function getPermissionsGrouped() {
  if (USE_MOCKS) {
    await delay(200)
    const grouped = {}
    permissionsStore.forEach(p => {
      if (!grouped[p.module]) grouped[p.module] = []
      grouped[p.module].push(p.name)
    })
    return grouped
  }
  
  // 🔥 Use getPermissions to fetch and group
  try {
    const result = await getPermissions()
    
    const items = result.items || []
    
    // Group by module
    const grouped = {}
    items.forEach(p => {
      const module = p.module || 'Other'
      if (!grouped[module]) grouped[module] = []
      grouped[module].push(p.name)
    })
    
    return grouped
  } catch (error) {
    console.error('❌ Error in getPermissionsGrouped:', error)
    return {}
  }
}