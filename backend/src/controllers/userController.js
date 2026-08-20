import bcrypt from 'bcryptjs'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import {
  listUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  sanitizeUser,
  getUserEffectivePermissions,
} from '../data/store.js'
import { getRequestContext } from '../utils/requestContext.js'
import { logActivity, ACTIONS, MODULES } from '../services/activityService.js'
import { revokeAllSessionsForUser } from '../services/sessionService.js'
import { sendEmail } from '../services/emailService.js'


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SALT_ROUNDS = 10

export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 10, search = '', status = 'all', role = 'all' } = req.query
  const result = await listUsers({ page: Number(page), pageSize: Number(pageSize), search, status, role })
  res.json(result)
})

export const getUser = asyncHandler(async (req, res) => {
  const user = await findUserById(req.params.id)
  if (!user) throw ApiError.notFound('User not found.')
  res.json(sanitizeUser(user))
})

export const postUser = asyncHandler(async (req, res) => {
  const { name, email, password, roles = [], status = 'active' } = req.body
  const ctx = getRequestContext(req)

  if (!name || !email) {
    throw ApiError.badRequest('Name and email are required.')
  }
  if (!EMAIL_RE.test(email)) {
    throw ApiError.badRequest('Enter a valid email address.')
  }
  if (await findUserByEmail(email)) {
    throw ApiError.conflict('A user with that email already exists.')
  }
  if (password && password.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters.')
  }

  const passwordHash = password ? await bcrypt.hash(password, SALT_ROUNDS) : null
  // createdBy tracks the admin performing this creation (req.user is
  // guaranteed by requireAuth on this route).
  const created = await createUser({ name, email, passwordHash, roles, status, createdBy: req.user.id })

  await logActivity({
    userId: created.id,
    action: ACTIONS.USER_CREATED,
    module: MODULES.USERS,
    description: `Created user "${created.name}"`,
    performedBy: req.user.id,
    targetId: created.id,
    targetType: 'User',
    ...ctx,
  })
   await sendEmail({
    to: created.email,
    subject:"Welcome To Sentinal",
    html:`
    <h1>Welcome ${created.name}</h1>
    <p> Your Account has been created Successfully</p>
    <p> Your Initial Crediantials to login </p>
    <p> Email: <b> ${created.email} </b></p>
    <p> Password:<b> ${password}</b></p>

    <p>After login please change your password!</p>
    `
   })
  res.status(201).json(created)
})

export const putUser = asyncHandler(async (req, res) => {
  const existing = await findUserById(req.params.id)
  if (!existing) throw ApiError.notFound('User not found.')
  const ctx = getRequestContext(req)

  const { name, email, roles, status, directPermissions } = req.body
  if (email && email !== existing.email) {
    if (!EMAIL_RE.test(email)) throw ApiError.badRequest('Enter a valid email address.')
    if (await findUserByEmail(email)) throw ApiError.conflict('A user with that email already exists.')
  }

  const patch = {}
  if (name !== undefined) patch.name = name
  if (email !== undefined) patch.email = email
  if (roles !== undefined) patch.roles = roles
  if (status !== undefined) patch.status = status
  if (directPermissions !== undefined) patch.directPermissions = directPermissions

  const updated = await updateUser(req.params.id, patch)

  await logActivity({
    userId: req.params.id,
    action: ACTIONS.USER_UPDATED,
    module: MODULES.USERS,
    description: `Updated user "${existing.name}"`,
    performedBy: req.user.id,
    targetId: req.params.id,
    targetType: 'User',
    ...ctx,
    metadata: { patch },
  })

  // A role change or suspension can revoke access mid-session — force a
  // re-check by ending active sessions when status changes away from active.
  if (status && status !== 'active' && existing.status === 'active') {
    await revokeAllSessionsForUser(req.params.id, req.user.id, `Account status changed to "${status}"`)
  }

  res.json(updated)
})

export const removeUser = asyncHandler(async (req, res) => {
  if (req.user?.id === req.params.id) {
    throw ApiError.badRequest('You cannot delete your own account while signed in.')
  }
  const existing = await findUserById(req.params.id)
  if (!existing) throw ApiError.notFound('User not found.')
  const ctx = getRequestContext(req)

  const deleted = await deleteUser(req.params.id)
  if (!deleted) throw ApiError.notFound('User not found.')

  await revokeAllSessionsForUser(req.params.id, req.user.id, 'Account deleted')

  await logActivity({
    userId: req.params.id,
    action: ACTIONS.USER_DELETED,
    module: MODULES.USERS,
    description: `Deleted user "${existing.name}"`,
    performedBy: req.user.id,
    targetId: req.params.id,
    targetType: 'User',
    ...ctx,
  })

  res.json({ success: true })
})

export const getUserPermissions = asyncHandler(async (req, res) => {
  const result = await getUserEffectivePermissions(req.params.id)
  if (!result) throw ApiError.notFound('User not found.')
  res.json(result)
})
