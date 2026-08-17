import { ApiError } from '../utils/ApiError.js'

// requirePermission('users.create') - user must have this exact permission.
// requirePermission(['users.view', 'roles.view'], { any: true }) - at least one.
export function requirePermission(permission, { any = false } = {}) {
  const required = Array.isArray(permission) ? permission : [permission]

  return function permissionCheck(req, res, next) {
    if (!req.user) {
      return next(ApiError.unauthorized())
    }
    const userPermissions = req.user.permissions || []
    const allowed = any ? required.some((p) => userPermissions.includes(p)) : required.every((p) => userPermissions.includes(p))

    if (!allowed) {
      return next(ApiError.forbidden(`This action requires the "${required.join(', ')}" permission.`))
    }
    next()
  }
}
