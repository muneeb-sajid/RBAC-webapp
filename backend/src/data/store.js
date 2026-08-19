/**
 * store.js — MongoDB-backed data layer.
 *
 * Every controller and middleware imports from here, not from Mongoose models
 * directly. This keeps the rest of the codebase unchanged and makes the
 * storage layer easy to swap in the future.
 *
 * Public API is identical to the original in-memory version so no callers
 * needed to change.
 */

import User from '../models/User.js'
import Role from '../models/Role.js'
import Permission, { MODULES } from '../models/Permission.js'
import { ApiError } from '../utils/ApiError.js'

export { MODULES }

// initStore() is called from server.js before the app starts.
// With MongoDB the DB connection is established in connectDB(); this function
// is a no-op kept for API compatibility so server.js needs no edits.
export async function initStore() {
  // no-op: connection handled in connectDB() called from server.js
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function sanitizeUser(doc) {
  if (!doc) return null
  const obj = doc.toObject ? doc.toObject() : { ...doc }
  delete obj.passwordHash
  delete obj.__v
  // Rename _id → id for API compatibility with the original contract
  if (obj._id) {
    obj.id = obj._id.toString()
    delete obj._id
  }
  return obj
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function findUserByEmail(email) {
  // Include passwordHash so callers (auth) can compare it.
  return User.findOne({ email: email.toLowerCase() }).select('+passwordHash').lean()
}

export async function findUserById(id) {
  if (!id || !isValidId(id)) return null
  return User.findById(id).select('+passwordHash').lean()
}

export async function listUsers({ page = 1, pageSize = 10, search = '', status = 'all', role = 'all' } = {}) {
  const filter = {}
  if (search) {
    const q = search.toLowerCase()
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ]
  }
  if (status !== 'all') filter.status = status
  if (role !== 'all') filter.roles = role

  const total = await User.countDocuments(filter)
  const docs = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(pageSize))
    .limit(Number(pageSize))
    .lean()

  const items = docs.map((u) => {
    const sanitized = { ...u }
    delete sanitized.passwordHash
    delete sanitized.__v
    sanitized.id = sanitized._id.toString()
    delete sanitized._id
    return sanitized
  })

  return { items, total, page: Number(page), pageSize: Number(pageSize) }
}

export async function createUser({ name, email, passwordHash, roles: userRoles = [], status = 'active', avatarColor = '#4F46E5', createdBy = null }) {
  const doc = await User.create({ name, email, passwordHash: passwordHash || null, roles: userRoles, status, avatarColor, createdBy })
  return sanitizeUser(doc)
}

export async function updateUser(id, patch) {
  if (!isValidId(id)) return null
  const doc = await User.findByIdAndUpdate(id, { $set: patch }, { new: true, runValidators: true })
  return sanitizeUser(doc)
}

export async function deleteUser(id) {
  if (!isValidId(id)) return false
  const result = await User.findByIdAndDelete(id)
  return result !== null
}

export function sanitizeUserObj(user) {
  if (!user) return null
  const obj = { ...user }
  delete obj.passwordHash
  delete obj.__v
  if (obj._id) {
    obj.id = obj._id.toString()
    delete obj._id
  }
  return obj
}

// Keep original exported name used by controllers
export { sanitizeUserObj as sanitizeUser }

export async function getUserEffectivePermissions(id) {
  if (!isValidId(id)) return null
  const user = await User.findById(id).lean()
  if (!user) return null

  const userRoles = await Role.find({ name: { $in: user.roles } }).lean()
  const rolePermissions = new Set()
  userRoles.forEach((r) => r.permissions.forEach((p) => rolePermissions.add(p)))

  const directPermissions = user.directPermissions || []
  const effective = new Set([...rolePermissions, ...directPermissions])

  return {
    roles: user.roles,
    rolePermissions: Array.from(rolePermissions),
    directPermissions: [...directPermissions],
    effectivePermissions: Array.from(effective),
  }
}

export async function computeUserPermissions(user) {
  // user may be a lean object with _id or id
  const id = user.id || (user._id && user._id.toString())
  const result = await getUserEffectivePermissions(id)
  return result?.effectivePermissions || []
}

// ─── Roles ───────────────────────────────────────────────────────────────────

export async function listRoles({ search = '' } = {}) {
  const filter = {}
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  const docs = await Role.find(filter).sort({ createdAt: -1 }).lean()

  // Attach live user counts in one query instead of N queries
  const roleNames = docs.map((r) => r.name)
  const counts = await User.aggregate([
    { $match: { roles: { $in: roleNames } } },
    { $unwind: '$roles' },
    { $match: { roles: { $in: roleNames } } },
    { $group: { _id: '$roles', count: { $sum: 1 } } },
  ])
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]))

  const items = docs.map((r) => ({
    ...r,
    id: r._id.toString(),
    _id: undefined,
    __v: undefined,
    usersCount: countMap[r.name] || 0,
    permissionsCount: r.permissions.length,
  }))

  return { items, total: items.length }
}

