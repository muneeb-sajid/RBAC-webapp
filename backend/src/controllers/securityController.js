import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { findUserById } from '../data/store.js'
import { getRequestContext } from '../utils/requestContext.js'
import { logActivity, listActivity, listRecentActivityForUser, ACTIONS, MODULES } from '../services/activityService.js'
import {
  listSessions,
  listSessionsForUser,
  findSessionById,
  revokeSession,
  revokeAllSessionsForUser,
} from '../services/sessionService.js'

const IDLE_THRESHOLD_MS = 5 * 60 * 1000 // idle if no activity in the last 5 minutes

function withPresence(session) {
  const idleMs = Date.now() - new Date(session.lastActiveAt).getTime()
  return {
    ...session,
    presence: session.status !== 'ACTIVE' ? 'offline' : idleMs > IDLE_THRESHOLD_MS ? 'idle' : 'active',
  }
}

// GET /admin/login-activity — global login/logout/failed-login history.
export const getLoginActivity = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 20, userId, status, search = '', dateFrom, dateTo, device, ipAddress } = req.query

  const result = await listActivity({
    userId,
    module: MODULES.AUTH,
    search,
    dateFrom,
    dateTo,
    ipAddress,
    page,
    pageSize,
  })

  let items = result.items
  if (status && status !== 'all') {
    items = items.filter((i) => i.status === status.toUpperCase())
  }
  if (device) {
    items = items.filter((i) => (i.device || '').toLowerCase().includes(device.toLowerCase()))
  }

  res.json({ ...result, items })
})

// GET /admin/users/:id/login-history
export const getUserLoginHistory = asyncHandler(async (req, res) => {
  const user = await findUserById(req.params.id)
  if (!user) throw ApiError.notFound('User not found.')

  const result = await listActivity({ userId: req.params.id, module: MODULES.AUTH, page: 1, pageSize: 50 })
  res.json(result)
})

// GET /admin/users/:id/activity — recent activity, or full paginated history.
export const getUserActivity = asyncHandler(async (req, res) => {
  const user = await findUserById(req.params.id)
  if (!user) throw ApiError.notFound('User not found.')

  const { recent, page = 1, pageSize = 100, module, action, dateFrom, dateTo, search = '' } = req.query

  if (recent) {
    const items = await listRecentActivityForUser(req.params.id, Number(recent) || 8)
    return res.json({ items })
  }

  const result = await listActivity({
    userId: req.params.id,
    module: module && module !== 'all' ? module : undefined,
    action: action && action !== 'all' ? action : undefined,
    dateFrom,
    dateTo,
    search,
    page,
    pageSize,
  })
  res.json(result)
})

// GET /admin/activity — global audit log across the whole system.
export const getGlobalActivity = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 100, module, action, userId, dateFrom, dateTo, search = '', ipAddress } = req.query

  const result = await listActivity({
    userId,
    module: module && module !== 'all' ? module : undefined,
    action: action && action !== 'all' ? action : undefined,
    dateFrom,
    dateTo,
    search,
    ipAddress,
    page,
    pageSize,
  })
  res.json(result)
})

// GET /admin/sessions — all sessions (active-session detection dashboard).
export const getSessions = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 20, status = 'ACTIVE' } = req.query
  const result = await listSessions({ status, page, pageSize })
  res.json({ ...result, items: result.items.map(withPresence) })
})

// GET /admin/users/:id/sessions
export const getUserSessions = asyncHandler(async (req, res) => {
  const user = await findUserById(req.params.id)
  if (!user) throw ApiError.notFound('User not found.')

  const sessions = await listSessionsForUser(req.params.id)
  res.json({ items: sessions.map(withPresence), total: sessions.length })
})

// DELETE /admin/sessions/:sessionId — Force Logout for a single session.
export const forceLogoutSession = asyncHandler(async (req, res) => {
  const ctx = getRequestContext(req)
  const target = await findSessionById(req.params.sessionId)
  if (!target) throw ApiError.notFound('Session not found.')
  if (target.status !== 'ACTIVE') throw ApiError.badRequest('This session is not active.')

  const revoked = await revokeSession(target.sessionId, req.user.id, 'Force logout by administrator')

  await logActivity({
    userId: target.userId,
    action: ACTIONS.FORCE_LOGOUT,
    module: MODULES.SESSIONS,
    description: `Session on ${target.device} was force logged out by an administrator`,
    performedBy: req.user.id,
    targetId: target.sessionId,
    targetType: 'Session',
    ...ctx,
  })
  await logActivity({
    userId: target.userId,
    action: ACTIONS.SESSION_REVOKED,
    module: MODULES.SESSIONS,
    description: `Session on ${target.device} was revoked`,
    performedBy: req.user.id,
    targetId: target.sessionId,
    targetType: 'Session',
    ...ctx,
  })

  res.json(revoked)
})

// POST /admin/users/:id/sessions/logout-all — revoke every active session
// belonging to a user in one action.
export const logoutAllSessions = asyncHandler(async (req, res) => {
  const user = await findUserById(req.params.id)
  if (!user) throw ApiError.notFound('User not found.')
  const ctx = getRequestContext(req)

  const count = await revokeAllSessionsForUser(req.params.id, req.user.id, 'Logged out of all sessions by administrator')

  await logActivity({
    userId: req.params.id,
    action: ACTIONS.FORCE_LOGOUT,
    module: MODULES.SESSIONS,
    description: `All sessions (${count}) for "${user.name}" were logged out by an administrator`,
    performedBy: req.user.id,
    targetId: req.params.id,
    targetType: 'User',
    ...ctx,
    metadata: { revokedCount: count },
  })

  res.json({ success: true, revokedCount: count })
})
