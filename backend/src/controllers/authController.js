import bcrypt from 'bcryptjs'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { signToken } from '../utils/jwt.js'
import { findUserByEmail, createUser, updateUser, sanitizeUser, computeUserPermissions, findUserById } from '../data/store.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SALT_ROUNDS = 10

async function withPermissions(user) {
  const sanitized = sanitizeUser(user)
  const permissions = await computeUserPermissions(user)
  return { ...sanitized, permissions }
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required.')
  }

  const user = await findUserByEmail(email)
  if (!user || !user.passwordHash) {
    throw ApiError.unauthorized('Invalid email or password.')
  }

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) {
    throw ApiError.unauthorized('Invalid email or password.')
  }

  await updateUser(user._id.toString(), { lastLogin: new Date() })
  const refreshed = await findUserById(user._id.toString())

  const token = signToken({ sub: user._id.toString() })
  res.json({ user: await withPermissions(refreshed), token })
})

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body

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

  const token = signToken({ sub: created.id })
  res.status(201).json({ user: await withPermissions(created), token })
})

export const logout = asyncHandler(async (req, res) => {
  // Stateless JWTs: nothing to invalidate server-side.
  res.json({ success: true })
})

export const me = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id)
  if (!user) throw ApiError.notFound('Account no longer exists.')
  res.json(await withPermissions(user))
})
