import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permission.js'
import { getPermissions, assignPermissions, revokePermissions } from '../controllers/permissionController.js'

const router = Router()

router.use(requireAuth)

// Permissions are predefined (see seed/seed.js) and are never created
// through the API — there is intentionally no POST / route here.
router.get('/', requirePermission('permissions.view'), getPermissions)
router.post('/assign', requirePermission('permissions.assign'), assignPermissions)
router.post('/revoke', requirePermission('permissions.assign'), revokePermissions)

export default router
