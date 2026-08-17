import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permission.js'
import { getUsers, getUser, postUser, putUser, removeUser, getUserPermissions } from '../controllers/userController.js'

const router = Router()

router.use(requireAuth)

router.get('/', requirePermission('users.view'), getUsers)
router.post('/', requirePermission('users.create'), postUser)
router.get('/:id', requirePermission('users.view'), getUser)
router.put('/:id', requirePermission('users.update'), putUser)
router.delete('/:id', requirePermission('users.delete'), removeUser)
router.get('/:id/permissions', requirePermission('users.view'), getUserPermissions)

export default router
