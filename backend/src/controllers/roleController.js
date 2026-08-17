import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { listRoles, findRoleById, findRoleByName, getRoleWithUsers, createRole, updateRole, deleteRole, listAllRoles } from '../data/store.js'

export const getRoles = asyncHandler(async (req, res) => {
  const { search = '' } = req.query
  const result = await listRoles({ search })
  res.json(result)
})

export const getAllRoles = asyncHandler(async (req, res) => {
  res.json(await listAllRoles())
})

export const getRole = asyncHandler(async (req, res) => {
  const role = await getRoleWithUsers(req.params.id)
  if (!role) throw ApiError.notFound('Role not found.')
  res.json(role)
})

export const postRole = asyncHandler(async (req, res) => {
  const { name, description, status = 'active', permissions = [] } = req.body

  if (!name || !description) {
    throw ApiError.badRequest('Role name and description are required.')
  }
  if (await findRoleByName(name)) {
    throw ApiError.conflict('A role with that name already exists.')
  }

  const created = await createRole({ name, description, status, permissions })
  res.status(201).json(created)
})

export const putRole = asyncHandler(async (req, res) => {
  const existing = await findRoleById(req.params.id)
  if (!existing) throw ApiError.notFound('Role not found.')

  const { name, description, status, permissions } = req.body
  if (name && name !== existing.name && await findRoleByName(name)) {
    throw ApiError.conflict('A role with that name already exists.')
  }

  const patch = {}
  if (name !== undefined) patch.name = name
  if (description !== undefined) patch.description = description
  if (status !== undefined) patch.status = status
  if (permissions !== undefined) patch.permissions = permissions

  const updated = await updateRole(req.params.id, patch)
  res.json(updated)
})

export const removeRole = asyncHandler(async (req, res) => {
  const deleted = await deleteRole(req.params.id)
  if (!deleted) throw ApiError.notFound('Role not found.')
  res.json({ success: true })
})
