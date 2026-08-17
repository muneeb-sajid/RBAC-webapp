import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permission.js'
import { getPermissions, postPermission, assignPermissions, revokePermissions } from '../controllers/permissionController.js'

const router = Router()

router.use(requireAuth)

router.get('/', requirePermission('permissions.view'), getPermissions)
router.post('/', requirePermission('permissions.create'), postPermission)
router.post('/assign', requirePermission('permissions.update'), assignPermissions)
router.post('/revoke', requirePermission('permissions.update'), revokePermissions)

export default router
