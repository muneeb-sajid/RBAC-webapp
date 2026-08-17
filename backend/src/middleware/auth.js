import { verifyToken } from '../utils/jwt.js'
import { ApiError } from '../utils/ApiError.js'
import { findUserById, sanitizeUser, computeUserPermissions } from '../data/store.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return next(ApiError.unauthorized('Missing or invalid Authorization header.'))
  }

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    return next(ApiError.unauthorized('Your session has expired. Please sign in again.'))
  }

  try {
    const user = await findUserById(payload.sub)
    if (!user) {
      return next(ApiError.unauthorized('Account no longer exists.'))
    }

    const permissions = await computeUserPermissions(user)
    req.user = { ...sanitizeUser(user), permissions }
    next()
  } catch (err) {
    next(err)
  }
}
