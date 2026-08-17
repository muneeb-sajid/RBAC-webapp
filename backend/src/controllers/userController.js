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
  const created = await createUser({ name, email, passwordHash, roles, status })
  res.status(201).json(created)
})

export const putUser = asyncHandler(async (req, res) => {
  const existing = await findUserById(req.params.id)
  if (!existing) throw ApiError.notFound('User not found.')

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
  res.json(updated)
})

export const removeUser = asyncHandler(async (req, res) => {
  if (req.user?.id === req.params.id) {
    throw ApiError.badRequest('You cannot delete your own account while signed in.')
  }
  const deleted = await deleteUser(req.params.id)
  if (!deleted) throw ApiError.notFound('User not found.')
  res.json({ success: true })
})

export const getUserPermissions = asyncHandler(async (req, res) => {
  const result = await getUserEffectivePermissions(req.params.id)
  if (!result) throw ApiError.notFound('User not found.')
  res.json(result)
})
