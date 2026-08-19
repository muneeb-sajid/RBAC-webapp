import ActivityLog from '../models/ActivityLog.js'

// Centralized list of recognized actions/modules. This is documentation +
// a light sanity check, not a hard enum on the schema (see ActivityLog.js
// for why), so new call sites are never blocked by a migration.
export const ACTIONS = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  ROLE_ASSIGNED: 'ROLE_ASSIGNED',
  ROLE_REMOVED: 'ROLE_REMOVED',
  PERMISSION_ASSIGNED: 'PERMISSION_ASSIGNED',
  PERMISSION_REVOKED: 'PERMISSION_REVOKED',
  SESSION_REVOKED: 'SESSION_REVOKED',
  FORCE_LOGOUT: 'FORCE_LOGOUT',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  ROLE_CREATED: 'ROLE_CREATED',
  ROLE_UPDATED: 'ROLE_UPDATED',
  ROLE_DELETED: 'ROLE_DELETED',
  MODULE_ACCESS_CHANGED: 'MODULE_ACCESS_CHANGED',
}

export const MODULES = {
  AUTH: 'Authentication',
  USERS: 'Users',
  ROLES: 'Roles',
  PERMISSIONS: 'Permissions',
  SESSIONS: 'Sessions',
  ACCOUNT: 'Account',
}

/**
 * Write a single activity/audit record. Never throws — logging should
 * never take down the primary request. Callers await it anyway so writes
 * are ordered, but failures are swallowed (and reported to stderr).
 */
export async function logActivity({
  userId = null,
  action,
  module,
  description,
  status = 'SUCCESS',
  targetId = null,
  targetType = null,
  performedBy = null,
  ipAddress = null,
  userAgent = null,
  device = null,
  metadata = {},
}) {
  try {
    await ActivityLog.create({
      userId,
      action,
      module,
      description,
      status,
      targetId,
      targetType,
      performedBy: performedBy ?? userId,
      ipAddress,
      userAgent,
      device,
      metadata,
    })
  } catch (err) {
    // Never let audit-logging failures break the request they're logging.
    console.error('Failed to write activity log:', err.message)
  }
}

function toObj(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc }
  obj.id = obj._id.toString()
  delete obj._id
  delete obj.__v
  return obj
}

export async function listActivity({
  userId,
  module,
  action,
  search = '',
  dateFrom,
  dateTo,
  ipAddress,
  page = 1,
  pageSize = 100,
} = {}) {
  const filter = {}
  if (userId) filter.userId = userId
  if (module) filter.module = module
  if (action) filter.action = action
  if (ipAddress) filter.ipAddress = ipAddress
  if (dateFrom || dateTo) {
    filter.createdAt = {}
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
    if (dateTo) filter.createdAt.$lte = new Date(dateTo)
  }
  if (search) {
    filter.description = { $regex: search, $options: 'i' }
  }

  const size = Math.min(Number(pageSize) || 100, 100)
  const pg = Math.max(Number(page) || 1, 1)

  const total = await ActivityLog.countDocuments(filter)
  const docs = await ActivityLog.find(filter)
    .populate('userId', 'name email avatarColor')
    .populate('performedBy', 'name email avatarColor')
    .sort({ createdAt: -1 })
    .skip((pg - 1) * size)
    .limit(size)
    .lean()

  const items = docs.map((d) => {
    const obj = { ...d }
    obj.id = obj._id.toString()
    delete obj._id
    delete obj.__v
    if (obj.userId && obj.userId._id) {
      obj.user = { id: obj.userId._id.toString(), name: obj.userId.name, email: obj.userId.email, avatarColor: obj.userId.avatarColor }
    } else {
      obj.user = null
    }
    if (obj.performedBy && obj.performedBy._id) {
      obj.performer = { id: obj.performedBy._id.toString(), name: obj.performedBy.name, email: obj.performedBy.email }
    } else {
      obj.performer = null
    }
    obj.userId = obj.userId?._id ? obj.userId._id.toString() : obj.userId
    obj.performedBy = obj.performedBy?._id ? obj.performedBy._id.toString() : obj.performedBy
    return obj
  })

  return { items, total, page: pg, pageSize: size }
}

export async function listRecentActivityForUser(userId, limit = 8) {
  const docs = await ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean()
  return docs.map((d) => ({ ...d, id: d._id.toString(), _id: undefined, __v: undefined }))
}
