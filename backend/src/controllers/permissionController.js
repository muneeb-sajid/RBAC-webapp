import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import {
  listPermissions,
  findPermissionByName,
  createPermission,
  findRoleById,
  assignPermissionsToRole,
  revokePermissionsFromRole,
} from '../data/store.js'

const PERMISSION_NAME_RE = /^[a-z0-9]+\.[a-z0-9]+$/

export const getPermissions = asyncHandler(async (req, res) => {
  const { search = '', module = 'all', type = 'all' } = req.query
  const result = await listPermissions({ search, module, type })
  res.json(result)
})

export const postPermission = asyncHandler(async (req, res) => {
  const { name, displayName, module, description, status = 'active' } = req.body

  if (!name || !displayName || !module || !description) {
    throw ApiError.badRequest('Name, display name, module, and description are all required.')
  }
  if (!PERMISSION_NAME_RE.test(name)) {
    throw ApiError.badRequest('Permission name must be in the format module.action, e.g. users.create.')
  }
  if (await findPermissionByName(name)) {
    throw ApiError.conflict('A permission with that name already exists.')
  }

  const created = await createPermission({ name, displayName, module, description, status })
  res.status(201).json(created)
})

export const assignPermissions = asyncHandler(async (req, res) => {
  const { roleId, permissionNames } = req.body

  if (!roleId || !Array.isArray(permissionNames) || permissionNames.length === 0) {
    throw ApiError.badRequest('roleId and a non-empty permissionNames array are required.')
  }
  if (!await findRoleById(roleId)) {
    throw ApiError.notFound('Role not found.')
  }

  const updated = await assignPermissionsToRole(roleId, permissionNames)
  res.json(updated)
})

export const revokePermissions = asyncHandler(async (req, res) => {
  const { roleId, permissionNames } = req.body

  if (!roleId || !Array.isArray(permissionNames) || permissionNames.length === 0) {
    throw ApiError.badRequest('roleId and a non-empty permissionNames array are required.')
  }
  if (!await findRoleById(roleId)) {
    throw ApiError.notFound('Role not found.')
  }

  const updated = await revokePermissionsFromRole(roleId, permissionNames)
  res.json(updated)
})
