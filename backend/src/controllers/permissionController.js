import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import {
  listPermissions,
  findRoleById,
  assignPermissionsToRole,
  revokePermissionsFromRole,
  listAllPermissionNames,
} from '../data/store.js'
import { getRequestContext } from '../utils/requestContext.js'
import { logActivity, ACTIONS, MODULES } from '../services/activityService.js'

// NOTE: Permissions are predefined (see backend/src/seed/seed.js) and are
// NOT creatable through the API. There is intentionally no `postPermission`
// controller/route — see master implementation prompt section 1. The
// backend is the final authority: only permission names that already exist
// in the Permission collection may be assigned to a role.

export const getPermissions = asyncHandler(async (req, res) => {
  const { search = '', module = 'all', type = 'all' } = req.query
  const result = await listPermissions({ search, module, type })
  res.json(result)
})

export const assignPermissions = asyncHandler(async (req, res) => {
  const { roleId, permissionNames } = req.body
  const ctx = getRequestContext(req)

  if (!roleId || !Array.isArray(permissionNames) || permissionNames.length === 0) {
    throw ApiError.badRequest('roleId and a non-empty permissionNames array are required.')
  }
  const role = await findRoleById(roleId)
  if (!role) {
    throw ApiError.notFound('Role not found.')
  }

  const validNames = await listAllPermissionNames()
  const invalid = permissionNames.filter((p) => !validNames.includes(p))
  if (invalid.length) {
    throw ApiError.badRequest(`Unknown permission(s): ${invalid.join(', ')}`)
  }

  const updated = await assignPermissionsToRole(roleId, permissionNames)

  await logActivity({
    userId: req.user.id,
    action: ACTIONS.PERMISSION_ASSIGNED,
    module: MODULES.PERMISSIONS,
    description: `Assigned ${permissionNames.length} permission(s) to role "${role.name}"`,
    performedBy: req.user.id,
    targetId: roleId,
    targetType: 'Role',
    ...ctx,
    metadata: { permissionNames, roleName: role.name },
  })

  res.json(updated)
})

export const revokePermissions = asyncHandler(async (req, res) => {
  const { roleId, permissionNames } = req.body
  const ctx = getRequestContext(req)

  if (!roleId || !Array.isArray(permissionNames) || permissionNames.length === 0) {
    throw ApiError.badRequest('roleId and a non-empty permissionNames array are required.')
  }
  const role = await findRoleById(roleId)
  if (!role) {
    throw ApiError.notFound('Role not found.')
  }

  const updated = await revokePermissionsFromRole(roleId, permissionNames)

  await logActivity({
    userId: req.user.id,
    action: ACTIONS.PERMISSION_REVOKED,
    module: MODULES.PERMISSIONS,
    description: `Revoked ${permissionNames.length} permission(s) from role "${role.name}"`,
    performedBy: req.user.id,
    targetId: roleId,
    targetType: 'Role',
    ...ctx,
    metadata: { permissionNames, roleName: role.name },
  })

  res.json(updated)
})
