import api from './api'

function safeArray(data, key) {
  if (Array.isArray(data)) return { items: data, total: data.length }
  if (data && Array.isArray(data.items)) return data
  if (data && key && Array.isArray(data[key])) return { items: data[key], total: data[key].length }
  return { items: [], total: 0 }
}

// ─── Login activity ─────────────────────────────────────────────────────────

export async function getLoginActivity(params = {}) {
  try {
    const { data } = await api.get('/admin/login-activity', { params })
    return safeArray(data)
  } catch (error) {
    console.error('Error fetching login activity:', error)
    return { items: [], total: 0 }
  }
}

export async function getUserLoginHistory(userId) {
  try {
    const { data } = await api.get(`/admin/users/${userId}/login-history`)
    return safeArray(data)
  } catch (error) {
    console.error('Error fetching user login history:', error)
    return { items: [], total: 0 }
  }
}

// ─── Activity / audit ────────────────────────────────────────────────────────

export async function getUserActivity(userId, params = {}) {
  try {
    const { data } = await api.get(`/admin/users/${userId}/activity`, { params })
    return safeArray(data)
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return { items: [], total: 0 }
  }
}

export async function getUserRecentActivity(userId, limit = 6) {
  try {
    const { data } = await api.get(`/admin/users/${userId}/activity`, { params: { recent: limit } })
    return safeArray(data).items
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

export async function getGlobalActivity(params = {}) {
  try {
    const { data } = await api.get('/admin/activity', { params })
    return safeArray(data)
  } catch (error) {
    console.error('Error fetching global activity:', error)
    return { items: [], total: 0 }
  }
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function getSessions(params = {}) {
  try {
    const { data } = await api.get('/admin/sessions', { params })
    return safeArray(data)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return { items: [], total: 0 }
  }
}

export async function getUserSessions(userId) {
  try {
    const { data } = await api.get(`/admin/users/${userId}/sessions`)
    return safeArray(data)
  } catch (error) {
    console.error('Error fetching user sessions:', error)
    return { items: [], total: 0 }
  }
}

export async function forceLogoutSession(sessionId) {
  const { data } = await api.delete(`/admin/sessions/${sessionId}`)
  return data
}

export async function logoutAllSessions(userId) {
  const { data } = await api.post(`/admin/users/${userId}/sessions/logout-all`)
  return data
}