export async function findRoleById(id) {
  if (!isValidId(id)) return null
  return Role.findById(id).lean()
}

export async function findRoleByName(name) {
  return Role.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') }).lean()
}

export async function getRoleWithUsers(id) {
  if (!isValidId(id)) return null
  const role = await Role.findById(id).lean()
  if (!role) return null

  const usersWithRole = await User.find({ roles: role.name }, { name: 1, email: 1 }).lean()
  return {
    ...role,
    id: role._id.toString(),
    _id: undefined,
    __v: undefined,
    users: usersWithRole.map((u) => ({ id: u._id.toString(), name: u.name, email: u.email })),
  }
}

export async function createRole({ name, description, status = 'active', permissions: rolePermissions = [], isSystemRole = false, createdBy = null }) {
  const doc = await Role.create({ name, description, status, permissions: rolePermissions, isSystemRole, createdBy })
  const obj = doc.toObject()
  obj.id = obj._id.toString()
  delete obj._id
  delete obj.__v
  return obj
}

// System roles (isSystemRole: true) may have their permission set edited,
// but their name is protected from being changed — renaming would break
// the string-based role/permission contract used throughout the app.
export async function updateRole(id, patch) {
  if (!isValidId(id)) return null
  const existing = await Role.findById(id).lean()
  if (!existing) return null
  const safePatch = { ...patch }
  if (existing.isSystemRole && safePatch.name && safePatch.name !== existing.name) {
    throw new ApiError(400, 'System roles cannot be renamed.')
  }
  // isSystemRole itself is never editable via the generic update path.
  delete safePatch.isSystemRole
  const doc = await Role.findByIdAndUpdate(id, { $set: safePatch }, { new: true, runValidators: true })
  if (!doc) return null
  const obj = doc.toObject()
  obj.id = obj._id.toString()
  delete obj._id
  delete obj.__v
  return obj
}

export async function deleteRole(id) {
  if (!isValidId(id)) return false
  const existing = await Role.findById(id).lean()
  if (!existing) return false
  if (existing.isSystemRole) {
    throw new ApiError(400, 'System roles are protected and cannot be deleted.')
  }
  const result = await Role.findByIdAndDelete(id)
  return result !== null
}

export async function listAllRoles() {
  const docs = await Role.find().sort({ name: 1 }).lean()
  return docs.map((r) => ({ ...r, id: r._id.toString(), _id: undefined, __v: undefined }))
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export async function listPermissions({ search = '', module = 'all', type = 'all' } = {}) {
  const filter = {}
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { displayName: { $regex: search, $options: 'i' } },
    ]
  }
  if (module !== 'all') filter.module = module
  if (type !== 'all') filter.name = { $regex: `\\.${escapeRegex(type)}$` }

  const docs = await Permission.find(filter).sort({ module: 1, name: 1 }).lean()

  // Fetch which roles have each permission in a single query
  const roles = await Role.find({}, { name: 1, permissions: 1 }).lean()

  const items = docs.map((p) => ({
    ...p,
    id: p._id.toString(),
    _id: undefined,
    __v: undefined,
    assignedRoles: roles.filter((r) => r.permissions.includes(p.name)).map((r) => r.name),
  }))

  return { items, total: items.length }
}

export async function findPermissionByName(name) {
  return Permission.findOne({ name }).lean()
}

export async function createPermission({ name, displayName, module, description, status = 'active' }) {
  const doc = await Permission.create({ name, displayName, module, description, status })
  const obj = doc.toObject()
  obj.id = obj._id.toString()
  delete obj._id
  delete obj.__v
  return obj
}

export async function assignPermissionsToRole(roleId, names) {
  if (!isValidId(roleId)) return null
  const doc = await Role.findByIdAndUpdate(
    roleId,
    { $addToSet: { permissions: { $each: names } } },
    { new: true }
  )
  if (!doc) return null
  const obj = doc.toObject()
  obj.id = obj._id.toString()
  delete obj._id
  delete obj.__v
  return obj
}

export async function revokePermissionsFromRole(roleId, names) {
  if (!isValidId(roleId)) return null
  const doc = await Role.findByIdAndUpdate(
    roleId,
    { $pull: { permissions: { $in: names } } },
    { new: true }
  )
  if (!doc) return null
  const obj = doc.toObject()
  obj.id = obj._id.toString()
  delete obj._id
  delete obj.__v
  return obj
}

export async function listAllPermissionNames() {
  const docs = await Permission.find({}, { name: 1 }).lean()
  return docs.map((p) => p.name)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

import mongoose from 'mongoose'

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
