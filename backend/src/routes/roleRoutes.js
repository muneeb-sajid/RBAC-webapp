import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permission.js'
import { getRoles, getAllRoles, getRole, postRole, putRole, removeRole } from '../controllers/roleController.js'

const router = Router()

router.use(requireAuth)

router.get('/', requirePermission('roles.view'), getRoles)
// Unpaginated list for dropdowns (Assign/Revoke Permissions pages).
router.get('/all/list', requirePermission('roles.view'), getAllRoles)
router.post('/', requirePermission('roles.create'), postRole)
router.get('/:id', requirePermission('roles.view'), getRole)
router.put('/:id', requirePermission('roles.update'), putRole)
router.delete('/:id', requirePermission('roles.delete'), removeRole)

export default router
