import bcrypt from 'bcryptjs'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { signToken } from '../utils/jwt.js'
import { findUserByEmail, createUser, updateUser, sanitizeUser, computeUserPermissions, findUserById } from '../data/store.js'
import { getRequestContext } from '../utils/requestContext.js'
import { logActivity, ACTIONS, MODULES } from '../services/activityService.js'
import { createSession, endSessionOnLogout } from '../services/sessionService.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SALT_ROUNDS = 10

async function withPermissions(user) {
  const sanitized = sanitizeUser(user)
  const permissions = await computeUserPermissions(user)
  return { ...sanitized, permissions }
}

// Login flow:
//   find user -> check password -> success/failed activity ->
//   create session (on success) -> sign JWT{sub, sessionId} -> respond
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const ctx = getRequestContext(req)

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required.')
  }

  const user = await findUserByEmail(email)

  if (!user || !user.passwordHash) {
    await logActivity({
      userId: user?._id || null,
      action: ACTIONS.LOGIN_FAILED,
      module: MODULES.AUTH,
      description: `Failed login attempt for ${email}`,
      status: 'FAILED',
      performedBy: user?._id || null,
      ...ctx,
      metadata: { email },
    })
    throw ApiError.unauthorized('Invalid email or password.')
  }

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) {
    await logActivity({
      userId: user._id,
      action: ACTIONS.LOGIN_FAILED,
      module: MODULES.AUTH,
      description: `Failed login attempt for ${email}`,
      status: 'FAILED',
      performedBy: user._id,
      ...ctx,
      metadata: { email },
    })
    throw ApiError.unauthorized('Invalid email or password.')
  }

  await updateUser(user._id.toString(), { lastLogin: new Date() })
  const refreshed = await findUserById(user._id.toString())

  const session = await createSession({
    userId: user._id,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    device: ctx.device,
    browser: ctx.browser,
  })

  await logActivity({
    userId: user._id,
    action: ACTIONS.LOGIN,
    module: MODULES.AUTH,
    description: `Signed in from ${ctx.device}`,
    status: 'SUCCESS',
    performedBy: user._id,
    ...ctx,
    metadata: { sessionId: session.sessionId },
  })

  const token = signToken({ sub: user._id.toString(), sessionId: session.sessionId })
  res.json({ user: await withPermissions(refreshed), token })
})

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body
  const ctx = getRequestContext(req)

  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email, and password are required.')
  }
  if (!EMAIL_RE.test(email)) {
    throw ApiError.badRequest('Enter a valid email address.')
  }
  if (password.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters.')
  }
  if (await findUserByEmail(email)) {
    throw ApiError.conflict('An account with that email already exists.')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const created = await createUser({
    name,
    email,
    passwordHash,
    roles: [role || 'User'],
    status: 'active',
  })

  const session = await createSession({
    userId: created.id,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    device: ctx.device,
    browser: ctx.browser,
  })

  await logActivity({
    userId: created.id,
    action: ACTIONS.USER_CREATED,
    module: MODULES.USERS,
    description: `${created.name} registered a new account`,
    performedBy: created.id,
    targetId: created.id,
    targetType: 'User',
    ...ctx,
  })
  await logActivity({
    userId: created.id,
    action: ACTIONS.LOGIN,
    module: MODULES.AUTH,
    description: `Signed in from ${ctx.device}`,
    performedBy: created.id,
    ...ctx,
    metadata: { sessionId: session.sessionId },
  })

  const token = signToken({ sub: created.id, sessionId: session.sessionId })
  res.status(201).json({ user: await withPermissions(created), token })
})

export const logout = asyncHandler(async (req, res) => {
  const ctx = getRequestContext(req)

  if (req.sessionId) {
    await endSessionOnLogout(req.sessionId)
  }

  await logActivity({
    userId: req.user.id,
    action: ACTIONS.LOGOUT,
    module: MODULES.AUTH,
    description: `Signed out from ${ctx.device}`,
    performedBy: req.user.id,
    ...ctx,
    metadata: { sessionId: req.sessionId || null },
  })

  res.json({ success: true })
})

export const me = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id)
  if (!user) throw ApiError.notFound('Account no longer exists.')
  res.json(await withPermissions(user))
})
