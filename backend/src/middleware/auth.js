import { verifyToken } from '../utils/jwt.js'
import { ApiError } from '../utils/ApiError.js'
import { findUserById, sanitizeUser, computeUserPermissions } from '../data/store.js'
import { findActiveSession, touchSession } from '../services/sessionService.js'

// Authentication + session validation, per the flow:
//   Verify JWT -> extract sessionId -> find Session -> check status/expiry
//   -> reject revoked/expired -> touch lastActiveAt -> continue
// This is what makes Force Logout actually terminate a live session instead
// of just hiding a user in the frontend: once a session is REVOKED, every
// subsequent request bearing that JWT is rejected here with 401.
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

    if (payload.sessionId) {
      const session = await findActiveSession(payload.sessionId)
      if (!session) {
        return next(ApiError.unauthorized('Your session is no longer valid. Please sign in again.'))
      }
      if (session.userId !== user._id?.toString() && session.userId !== String(user._id)) {
        return next(ApiError.unauthorized('Session does not belong to this account.'))
      }
      if (session.status !== 'ACTIVE') {
        const message =
          session.status === 'REVOKED'
            ? 'Your session has been terminated by an administrator.'
            : session.status === 'EXPIRED'
            ? 'Your session has expired. Please sign in again.'
            : 'You have been signed out. Please sign in again.'
        return next(ApiError.unauthorized(message))
      }
      // Fire-and-forget: don't block the request on this write.
      touchSession(payload.sessionId)
      req.sessionId = payload.sessionId
    }

    const permissions = await computeUserPermissions(user)
    req.user = { ...sanitizeUser(user), permissions }
    next()
  } catch (err) {
    next(err)
  }
}
